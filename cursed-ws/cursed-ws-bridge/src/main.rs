use warp::Filter;
use warp::{ Rejection};


mod state;
mod ws_handler;
mod test_data;

#[tokio::main]
async fn main() {
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
