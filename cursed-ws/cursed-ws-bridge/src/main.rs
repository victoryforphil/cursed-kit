use warp::Filter;
use warp::{ Rejection};
use clap::Parser;

mod state;
mod ws_handler;
mod test_data;


/// Command line arguments for the WebSocket bridge
#[derive(Parser, Debug, Clone)]
#[clap(author, version, about)]
pub struct WSBridgeArgs {
    /// WebSocket server address
    #[clap(short, long, default_value = "127.0.0.1")]
    pub address: String,

    /// WebSocket server port
    #[clap(short, long, default_value_t = 3030)]
    pub port: u16,

    /// Data send rate in Hz
    #[clap(short, long, default_value_t = 10.0)]
    pub send_rate_hz: f64,
}



#[tokio::main]
async fn main() {
 //   let args = args::WSBridgeArgs::parse();
    pretty_env_logger::init();
    let state = state::WSBridgeState::new().as_handle();
    
    
    let routes = warp::path("spam")
        // The `ws()` filter will prepare the Websocket handshake.
        .and(warp::ws())
        .and(with_state(state)) 
        .and_then(ws_handler::ws_handler);

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
fn with_state(state: state::StateHandle) -> impl Filter<Extract = (state::StateHandle,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}
