use anyhow::Result;
use blockchain::{Block, Chain};
use chrono::prelude::*;
use clap::Parser;
use futures::StreamExt;
use libp2p::{
    core::upgrade,
    floodsub::{self, Floodsub},
    mdns::Mdns,
    mplex,
    noise,
    swarm::{Swarm, SwarmBuilder, SwarmEvent},
    // `TokioTcpConfig` is available through the `tcp-tokio` feature.
    tcp::TokioTcpConfig,
    Transport,
};
use log::info;
use std::io::IoSliceMut;
use std::time::Duration;
use tokio::io::{self, AsyncBufReadExt};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::net::TcpStream;
use tokio::sync::mpsc;
use tokio::time::sleep;

mod args;
mod p2p;

use crate::args::Args;
use crate::p2p::{generate_keys, ChainResponse, CleverGovNet};

enum EventType {
    Input(String), //&'static mut Swarm<CleverGovNet>),
    Init,
    LocalChainResponse(ChainResponse),
    Non,
    Client(TcpStream),
}

/// The `tokio::main` attribute sets up a tokio runtime.
#[tokio::main]
async fn main() -> Result<()> {
    env_logger::builder()
        .filter_level(log::LevelFilter::Info)
        .init();
    let args = Args::parse();

    // Create a random PeerId
    let noise_keys = generate_keys();
    println!("Local peer id: {:?}", p2p::PEER_ID);

    let (response_sender, mut response_rcv) = mpsc::unbounded_channel();
    let (init_sender, mut init_rcv) = mpsc::unbounded_channel();

    // Create a tokio-based TCP transport use noise for authenticated
    // encryption and Mplex for multiplexing of substreams on a TCP stream.
    let transport = TokioTcpConfig::new()
        .nodelay(true)
        .upgrade(upgrade::Version::V1)
        .authenticate(noise::NoiseConfig::xx(noise_keys).into_authenticated())
        .multiplex(mplex::MplexConfig::new())
        .boxed();

    // Create a Swarm to manage peers and events.
    let mut swarm = {
        let mdns = Mdns::new(Default::default()).await?;
        let mut behaviour = CleverGovNet {
            floodsub: Floodsub::new(p2p::PEER_ID.clone()),
            mdns,
            chain: Chain::new(),
            response_sender,
            init_sender: init_sender.clone(),
        };

        behaviour.floodsub.subscribe(p2p::CHAIN_TOPIC.clone());
        behaviour.floodsub.subscribe(p2p::BLOCK_TOPIC.clone());

        SwarmBuilder::new(transport, behaviour, *p2p::PEER_ID)
            // We want the connection background tasks to be spawned
            // onto the tokio runtime.
            .executor(Box::new(|fut| {
                tokio::spawn(fut);
            }))
            .build()
    };

    // Reach out to another node if specified
    /*
    if let Some(to_dial) = std::env::args().nth(1) {
        let addr: Multiaddr = to_dial.parse()?;
        swarm.dial(addr)?;
        println!("Dialed {:?}", to_dial);
    }
    */

    // Read full lines from stdin
    let mut stdin = io::BufReader::new(io::stdin()).lines();

    // Listen on all interfaces and whatever port the OS assigns
    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    let ip_port = format!("127.0.0.1:{}", args.ui_port);
    let listener = TcpListener::bind(ip_port.as_str()).await?;

    tokio::task::spawn(async move {
        sleep(Duration::from_secs(1)).await;
        info!("sending init event");
        init_sender.send(true).expect("can send init event");
    });

    // Kick it off
    loop {
        let event: EventType = tokio::select! {
                                    conn = listener.accept() => {
                                            let (socket, _) = conn?;
                                            EventType::Client(socket)
                                        }
                    /*
                                    mut r = listener.accept() => {
                                        let (mut socket, _) = r?;
                                        tokio::spawn( async move {
                                            let mut buf = [0; 1024];

                                            loop {
                                                let n = match socket.read(&mut buf).await {
                                                    // socket closed
                                                    Ok(n) if n == 0 => return,
                                                    Ok(n) => n,
                                                    Err(e) => {
                                                        eprintln!("failed to read from socket; err = {:?}", e);
                                                        return;
                                                    }
                                                };

                                                // TODO handle request
                                            }
                                        });
                                    },
                    */
                                    line = stdin.next_line() => {
                                        let line = line?.expect("stdin closed");
                                        println!("line: {line}");
                                        let block = Block::default();
                                        let json = serde_json::to_string(&block).expect("con not jsonify request");
                                        println!("json: {}", json);
        //                                swarm.behaviour_mut().floodsub.publish(floodsub_topic.clone(), json.as_bytes());

                                        EventType::Non
                     //   p2p::handle_create_block(json.as_str(), &mut swarm);
                                        // EventType::Input(json) //, &mut swarm)
                //                        swarm.behaviour_mut().chain.push_block(Block::default());


                                        // TODO insert
                        //                chain.push_block(Block::default());
                                    }
                                    response = response_rcv.recv() => {
                                        println!("HELLO RESPONCE");
                                        EventType::LocalChainResponse(response.expect("response exists"))
                                    }
                                    _init = init_rcv.recv() => {
                                        println!("HELLO _init");
                                        EventType::Init
                                    },
                                    event = swarm.select_next_some() => {
                                        if let SwarmEvent::NewListenAddr { address, .. } = event {
                                            info!("Listening on {:?}", address);
                                        }
                                        EventType::Non
                                    }
                                };

        match event {
            EventType::Init => {
                let peers = p2p::get_list_peers(&swarm);
                info!("connected nodes: {}", peers.len());
                // TODO fix bug at init.
                // Senario
                // start node 1
                // create block
                // start node 2
                // node 2 is updating ok. If you don't create node at node 1 update fails
                if !peers.is_empty() {
                    info!("we are not first, lest update");
                    let req = p2p::LocalChainRequest {
                        from_peer_id: peers.iter().last().expect("at least one peer").to_string(),
                    };

                    let json = serde_json::to_string(&req).expect("can jsonify request");
                    swarm
                        .behaviour_mut()
                        .floodsub
                        .publish(p2p::CHAIN_TOPIC.clone(), json.as_bytes());
                } else {
                    swarm.behaviour_mut().chain.genesis();
                }
            }
            EventType::Input(json) => {
                p2p::handle_create_block(&json, &mut swarm);
            }
            EventType::LocalChainResponse(chain_resp) => {
                println!("------>LocalChainResponce<------");
                let json = serde_json::to_string(&chain_resp).expect("can jsonify response");
                swarm
                    .behaviour_mut()
                    .floodsub
                    .publish(p2p::CHAIN_TOPIC.clone(), json.as_bytes());
            }
            EventType::Non => {}
            EventType::Client(socket) => {
                // This impl is buggy
                socket.readable().await.unwrap();

                let mut buf = [0; 4096];
                let mut bufs = [IoSliceMut::new(&mut buf)];
                loop {
                    match socket.try_read_vectored(&mut bufs) {
                        Ok(0) => {
                            break;
                        }
                        Ok(n) => {
                            println!("read {} bytes", n);
                            if n >= 4096 {
                                todo!();
                            }
                            let json = String::from_utf8_lossy(&buf[0..n]);
                            println!("-->{:?}<--", json);
                            p2p::handle_create_block(&json, &mut swarm);
                            break;
                        }
                        Err(ref e) if e.kind() == io::ErrorKind::WouldBlock => {
                            continue;
                        }
                        Err(e) => {
                            return Err(e.into());
                        }
                    }
                }
                println!("Break loop: {:#?}", swarm.behaviour().chain);
            }
        }
    }
}
