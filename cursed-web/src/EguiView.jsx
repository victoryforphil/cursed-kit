import * as bindings from './cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';
import './Egui.css'
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



const EguiView = ({ id,widget, api}) => {
    const [handle, setHandle] = useState(null);
    const [dimensions, setDimensions] = useState({ width: api.width, height: api.height });
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
    
    // Resize canvas element when dimensions change
    useEffect(() => {
        console.log(`Setting canvas_${id} dimensions to ${dimensions.width}x${dimensions.height}`)
        const canvasElm = document.getElementById(`canvas_${id}`);
      //  canvasElm.width = dimensions.width;
      //  canvasElm.height = dimensions.height;
    }, [dimensions]);

    api.onDidDimensionsChange((dimensions) => {
        console.log(dimensions);
        setDimensions(dimensions);
    });
    api.onDidLocationChange((location) => {
        console.log(location);
    }
    );
    api.onDidParametersChange((parameters) => {
        console.log(parameters);
    }
    );
    api.onDidActiveGroupChange((e) => {
        console.log(`EguiView will focus: ${e}`);
    }
    );

  
    useEffect(() => {
        console.log("EguiView focused: " + api.isFocused);
    }, [api.isFocused]);
    useUnload(() => {
        if (handle) {
         
            console.log("Stopping Egui for canvas_" + id);
        }
    });
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