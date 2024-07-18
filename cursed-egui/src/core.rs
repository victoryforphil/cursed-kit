use std::{cell::OnceCell, collections::BTreeMap, sync::{Arc, Mutex}};
pub type CoreHandle = std::sync::Arc<std::sync::Mutex<CursedCore>>;

// Static global core 
pub static mut CORE: OnceCell<CoreHandle> = OnceCell::new();



#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub enum CursedValue{
   Number(f64),
   String(String),
}

#[derive(Debug, Clone, PartialEq)]
pub struct CursedCore{
    pub current_time_ms: u64,
    pub data: BTreeMap<String, BTreeMap<u64,CursedValue>>
}

impl Default for CursedCore{
    fn default() -> Self{
        Self{
            current_time_ms: 0,
            data: BTreeMap::new()
        }
    }
}

impl CursedCore{
    pub fn new() -> Self{
        Default::default()
    }

    pub fn global() -> &'static mut CoreHandle{
        unsafe{
            CORE.get_or_init(|| Arc::new(Mutex::new(CursedCore::new())));
            CORE.get_mut().unwrap()
        }
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

    pub fn from_csv(&mut self, csv: &str){
        for line in csv.lines(){
            let mut parts = line.split(',');
            let time = parts.next().unwrap().parse::<u64>().unwrap();
            let key = parts.next().unwrap().to_string();
            let value = parts.next().unwrap();
            let value = if let Ok(number) = value.parse::<f64>(){
                CursedValue::Number(number)
            }else{
                CursedValue::String(value.to_string())
            };
            self.add_data(key, time, value);
        }
    }

    pub fn random_data(&mut self){
        // Create 10 random data points
        for i in 0..10{
            let key = format!("key{}", i);
            let time = i * 1000;
            let value = CursedValue::Number(i as f64);
            self.add_data(key, time, value);
        }
    }
}