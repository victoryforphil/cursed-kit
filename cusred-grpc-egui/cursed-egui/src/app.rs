use crate::core::{CoreHandle, CursedCore};

use std::any::Any;
// Add as any mut
#[derive(Default)]
pub struct TemplateApp {
    // Example stuff:
    label: String,
    id: String,

    value: f32,

    handle: Option<CoreHandle>,
}


impl TemplateApp {
    /// Called once before the first frame.
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        
        Self {
            label: "Hello, world!".to_owned(),
            id: "id".to_owned(),
            value: 0.0,
            handle: Some(CursedCore::global().clone()), 
        }
    }

    pub fn set_handle(&mut self, handle: CoreHandle) {
        self.handle = Some(handle);
    }
    pub fn as_any_mut(&mut self) -> &mut dyn Any {
        self
    }
}



impl eframe::App for TemplateApp {
   
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
            ui.push_id(self.id.clone(), |ui| {
                // The central panel the region left after adding TopPanel's and SidePanel's
                ui.heading("eframe template");

                ui.horizontal(|ui| {
                    ui.label("Write something: ");
                    ui.text_edit_singleline(&mut self.label);
                });

                ui.add(egui::Slider::new(&mut self.value, 0.0..=10.0).text("value"));
                if ui.button("Increment").clicked() {
                    self.value += 1.0;
                }

                ui.separator();

                if let Some(handle) = &self.handle {
                    let mut core = handle.lock().unwrap();
                    ui.heading("Data");
                    for (key, data) in &core.data {
                        ui.collapsing(key, |ui| {
                            for (time, value) in data {
                                ui.label(format!("{}: {:?}", time, value));
                            }
                        });
                    }

                    ui.ctx().request_repaint();
                }

              
            });
        });
        
    }
}
