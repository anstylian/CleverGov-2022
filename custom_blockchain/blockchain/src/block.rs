use chrono::prelude::*;
use log::info;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub(super) const DIFFICULTY_PREFIX: &str = "00";

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct Block {
    pub id: u64,
    pub hash: String,
    pub previous_hash: String,
    pub timestamp: i64,
    pub data: Data,
    pub nonce: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ReqType {
    EpidomaToketou,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ProcessType {
    EpidomaToketou,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ProcessState {
    Open,
    Ongoing(String),
    Closed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Data {
    /// First block hash
    pub req_type: String,
    pub process_id: ProcessType,
    pub process_state: ProcessState,
    pub documents: Vec<String>,
    /// Previous block hash related to the request
    pub prev_block_hash: Option<String>,
}

impl Data {
    fn new(data: &str) -> Self {
        serde_json::from_str(data).unwrap()
    }
}

impl Default for Data {
    fn default() -> Self {
        Data {
            req_type: String::from("genesis"),
            process_id: ProcessType::EpidomaToketou,
            process_state: ProcessState::Open,
            documents: vec![],
            prev_block_hash: None,
        }
    }
}

impl Block {
    pub fn new(id: u64, previous_hash: String, data: &str) -> Self {
        let now = Utc::now();
        let (nonce, hash) = mine_block(id, now.timestamp(), &previous_hash, &data);
        Block {
            id,
            hash,
            timestamp: now.timestamp(),
            previous_hash,
            data: Data::new(data),
            nonce,
        }
    }
}

pub(super) fn mine_block(
    id: u64,
    timestamp: i64,
    previous_hash: &str,
    data: &str,
) -> (u64, String) {
    info!("mining block...");
    let mut nonce = 0;

    loop {
        if nonce % 100000 == 0 {
            info!("nonce: {}", nonce);
        }
        let hash = calculate_hash(id, timestamp, previous_hash, data, nonce);
        let binary_hash = hash_to_binary_representation(&hash);
        if binary_hash.starts_with(DIFFICULTY_PREFIX) {
            info!(
                "mined! nonce: {}, hash: {}, binary hash: {}",
                nonce,
                hex::encode(&hash),
                binary_hash
            );
            return (nonce, hex::encode(hash));
        }
        nonce += 1;
    }
}

pub(super) fn calculate_hash(
    id: u64,
    timestamp: i64,
    previous_hash: &str,
    data: &str,
    nonce: u64,
) -> Vec<u8> {
    let data = serde_json::json!({
        "id": id,
        "previous_hash": previous_hash,
        "data": Data::new(data),
        "timestamp": timestamp,
        "nonce": nonce
    });
    let mut hasher = Sha256::new();
    hasher.update(data.to_string().as_bytes());
    hasher.finalize().as_slice().to_owned()
}

pub(super) fn hash_to_binary_representation(hash: &[u8]) -> String {
    let mut res: String = String::default();
    for c in hash {
        res.push_str(&format!("{:b}", c));
    }
    res
}
