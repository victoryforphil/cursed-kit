
use std::{sync::{Arc, Mutex}, time::Instant};

use tonic_web::GrpcWebLayer;
use tonic::{transport::Server, Request, Response, Status};
use log::{debug, info};
use prost::Message;

pub mod cursed {
    tonic::include_proto!("cursed"); / The stri/ng specified here must match the proto package name
}


#[derive(Debug)]
pub struct CSVServiceImpl {

}


#[tonic::async_trait]
impl cursed::csv_service_server::CsvService for CSVServiceImpl {
    async fn request_csv(
        &self,
        request: Request<cursed::CsvRequest>, // Accept request of type HelloRequest
    ) -> Result<Response<cursed::CsvResponse>, Status> {
        // Return an instance of type HelloReply
        
        let inner = request.into_inner();
        info!("Got a request: {:?}",inner.clone());
        
        let path = rfd::FileDialog::new().pick_file().unwrap();
        let file = std::fs::read_to_string(path).unwrap();

        let reply = cursed::CsvResponse {
            csv_contents: file,
            was_successfull: true
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

    let service = CSVServiceImpl{
        
    };
    let service = cursed::csv_service_server::CsvServiceServer::new(service);
    let service = tonic_web::enable(service);
    info!("Server listening on {}", addr);
    Server::builder()
        .accept_http1(true)
        .add_service(service)
        .serve(addr)
        .await?;

    Ok(())
}