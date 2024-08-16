
use std::{sync::{Arc, Mutex}, time::Instant};
use crate::cursed::topic_service_server::TopicService;

use tonic::{transport::Server, Request, Response, Status};
use log::{debug, info};
use prost::Message;

pub mod cursed {
    tonic::include_proto!("cursed"); // The string specified here must match the proto package name
}



#[derive(Debug)]
pub struct TopicServiceImpl {
    topics: Arc<Mutex<Vec<String>>>,
}


#[tonic::async_trait]
impl cursed::topic_service_server::TopicService for TopicServiceImpl {
    async fn request_topic_list(
        &self,
        request: Request<cursed::TopicListRequest>, // Accept request of type HelloRequest
    ) -> Result<Response<cursed::TopicListResponse>, Status> { // Return an instance of type HelloReply
       
        let topics = self.topics.lock().unwrap();

        let reply = cursed::TopicListResponse {
            topics: topics.clone(),
        };
        Ok(Response::new(reply)) // Send back our formatted greeting
    }
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // set to debug 
    std::env::set_var("RUST_LOG", "debug");
    pretty_env_logger::init();
    let addr = "0.0.0.0:5050".parse()?;

    let service = TopicServiceImpl{
        topics: Arc::new(Mutex::new(Vec::new())),
    };
    info!("Server listening on {}", addr);
    Server::builder()
        .add_service(cursed::topic_service_server::TopicServiceServer::new(service))
        .serve(addr)
        .await?;

    Ok(())
}