import * as bindings from '../../../wasm/cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';
import './index.css'
let didInit = [];

const EguiView = ({ id, widget, api }) => {
    const [handle, setHandle] = useState(null);

    useEffect(() => {

        if (handle) {
            handle.destroy();
            console.log("Stopping Egui for canvas_" + id);
        }
        async function start_egui() {

            const handle = new bindings.WebHandle();
            const canvasElm = document.getElementById(`canvas_${id}`);
            if (!canvasElm) {
                console.error("Canvas element not found");
                didInit[id] = false;
                return;
            }
            handle.start(canvasElm, widget);
            handle.set_handle();
            setHandle(handle);

        }

        console.log("Starting Egui for canvas_" + id);
        start_egui();
    }, []);


    return (
        <div
            style={{
                height: '100%',


            }}
        >
            <div id="canvasParent">
                <canvas id={`canvas_${id}`}></canvas>
            </div>
        </div>
    )
}

export default EguiView;