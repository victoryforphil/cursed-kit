# Run trunk
trunk build --release --filehash false

# Cp *.wasm to ../cursed-egui-web/public
cp dist/cursed-egui_bg.wasm ../cursed-web/public/cursed-egui_bg.wasm

# cp cursed-egui.js to ../cursed-egui-web/src
cp dist/cursed-egui.js ../cursed-web/src/cursed-egui.js

