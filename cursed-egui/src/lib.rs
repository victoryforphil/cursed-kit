#![warn(clippy::all, rust_2018_idioms)]

mod app;
pub use app::TemplateApp;
pub mod web;
pub mod core;
pub mod widgets;