use blockchain::{Block, Chain, Data};
use libp2p::{
    floodsub::{Floodsub, FloodsubEvent, Topic},
    identity,
    mdns::{Mdns, MdnsEvent},
    noise,
    noise::{AuthenticKeypair, X25519Spec},
    swarm::{NetworkBehaviourEventProcess, Swarm},
    // `TokioTcpConfig` is available through the `tcp-tokio` feature.
    NetworkBehaviour,
    PeerId,
};
use log::{error, info};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use tokio::sync::mpsc;

pub static KEYS: Lazy<identity::Keypair> = Lazy::new(identity::Keypair::generate_ed25519);
pub static PEER_ID: Lazy<PeerId> = Lazy::new(|| PeerId::from(KEYS.public()));
pub static CHAIN_TOPIC: Lazy<Topic> = Lazy::new(|| Topic::new("chains"));
pub static BLOCK_TOPIC: Lazy<Topic> = Lazy::new(|| Topic::new("blocks"));

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalChainRequest {
    pub from_peer_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChainResponse {
    pub blocks: Vec<Block>,
    pub receiver: String,
}

impl Default for ChainResponse {
    fn default() -> Self {
        ChainResponse {
            blocks: vec![],
            receiver: String::from(""),
        }
    }
}

pub fn generate_keys() -> AuthenticKeypair<X25519Spec> {
    // Create a keypair for authenticated encryption of the transport.
    let noise_keys = noise::Keypair::<noise::X25519Spec>::new()
        .into_authentic(&KEYS)
        .expect("Signing libp2p-noise static DH keypair failed.");

    noise_keys
}

// We create a custom network behaviour that combines floodsub and mDNS.
// The derive generates a delegating `NetworkBehaviour` impl which in turn
// requires the implementations of `NetworkBehaviourEventProcess` for
// the events of each behaviour.
#[derive(NetworkBehaviour)]
#[behaviour(event_process = true)]
pub struct CleverGovNet {
    pub floodsub: Floodsub,
    pub mdns: Mdns,
    #[behaviour(ignore)]
    pub response_sender: mpsc::UnboundedSender<ChainResponse>,
    #[behaviour(ignore)]
    pub init_sender: mpsc::UnboundedSender<bool>,
    #[behaviour(ignore)]
    pub chain: Chain,
}

impl NetworkBehaviourEventProcess<FloodsubEvent> for CleverGovNet {
    // Called when `floodsub` produces an event.
    fn inject_event(&mut self, event: FloodsubEvent) {
        if let FloodsubEvent::Message(msg) = event {
            info!("Receive");
            if let Ok(resp) = serde_json::from_slice::<ChainResponse>(&msg.data) {
                info!("---->Receive: ChainResponse");
                if resp.receiver == PEER_ID.to_string() {
                    info!("Response from {}:", msg.source);
                    resp.blocks.iter().for_each(|r| info!("{:?}", r));

                    self.chain.blocks = self
                        .chain
                        .choose_chain(self.chain.blocks.clone(), resp.blocks);
                }
            } else if let Ok(resp) = serde_json::from_slice::<LocalChainRequest>(&msg.data) {
                info!("---->sending local chain to {}", msg.source.to_string());
                let peer_id = resp.from_peer_id;
                if PEER_ID.to_string() == peer_id {
                    if let Err(e) = self.response_sender.send(ChainResponse {
                        blocks: self.chain.blocks.clone(),
                        receiver: msg.source.to_string(),
                    }) {
                        error!("error sending response via channel, {}", e);
                    }
                }
            } else if let Ok(block) = serde_json::from_slice::<Block>(&msg.data) {
                info!("----->received new block from {}", msg.source.to_string());
                self.chain.try_add_block(block);
            } else {
                info!("------>TODO handle<-----");
            }
        }
        /*
        if let FloodsubEvent::Message(message) = message {
            println!(
                "Received: '{:?}' from {:?}",
                String::from_utf8_lossy(&message.data),
                message.source
            );
            let raw_data = String::from_utf8_lossy(&message.data);
            println!("Received: '{:?}' from {:?}", raw_data, message.source);

            let block: Block =
                serde_json::from_slice(raw_data.as_bytes()).expect("Faild to deserialize block");
            println!("The block -->{:?}<--", block);
            self.chain.push_block(block);
        }
        */
    }
}

impl NetworkBehaviourEventProcess<MdnsEvent> for CleverGovNet {
    // Called when `mdns` produces an event.
    fn inject_event(&mut self, event: MdnsEvent) {
        match event {
            MdnsEvent::Discovered(list) => {
                info!("New node discoverd");
                for (peer, _) in list {
                    self.floodsub.add_node_to_partial_view(peer);
                }
            }
            MdnsEvent::Expired(list) => {
                for (peer, _) in list {
                    if !self.mdns.has_node(&peer) {
                        info!("Node expired");
                        self.floodsub.remove_node_from_partial_view(&peer);
                    }
                }
            }
        }
    }
}

pub fn handle_create_block(data: &str, swarm: &mut Swarm<CleverGovNet>) {
    println!("Create block");
    let mut behaviour = swarm.behaviour_mut();
    let latest_block = behaviour
        .chain
        .blocks
        .last()
        .expect("there is at least one block");
    let block = Block::new(latest_block.id + 1, latest_block.hash.clone(), data);
    let json = serde_json::to_string(&block).expect("can jsonify request");
    behaviour.chain.blocks.push(block);
    info!("broadcasting new block");
    behaviour
        .floodsub
        .publish(BLOCK_TOPIC.clone(), json.as_bytes());
}

pub fn get_list_peers(swarm: &Swarm<CleverGovNet>) -> Vec<String> {
    info!("Discovered Peers:");
    let nodes = swarm.behaviour().mdns.discovered_nodes();
    let mut unique_peers = HashSet::new();
    for peer in nodes {
        unique_peers.insert(peer);
    }
    unique_peers.iter().map(|p| p.to_string()).collect()
}
