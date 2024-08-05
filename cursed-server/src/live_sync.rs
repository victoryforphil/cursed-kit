
use crate::datastore::{self, CursedValue, DataStoreHandle};
use warp::ws::{ WebSocket, Message};
use warp::{ Rejection, Reply};
use log::{debug, error, info};
use std::collections::BTreeMap;
type Result<T> = std::result::Result<T, Rejection>;
use futures::{FutureExt, SinkExt, StreamExt};

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub enum SyncMessage{
    Request(SyncRequest),
    Update(SyncUpdate),
}


#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct SyncRequest{
    pub topics: Vec<String>,
    pub range: Option<(u64, u64)>,
}

impl SyncRequest{
    pub fn new(topics: Vec<String>, range: Option<(u64, u64)>) -> Self{
        Self{
            topics,
            range,
        }
    }

    pub fn message(&self) -> SyncMessage{
        SyncMessage::Request(self.clone())
    }
}


#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct SyncUpdate{
    pub topic: String,
    pub data: BTreeMap<u64, CursedValue>,
}

impl SyncUpdate{
    pub fn new(topic: String, data: BTreeMap<u64, CursedValue>) -> Self{
        Self{
            topic,
            data,
        }
    }

    pub fn message(&self) -> SyncMessage{
        SyncMessage::Update(self.clone())
    }
}

pub async fn ws_handler(ws: warp::ws::Ws, datastore: DataStoreHandle)-> Result<impl Reply> {
    Ok(ws.on_upgrade(|socket| async {
      ws_connect(socket, datastore).await;
    }))
}

pub async fn handle_sync_request(sync_request: SyncRequest, datastore: DataStoreHandle) -> Result<Message> {
    let mut sync_updates = Vec::new();
    for topic in sync_request.topics {
        if let Some(data) = datastore.lock().unwrap().get_data(&topic) {
            let mut data = data.clone();
            if let Some((start, end)) = sync_request.range {
                data = data.into_iter().filter(|(time, _)| *time >= start && *time <= end).collect();
            }
            sync_updates.push(SyncUpdate::new(topic, data).message());
        }
    }
    Ok(Message::text(serde_json::to_string(&sync_updates).unwrap()))
}

pub async fn ws_connect(ws: WebSocket, datastore: DataStoreHandle) {
    info!("New WebSocket connection");
    let test = CursedValue::Number(1.0);
    datastore.lock().unwrap().add_data("test/num".to_string(), 10,test);
    let test = CursedValue::String("Hello".to_string());
    datastore.lock().unwrap().add_data("test/str".to_string(), 20,test);

    let (mut client_ws_sender, mut client_ws_rcv) = ws.split();




    while let Some(result) = client_ws_rcv.next().await {
        let msg: Message = match result {
            Ok(msg) => msg,
            Err(e) => {
                error!("Error receiving message: {}", e);
                break;
            }
        };
        let datastore =  datastore.clone();
   
        

        let sync_message = match serde_json::from_slice(&msg.as_bytes()) {
            Ok(sync_message) => sync_message,
            Err(e) => {
                error!("Error parsing message: {}", e);
                continue;
            }
        };

       match sync_message {
            SyncMessage::Request(sync_request) => {
                info!("Received sync request: {:#?}", sync_request);
                match handle_sync_request(sync_request, datastore.clone()).await {
                    Ok(response) => {
                        let size = &response.as_bytes().len();
                        if let Err(e) = client_ws_sender.send(response).await {
                            error!("Error sending message: {}", e);
                            break;
                        }else{
                            info!("Sent response: {:?} bytes sent", size);
                        }
                    }
                    Err(e) => {
                        error!("Error handling request: {:#?}", e);
                        break;
                    }
                }
            }
            _ => {
                error!("Invalid message type");
                break;
            }
        }
    }

}   