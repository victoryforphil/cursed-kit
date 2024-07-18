use crate::core::{CoreHandle, CursedCore, CursedValue};
use egui_plot::*;
use std::{any::Any, collections::BTreeMap};
// Add as any mut
#[derive(Default)]
pub struct PlotWidgetApp {}

impl PlotWidgetApp {
    /// Called once before the first frame.
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        Self {}
    }

    pub fn as_any_mut(&mut self) -> &mut dyn Any {
        self
    }
}

impl eframe::App for PlotWidgetApp {
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
            ui.heading("Plot");
            let binding = BTreeMap::new();
            let sin_data = core.data.get("sin").unwrap_or(&binding); 
            let plot_points: PlotPoints = sin_data.iter().map(|(time, value)| {
                [*time as f64, match value {
                    CursedValue::Number(v) => *v,
                    _ => 0.0
                }]
            }).collect();

            let line = Line::new(plot_points);
Plot::new("my_plot").view_aspect(2.0).show(ui, |plot_ui| plot_ui.line(line));
            
        });

        ctx.request_repaint_after_secs(0.1);
    }
}
