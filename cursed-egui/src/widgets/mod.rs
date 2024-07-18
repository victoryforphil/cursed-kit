use wasm_bindgen::prelude::wasm_bindgen;

pub mod latest;
pub mod plot;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub enum CursedWidget{
    Latest,
    Plot

}