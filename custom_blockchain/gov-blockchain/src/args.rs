use clap::Parser;

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Args {
    /// istening port for UI
    #[clap(short, long)]
    pub ui_port: String,
}
