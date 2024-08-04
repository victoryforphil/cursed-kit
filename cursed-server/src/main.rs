

use warp::Filter;
mod datastore;
use warp::{ Rejection};

mod live_sync;

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    let datastore = datastore::DataStore::new().as_handle();

    let routes = warp::path("datastsore")
        // The `ws()` filter will prepare the Websocket handshake.
        .and(warp::ws())
        .and(with_datastore(datastore))
        .and_then(live_sync::ws_handler);

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
fn with_datastore(datastore: datastore::DataStoreHandle) -> impl Filter<Extract = (datastore::DataStoreHandle,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || datastore.clone())
}