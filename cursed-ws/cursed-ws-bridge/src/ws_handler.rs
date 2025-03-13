use crate::state::StateHandle;
use log::{debug, error, info};
use std::collections::BTreeMap;
use warp::ws::{Message, WebSocket};
use warp::{Rejection, Reply};
type Result<T> = std::result::Result<T, Rejection>;
use crate::test_data::TestData;
use futures::{FutureExt, SinkExt, StreamExt};
#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub enum WSMessage {
    NewDatapoint(DataPoint),
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct DataPoint {
    pub topic: String,
    pub time: u64,
    pub data_json: String,
}

impl DataPoint {
    pub fn new(topic: String, time: u64, data_json: String) -> Self {
        Self {
            topic,
            time,
            data_json,
        }
    }

    pub fn message(&self) -> WSMessage {
        WSMessage::NewDatapoint(self.clone())
    }
}

pub async fn ws_handler(ws: warp::ws::Ws, state: StateHandle) -> Result<impl Reply> {
    Ok(ws.on_upgrade(|socket| async {
        ws_connect(socket, state).await;
    }))
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct SyncRequest {
    pub topics: Vec<String>,
    pub range: Option<(u64, u64)>,
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct SyncUpdate {
    pub topic: String,
    pub data: Vec<(u64, String)>,
}

impl SyncUpdate {
    pub fn new(topic: String, data: Vec<(u64, String)>) -> Self {
        Self { topic, data }
    }

    pub fn message(&self, time: u64) -> WSMessage {
        WSMessage::NewDatapoint(DataPoint::new(
            self.topic.clone(),
            time,
            serde_json::to_string(&self.data).unwrap(),
        ))
    }
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub enum SyncMessage {
    Update(SyncUpdate),
}

pub async fn ws_connect(ws: WebSocket, state: StateHandle) {
    info!("New WebSocket connection");

    let (mut client_ws_sender, mut client_ws_rcv) = ws.split();

    // Make a new thread to send updates to the client at the state.send_rate_hz
    let state_clone = state.clone();
    let start_time = std::time::Instant::now();

    let ( tx, mut rx) = tokio::sync::mpsc::channel::<WSMessage>(512);

    tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            let msg_json = serde_json::to_string(&message).unwrap();
            if let Err(e) = client_ws_sender.send(Message::text(msg_json)).await {
                error!("Error sending message: {}", e);
                break;
            }
        }
    });

    tokio::spawn(async move {
        let mut last_send_time = 0;
        let send_interval = (1.0 / state_clone.lock().unwrap().send_rate_hz) * 1000.0;
        loop {
            let loop_start = std::time::Instant::now();
            let current_time = start_time.elapsed().as_millis() as u64;
            if current_time - last_send_time >= send_interval as u64 {
                last_send_time = current_time;
                let state_clone = state.clone();
                let t_sec = last_send_time as f64 / 1000.0;
                let test_data = TestData::new_sin(t_sec);
                let update = SyncUpdate::new(
                    "test/topic".to_string(),
                    vec![(
                        last_send_time as u64,
                        serde_json::to_string(&test_data).unwrap(),
                    )],
                );
                let message = update.message(last_send_time as u64);
                state_clone.lock().unwrap().tick(send_interval as u64);
                state_clone.lock().unwrap().update_last_t();
                tx.send(message).await.unwrap();
            }
            
            // Calculate how much time was spent in this iteration
            let elapsed = loop_start.elapsed().as_millis() as u64;
            // Calculate remaining time to sleep (if any)
            let sleep_time = if elapsed < send_interval as u64 {
                send_interval as u64 - elapsed
            } else {
                0 // Don't sleep if we've already exceeded the interval
            };
            
            tokio::time::sleep(std::time::Duration::from_millis(sleep_time)).await;
        }
    });
}
