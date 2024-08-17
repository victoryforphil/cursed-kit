import { useState, useEffect } from "react";

import viteLogo from "/vite.svg";

import init, * as bindings from "./wasm/cursed-egui";
import { DockviewReact } from "dockview";


import "./App.css";
import CursedNavBar from "./components/navbar";
import EguiView from "./components/views/egui_view";
import PlotlyView from "./components/views/plotly_view";
import VideoView from "./components/views/video_view";
import {TopicServiceClient} from "cursed-grpc-gen/CursedServiceClientPb"
import * as CursedPB from "cursed-grpc-gen/cursed_pb"
let didInit = false;

function App() {

    const [url, setUrl] = useState("http://0.0.0.0:5050")
    const [client, setClient] = useState(undefined)

    useEffect(() => {
        const client = new TopicServiceClient(url, null, null);
            console.log("Requesting topic list")
            const request = new CursedPB.TopicListRequest();
            client.requestTopicList(request).then((response) => {
                console.log("Received topic list")
                console.log(response)
            }).catch((error) => {
                console.log("Error requesting topic list")
                console.log(error)
            })
    }, [url])



    const [wasmLoaded, setWasmLoaded] = useState(false);
    useEffect(() => {
        // Function to asynchronously load WebAssembly
        async function loadWasm() {
            if (didInit) {
                return;
            }
            didInit = true;

            const wasm = await init("cursed-egui_bg.wasm");

            window.wasmBindings = bindings;

            dispatchEvent(
                new CustomEvent("TrunkApplicationStarted", { detail: { wasm } })
            );
            setWasmLoaded(true);
            console.log("Wasm loaded");
        }

        loadWasm();
    }, []);

    const components = {
        plotly: (props) => {
            return <PlotlyView></PlotlyView>;
        },
        video: (props) => {
            return <VideoView></VideoView>;
        },
        egui_plots: (props) => {
            return (
                <EguiView
                    api={props.api}
                    id={props.api.id}
                    widget={bindings.CursedWidget.Plot}
                ></EguiView>
            );
        },
        egui_latest: (props) => {
            return <EguiView api={props.api} id={props.api.id}></EguiView>;
        },
    };

    const onDockReady = (dock) => {
        const api = dock.api;
        api.onWillDragPanel((e) => {
            // apply pointer-events: none; to all canvas elements
            const canvasElms = document.querySelectorAll("canvas");
            canvasElms.forEach((canvasElm) => {
                canvasElm.style.pointerEvents = "none";
            });
            console.log("onWillDragPanel: " + e);
        });
        api.onWillDrop((e) => {
            // apply pointer-events: auto; to the canvas element
            const canvasElms = document.querySelectorAll("canvas");
            canvasElms.forEach((canvasElm) => {
                canvasElm.style.pointerEvents = "auto";
            });
            console.log("onWillDrop: " + e);
        });
        const panel = api.addPanel({
            id: "plotly_1",
            component: "video",
        });
        const panel2 = api.addPanel({
            id: "video_1",
            component: "plotly",
        });
        const panel3 = api.addPanel({
            id: "egui_plots_1",
            component: "egui_plots",
            renderer: "always",
        });
        const panel4 = api.addPanel({
            id: "egui_latest_1 ",
            component: "egui_latest",
            renderer: "always",
            position: {
                referencePanel: "egui_plots_1",
                direction: "below",
            },
        });

        panel4.onDidDimensionsChange;
    };

    if (!wasmLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <div
                    style={{
                        flexGrow: 1,
                        overflow: "hidden",
                    }}
                >
                    <CursedNavBar />

                    <DockviewReact
                        onReady={onDockReady}
                        components={components}
                        className={"dockview-theme-abyss"}
                    />
                </div>
            </div>
        );
    }
}

export default App;
