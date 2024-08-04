
use crate::datastore::{self, CursedValue, DataStoreHandle};
use warp::ws::{ WebSocket};
use warp::{ Rejection, Reply};
use log::{info, error};
type Result<T> = std::result::Result<T, Rejection>;
use futures::{FutureExt, StreamExt};
pub async fn ws_handler(ws: warp::ws::Ws, datastore: DataStoreHandle)-> Result<impl Reply> {
    Ok(ws.on_upgrade(|socket| async {
      ws_connect(socket, datastore).await;
    }))
}

pub async fn ws_connect(ws: WebSocket, datastore: DataStoreHandle) {
    info!("New WebSocket connection");
    let test = CursedValue::Number(1.0);
    datastore.lock().unwrap().add_data("test/num".to_string(), 10,test);
    let test = CursedValue::String("Hello".to_string());
    datastore.lock().unwrap().add_data("test/str".to_string(), 20,test);

    let (client_ws_sender, mut client_ws_rcv) = ws.split();

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                error!("Error receiving message: {}", e);
                break;
            }
        };
        
        info!("Received message: {:?}", msg);
    }

}   