import { useState, useEffect } from 'react'

import viteLogo from '/vite.svg'

import init, * as bindings from './cursed-egui';
import { DockviewReact } from 'dockview';



import EguiView from './EguiView';
import PlotlyView from './PlotlyView';
import VideoView from './VideoView';
import './App.css';
import CursedNavBar from './components/navbar';

let didInit = false;

function App() {


  const [wasmLoaded, setWasmLoaded] = useState(false);
  useEffect(() => {
    // Function to asynchronously load WebAssembly
    async function loadWasm() {

      if (didInit) {
        return;
      }
      didInit = true;

      const wasm = await init('cursed-egui_bg.wasm');


      window.wasmBindings = bindings;


      dispatchEvent(new CustomEvent("TrunkApplicationStarted", { detail: { wasm } }));
      setWasmLoaded(true);
      console.log("Wasm loaded");
    }

    loadWasm();

  }, []);


 
  const components = {
    plotly: (props) => {
      return <PlotlyView></PlotlyView>
    },
    video: (props) => {
      return <VideoView></VideoView>
    },
    egui_plots: (props) => {

      return <EguiView api={props.api} id={props.api.id} widget={bindings.CursedWidget.Plot}></EguiView>
    },
    egui_latest: (props) => {

      return <EguiView api={props.api} id={props.api.id}></EguiView>
    }

  }

  const onDockReady = (dock) => {
    const api = dock.api;
    api.onWillDragPanel((e) => {
      // apply pointer-events: none; to all canvas elements
      const canvasElms = document.querySelectorAll('canvas');
      canvasElms.forEach((canvasElm) => {
        canvasElm.style.pointerEvents = 'none';
      });
      console.log("onWillDragPanel: " + e);
  }); 
  api.onWillDrop((e) => {
      // apply pointer-events: auto; to the canvas element
      const canvasElms = document.querySelectorAll('canvas');
      canvasElms.forEach((canvasElm) => {
        canvasElm.style.pointerEvents = 'auto';
      });
      console.log("onWillDrop: " + e);
  }); 
    const panel = api.addPanel({
      id: 'plotly_1',
      component: 'video',
    });
    const panel2 = api.addPanel({
      id: 'video_1',
      component: 'plotly',

    });
    const panel3 = api.addPanel({
      id: 'egui_plots_1',
      component: 'egui_plots',
      renderer: 'always'

    });
    const panel4 = api.addPanel({
      id: 'egui_latest_1 ',
      component: 'egui_latest',
      renderer: 'always',
      position: {
        referencePanel: 'egui_plots_1',
        direction: 'below'
      }
    });

    panel4.onDidDimensionsChange
  }


  if (!wasmLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div
          style={{
            flexGrow: 1,
            overflow: 'hidden',
          }}
        >
          <CursedNavBar/>

          <DockviewReact onReady={onDockReady} components={components} className={'dockview-theme-abyss'} />
        </div>
      </div>
    )
  }


}

export default App
