import { useState, useEffect } from 'react'

import viteLogo from '/vite.svg'
import "rc-dock/dist/rc-dock.css";
import './App.css'
import init, * as bindings from './cursed-egui';
import DockLayout from 'rc-dock'


import EguiView from './EguiView';
import PlotlyView from './PlotlyView';


let didInit = false;

function App() {
  const [count, setCount] = useState(0)
  const defaultLayout = {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          tabs: [
            { id: 'tab1', title: 'tab1', group: "1", content: <EguiView id="1" widget={bindings.CursedWidget.Latest}/> },
            
          ]
        },{
          tabs: [
            { id: 'tab2', title: 'tab2', group: "2", content: <EguiView  id="2" widget={bindings.CursedWidget.Plot}/>, closable: true },
            
          ]
        }
        ,{
          tabs: [
            { id: 'tab3', title: 'Plotly', group: "3", content: <PlotlyView/>, closable: true },
            
          ]
        }
      ]
    }
  };
  const [wasmLoaded, setWasmLoaded] = useState(false);
  useEffect(() => {
    // Function to asynchronously load WebAssembly
    async function loadWasm() {

      if (didInit) {
        return;
      }
      didInit = true;

      const wasm = await init('/cursed-egui_bg.wasm');


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
  if (!wasmLoaded) {
    return <div>Loading...</div>;
  }else{
    return (
      <>
        
        <button onClick={()=>loadCSV()}>Load CSV</button>
        <button onClick={()=>randomData()}>Random Data</button>
        <button onClick={()=>bindings.cursed_sin()}>Sin Data</button>
       
        <DockLayout

          defaultLayout={defaultLayout}
          style={{
            position: "absolute",
            left: 10,
            top: 100,
            right: 10,
            bottom: 10,
          }}
        />
      </>
    )
  }

  
}

export default App
