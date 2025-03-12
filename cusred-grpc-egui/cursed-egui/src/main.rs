#![warn(clippy::all, rust_2018_idioms)]
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

use cursed_egui::core::CursedCore;
use cursed_egui::TemplateApp;
// When compiling natively:
#[cfg(not(target_arch = "wasm32"))]
fn main() {
    use std::sync::{Arc, Mutex};

    env_logger::init(); // Log to stderr (if you run with `RUST_LOG=debug`).
    let csv = include_str!("../assets/single_field.csv");

    let mut core = CursedCore::new();
    core.from_csv(csv);

    let handle: Arc<Mutex<CursedCore>> = Arc::new(Mutex::new(core));

   
   

    // Launch new thread
    
}

// When compiling to web using trunk:
#[cfg(target_arch = "wasm32")]
fn main() {
    // Redirect `log` message to `console.log` and friends:
    eframe::WebLogger::init(log::LevelFilter::Debug).ok();

}

