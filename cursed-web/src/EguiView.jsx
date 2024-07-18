import * as bindings from './cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';
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

const EguiView = ({id}) => {
    const [handle, setHandle] = useState(null);
    useEffect(() => {
        // Function to asynchronously load WebAssembly
        async function start_egui() {
        
            const handle = new bindings.WebHandle();
            handle.start("canvas_" + id);
            setHandle(handle);
        } 
        
            console.log("Starting Egui for canvas_" + id);
        start_egui();
      }, []);

    useUnload(() => {
        if (handle) {
            handle.stop();
            console.log("Stopping Egui for canvas_" + id);
        }
    });
    return (
        <div>
            <canvas id={`canvas_${id}`}></canvas> 
        </div>
    )
}

export default EguiView;