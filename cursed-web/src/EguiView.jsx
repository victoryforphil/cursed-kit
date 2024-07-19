import * as bindings from './cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';

let didInit = [];

const useUnload = fn => {
    const cb = React.useRef(fn);

    React.useEffect(() => {
        const onUnload = cb.current;
        window.addEventListener('beforeunload', onUnload);
        return () => {
            window.removeEventListener('beforeunload', onUnload);
        };
    }, [cb]);
};



const EguiView = ({ id,widget}) => {
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

    useUnload(() => {
        if (handle) {
         
            console.log("Stopping Egui for canvas_" + id);
        }
    });
    return (
        <div className="canvas_box" >

            <canvas id={`canvas_${id}`}></canvas>
        </div>
    )
}

export default EguiView;