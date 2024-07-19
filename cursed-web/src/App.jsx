import { useState, useEffect } from 'react'

import viteLogo from '/vite.svg'

import init, * as bindings from './cursed-egui';
import {DockviewReact} from 'dockview';



import EguiView from './EguiView';
import PlotlyView from './PlotlyView';
import VideoView from './VideoView';


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
  

  const loadCSV = () => {
      bindings.cursed_load_csv();
  }
  const randomData = () => {
    bindings.cursed_random_data();
  }
  const components = {
    plotly: (props) => {
      return <PlotlyView></PlotlyView>
    },
    video: (props) => {
      return <VideoView></VideoView>
    },
    egui_plots: (props) => {
      
      return <EguiView id={props.api.id} widget={bindings.CursedWidget.Plot}></EguiView>
    },
    egui_latest: (props) => {
      return <EguiView id={props.api.id}></EguiView>
    }

  }
  
  const onDockReady = (dock) => {
    const api = dock.api;
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
  }
  if (!wasmLoaded) {
    return <div>Loading...</div>;
  }else{
    return (
      <div id="app">
        
        <button onClick={()=>loadCSV()}>Load CSV</button>
        <button onClick={()=>randomData()}>Random Data</button>
        <button onClick={()=>bindings.cursed_sin()}>Sin Data</button>
       
        <DockviewReact onReady={onDockReady} components={components} className={'dockview-theme-abyss'}/>
      </div>
    )
  }

  
}

export default App
