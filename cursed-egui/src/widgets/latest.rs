use crate::core::{CoreHandle, CursedCore};

use std::any::Any;
// Add as any mut
#[derive(Default)]
pub struct LatestWidgetApp {}

impl LatestWidgetApp {
    /// Called once before the first frame.
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        Self {}
    }

    pub fn as_any_mut(&mut self) -> &mut dyn Any {
        self
    }
}

impl eframe::App for LatestWidgetApp {
    /// Called each time the UI needs repainting, which may be many times per second.
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Put your widgets into a `SidePanel`, `TopBottomPanel`, `CentralPanel`, `Window` or `Area`.
        // For inspiration and more examples, go to https://emilk.github.io/egui

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            // The top panel is often a good place for a menu bar:

            egui::menu::bar(ui, |ui| {
                // NOTE: no File->Quit on web pages!
                let is_web = cfg!(target_arch = "wasm32");
                if !is_web {
                    ui.menu_button("File", |ui| {
                        if ui.button("Quit").clicked() {
                            ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                        }
                    });
                    ui.add_space(16.0);
                }

                egui::widgets::global_dark_light_mode_buttons(ui);
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            let handle = CursedCore::global();
            let core = handle.lock().unwrap();
            ui.heading("Data");
            for (key, data) in &core.data {
                ui.collapsing(key, |ui| {
                    for (time, value) in data {
                        ui.label(format!("{}: {:?}", time, value));
                    }
                });
            }

            ui.ctx().request_repaint();
        });
    }
}
