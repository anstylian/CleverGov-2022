use actix_web::{error, middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use blockchain::{Data, ProcessState, ProcessType};
use clap::Parser;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;

mod args;

pub async fn welcome() -> Result<HttpResponse, Error> {
    let args = Args::parse();

    let port = args.backend_port;

    let data = Data {
        req_type: String::from("Test 1"),
        process_id: ProcessType::EpidomaToketou,
        process_state: ProcessState::Open,
        documents: vec![],
        prev_block_hash: None,
    };

    let uri = format!("127.0.0.1:{}", port);
    let mut stream = TcpStream::connect(uri).await.unwrap();
    let json = serde_json::to_string(&data).unwrap();
    stream.write_all(json.as_bytes()).await.unwrap();

    Ok(HttpResponse::Ok().content_type("application/json").body(""))
}

use crate::args::Args;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();
    let port: u16 = args.frontend_port.parse().unwrap();

    HttpServer::new(|| {
        App::new()
            // enable logger
            .wrap(middleware::Logger::default())
            .app_data(web::JsonConfig::default().limit(4096)) // <- limit size of the payload (global configuration)
            .service(web::resource("/").route(web::get().to(welcome)))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
