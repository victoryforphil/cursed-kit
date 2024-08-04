
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub enum CursedValue{
   Number(f64),
   String(String),
}

pub struct DataStore{
    pub data: BTreeMap<String, BTreeMap<u64,CursedValue>>
}

pub type DataStoreHandle = std::sync::Arc<std::sync::Mutex<DataStore>>;

impl Default for DataStore{
    fn default() -> Self{
        Self{
            data: BTreeMap::new()
        }
    }
}

impl DataStore{
    pub fn new() -> Self{
        Default::default()
    }

    pub fn as_handle(self) -> DataStoreHandle{
        std::sync::Arc::new(std::sync::Mutex::new(self))
    }

    pub fn add_data(&mut self, key: String, time: u64, value: CursedValue){
        if !self.data.contains_key(&key){
            self.data.insert(key.clone(), BTreeMap::new());
        }
        self.data.get_mut(&key).unwrap().insert(time, value);
    }

    pub fn get_data(&self, key: &str) -> Option<&BTreeMap<u64,CursedValue>>{
        self.data.get(key)
    }

    pub fn get_data_at_time(&self, key: &str, time: u64) -> Option<&CursedValue>{
        if let Some(data) = self.data.get(key){
            if let Some((_, value)) = data.range(..=time).next_back(){
                return Some(value);
            }
        }
        None
    }

}