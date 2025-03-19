#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestVec3{
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl TestVec3{
    pub fn new(x: f64, y: f64, z: f64) -> Self{
        Self{x, y, z}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{x: t.sin(), y: -t.sin(), z: (t + 0.5).sin()}
    }
}

#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestPose{
    pub position: TestVec3,
    pub rotation: TestVec3,
}

impl TestPose{
    pub fn new(position: TestVec3, rotation: TestVec3) -> Self{
        Self{position, rotation}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{position: TestVec3::new_sin(t), rotation: TestVec3::new_sin(t)}
    }
}

#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestData{
    pub pose: TestPose,
    pub velocity: TestVec3,
    pub acceleration: TestVec3,
}   

impl TestData{
    pub fn new(pose: TestPose, velocity: TestVec3, acceleration: TestVec3) -> Self{
        Self{pose, velocity, acceleration}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{pose: TestPose::new_sin(t), velocity: TestVec3::new_sin(t), acceleration: TestVec3::new_sin(t)}
    }
}

// Arrow conversion functionality
use arrow::array::{Array, ArrayRef, Float64Array, StructArray};
use arrow::datatypes::{DataType, Field, Fields, Schema};
use std::sync::Arc;

impl TestVec3 {
    pub fn to_arrow_arrays(&self) -> Vec<(Arc<Field>, ArrayRef)> {
        vec![
            (
                Arc::new(Field::new("x", DataType::Float64, false)),
                Arc::new(Float64Array::from(vec![self.x])),
            ),
            (
                Arc::new(Field::new("y", DataType::Float64, false)),
                Arc::new(Float64Array::from(vec![self.y])),
            ),
            (
                Arc::new(Field::new("z", DataType::Float64, false)),
                Arc::new(Float64Array::from(vec![self.z])),
            ),
        ]
    }

    pub fn to_arrow_struct(&self, name: &str) -> (Arc<Field>, ArrayRef) {
        let arrays = self.to_arrow_arrays();
        
        let fields: Vec<Arc<Field>> = arrays.iter()
            .map(|(field, _)| Arc::clone(field))
            .collect();
        
        let struct_field = Arc::new(Field::new(
            name,
            DataType::Struct(Fields::from(fields)),
            false,
        ));

        (struct_field, Arc::new(StructArray::from(arrays)))
    }
}

impl TestPose {
    pub fn to_arrow_arrays(&self) -> Vec<(Arc<Field>, ArrayRef)> {
        let (position_field, position_array) = self.position.to_arrow_struct("position");
        let (rotation_field, rotation_array) = self.rotation.to_arrow_struct("rotation");
        
        vec![
            (position_field, position_array),
            (rotation_field, rotation_array),
        ]
    }

    pub fn to_arrow_struct(&self, name: &str) -> (Arc<Field>, ArrayRef) {
        let arrays = self.to_arrow_arrays();
        
        let fields: Vec<Arc<Field>> = arrays.iter()
            .map(|(field, _)| Arc::clone(field))
            .collect();
        
        let struct_field = Arc::new(Field::new(
            name,
            DataType::Struct(Fields::from(fields)),
            false,
        ));

        (struct_field, Arc::new(StructArray::from(arrays)))
    }
}

impl TestData {
    pub fn to_arrow_arrays(&self) -> Vec<(Arc<Field>, ArrayRef)> {
        let (pose_field, pose_array) = self.pose.to_arrow_struct("pose");
        let (velocity_field, velocity_array) = self.velocity.to_arrow_struct("velocity");
        let (acceleration_field, acceleration_array) = self.acceleration.to_arrow_struct("acceleration");
        
        vec![
            (pose_field, pose_array),
            (velocity_field, velocity_array),
            (acceleration_field, acceleration_array),
        ]
    }

    pub fn to_arrow_struct(&self, name: &str) -> (Arc<Field>, ArrayRef) {
        let arrays = self.to_arrow_arrays();
        
        let fields: Vec<Arc<Field>> = arrays.iter()
            .map(|(field, _)| Arc::clone(field))
            .collect();
        
        let struct_field = Arc::new(Field::new(
            name,
            DataType::Struct(Fields::from(fields)),
            false,
        ));

        (struct_field, Arc::new(StructArray::from(arrays)))
    }

    pub fn to_flattened_arrays(&self) -> Vec<(String, Arc<dyn Array>)> {
        let mut result = Vec::new();
        
        // Position values
        result.push((
            "position.x".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.position.x])) as Arc<dyn Array>
        ));
        result.push((
            "position.y".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.position.y])) as Arc<dyn Array>
        ));
        result.push((
            "position.z".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.position.z])) as Arc<dyn Array>
        ));
        
        // Rotation values
        result.push((
            "rotation.x".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.rotation.x])) as Arc<dyn Array>
        ));
        result.push((
            "rotation.y".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.rotation.y])) as Arc<dyn Array>
        ));
        result.push((
            "rotation.z".to_string(),
            Arc::new(Float64Array::from(vec![self.pose.rotation.z])) as Arc<dyn Array>
        ));
        
        // Velocity values
        result.push((
            "velocity.x".to_string(),
            Arc::new(Float64Array::from(vec![self.velocity.x])) as Arc<dyn Array>
        ));
        result.push((
            "velocity.y".to_string(),
            Arc::new(Float64Array::from(vec![self.velocity.y])) as Arc<dyn Array>
        ));
        result.push((
            "velocity.z".to_string(),
            Arc::new(Float64Array::from(vec![self.velocity.z])) as Arc<dyn Array>
        ));
        
        // Acceleration values
        result.push((
            "acceleration.x".to_string(),
            Arc::new(Float64Array::from(vec![self.acceleration.x])) as Arc<dyn Array>
        ));
        result.push((
            "acceleration.y".to_string(),
            Arc::new(Float64Array::from(vec![self.acceleration.y])) as Arc<dyn Array>
        ));
        result.push((
            "acceleration.z".to_string(),
            Arc::new(Float64Array::from(vec![self.acceleration.z])) as Arc<dyn Array>
        ));
        
        result
    }
}