use crate::ws_handler::WSMessage;
use crate::test_data::TestData;
use arrow::array::{Array, ArrayRef, StringArray, UInt64Array};
use arrow::datatypes::{DataType, Field, Schema};
use arrow::record_batch::RecordBatch;
use arrow::ipc::writer::FileWriter;
use std::sync::Arc;
use std::io::Cursor;
use serde_with::skip_serializing_none;

#[skip_serializing_none]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct DataPoint {
    pub topic: String,
    pub time: u64,
    #[serde(skip)]
    pub arrow_data: Option<Arc<dyn Array>>,  // Option to handle serialization
    // For JSON compatibility
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data_json: Option<String>,
}

impl DataPoint {
    pub fn new(topic: String, time: u64, arrow_data: Arc<dyn Array>) -> Self {
        Self {
            topic,
            time,
            arrow_data: Some(arrow_data),
            data_json: None,
        }
    }

    // Create a DataPoint with a JSON string (for compatibility with old code)
    pub fn with_json(topic: String, time: u64, data_json: String) -> Self {
        Self {
            topic,
            time,
            arrow_data: None,
            data_json: Some(data_json),
        }
    }

    pub fn from_test_data(topic: String, time: u64, test_data: &TestData) -> Self {
        // Convert the TestData to a struct array
        let (_, arrow_data) = test_data.to_arrow_struct("data");
        
        Self {
            topic,
            time,
            arrow_data: Some(arrow_data),
            data_json: None,
        }
    }

    pub fn message(&self) -> WSMessage {
        WSMessage::NewDatapoint(self.clone())
    }

    pub fn to_record_batch(&self) -> Result<RecordBatch, arrow::error::ArrowError> {
        // Ensure we have arrow data
        let arrow_data = match &self.arrow_data {
            Some(data) => Arc::clone(data),
            None => {
                // If we only have JSON, convert it to a string array
                let json = self.data_json.clone().unwrap_or_default();
                Arc::new(StringArray::from(vec![json])) as Arc<dyn Array>
            }
        };

        // Create schema for the record batch
        let schema = Schema::new(vec![
            Field::new("topic", DataType::Utf8, false),
            Field::new("time", DataType::UInt64, false),
            Field::new("data", arrow_data.data_type().clone(), false),
        ]);

        // Create arrays for each column
        let topic_array = Arc::new(StringArray::from(vec![self.topic.clone()]));
        let time_array = Arc::new(UInt64Array::from(vec![self.time]));

        // Combine arrays into a record batch
        RecordBatch::try_new(
            Arc::new(schema),
            vec![
                topic_array,
                time_array,
                arrow_data,
            ],
        )
    }

    pub fn to_flattened_record_batch(&self, test_data: &TestData) -> Result<RecordBatch, arrow::error::ArrowError> {
        // Get flattened arrays from TestData
        let flattened_arrays = test_data.to_flattened_arrays();
        
        // Create schema fields
        let mut fields = vec![
            Field::new("topic", DataType::Utf8, false),
            Field::new("time", DataType::UInt64, false),
        ];
        
        // Add fields for each flattened array
        for (name, array) in &flattened_arrays {
            fields.push(Field::new(name, array.data_type().clone(), false));
        }
        
        let schema = Schema::new(fields);
        
        // Create topic and time arrays
        let topic_array = Arc::new(StringArray::from(vec![self.topic.clone()]));
        let time_array = Arc::new(UInt64Array::from(vec![self.time]));
        
        // Combine all arrays
        let mut column_arrays: Vec<ArrayRef> = vec![
            topic_array,
            time_array,
        ];
        
        // Add arrays for each flattened field
        for (_, array) in flattened_arrays {
            column_arrays.push(array);
        }
        
        RecordBatch::try_new(Arc::new(schema), column_arrays)
    }

    pub fn to_ipc_bytes(&self, test_data: &TestData) -> Result<Vec<u8>, arrow::error::ArrowError> {
        let batch = self.to_flattened_record_batch(test_data)?;
        let schema = batch.schema();
        
        // Create buffer to write IPC format
        let mut buffer = Vec::new();
        {
            let mut writer = FileWriter::try_new(&mut buffer, &schema)?;
            writer.write(&batch)?;
            writer.finish()?;
        }
        
        Ok(buffer)
    }

    // Create DataPoint from IPC bytes
    pub fn from_ipc_bytes(bytes: &[u8]) -> Result<(Self, TestData), arrow::error::ArrowError> {
        use arrow::ipc::reader::FileReader;
        
        let cursor = Cursor::new(bytes);
        let mut reader = FileReader::try_new(cursor, None)?;
        
        // Read the first record batch
        if let Some(batch) = reader.next() {
            let batch = batch?;
            
            // Extract topic and time
            let topic_array = batch.column(0).as_any().downcast_ref::<StringArray>()
                .ok_or_else(|| arrow::error::ArrowError::InvalidArgumentError(
                    "Expected topic column to be StringArray".to_string()
                ))?;
            
            let time_array = batch.column(1).as_any().downcast_ref::<UInt64Array>()
                .ok_or_else(|| arrow::error::ArrowError::InvalidArgumentError(
                    "Expected time column to be UInt64Array".to_string()
                ))?;
            
            if topic_array.len() == 0 || time_array.len() == 0 {
                return Err(arrow::error::ArrowError::InvalidArgumentError(
                    "Empty topic or time array".to_string()
                ));
            }
            
            let topic = topic_array.value(0).to_string();
            let time = time_array.value(0);
            
            // We would need to implement the conversion back to TestData
            // This is a placeholder implementation
            let test_data = TestData::new_sin(0.0); // Placeholder
            
            // Create a placeholder arrow_data from the test_data
            let (_, arrow_data) = test_data.to_arrow_struct("data");
            
            let datapoint = DataPoint {
                topic,
                time,
                arrow_data: Some(arrow_data),
                data_json: None,
            };
            
            Ok((datapoint, test_data))
        } else {
            Err(arrow::error::ArrowError::InvalidArgumentError(
                "No record batch found in IPC bytes".to_string()
            ))
        }
    }
}