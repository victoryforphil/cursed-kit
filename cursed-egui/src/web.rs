use std::{cell::OnceCell, sync::{Arc, Mutex}};

use wasm_bindgen::prelude::*;

use crate::{core::{CoreHandle, CursedCore}, TemplateApp};
#[cfg(target_arch = "wasm32")]
use web_sys::HtmlCanvasElement;
/// Your handle to the web app from JavaScript.
#[cfg(target_arch = "wasm32")]
#[derive(Clone)]
#[wasm_bindgen]
pub struct WebHandle {
    runner: eframe::WebRunner
}



#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl WebHandle {
    /// Installs a panic hook, then returns.
    #[allow(clippy::new_without_default)]
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Redirect [`log`] message to `console.log` and friends:
       
       
        Self {
            runner: eframe::WebRunner::new(),
        }
    }

    /// Call this once from JavaScript to start your app.
    #[wasm_bindgen]
    pub async fn start(&self, canvas_id: HtmlCanvasElement) -> Result<(), wasm_bindgen::JsValue> {
        
        self.runner
            .start(
                canvas_id,
                eframe::WebOptions::default(),
                Box::new(|cc| Ok(Box::new(TemplateApp::new(cc))),)
            )
            .await

           
    }

    #[wasm_bindgen]
    pub async fn set_handle(&self) {
      
    }

   

    // The following are optional:

    /// Shut down eframe and clean up resources.
    #[wasm_bindgen]
    pub fn destroy(&self) {
        self.runner.destroy();
    }
}

#[wasm_bindgen]
pub fn cursed_load_csv() {
    let core = CursedCore::global();
    let csv = include_str!("../assets/single_field.csv");
    let mut core = core.lock().unwrap();
    core.from_csv(csv);
}

#[wasm_bindgen]
pub fn cursed_random_data() {
    let core = CursedCore::global();
    let mut core = core.lock().unwrap();
    core.random_data();
}