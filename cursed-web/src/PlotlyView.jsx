import * as bindings from './cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';

import Plot from 'react-plotly.js';



const PlotlyView = ({ }) => {
    const [data, setData] = useState(null);
    const [revision, setRevision] = useState(0);
    const loadData = () => {
        let read_data = bindings.cursed_get_data("sin");
        if ( read_data.length == 0 ){
            console.log("No data found");
            return;
        }
        let new_data = [[], []];
        for (let i = 0; i < read_data.length; i++) {
            let cur = read_data[i];
            let y = cur.time;
            let x = cur.value;
            new_data[0][i] = parseFloat(y) / 10;
            console.log(`Data: ${x} @ ${y}`);
            new_data[1][i] = x;
        }
        let data_obj = {
            x: new_data[0],
            y: new_data[1],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
        }
        console.log(`Data: ${data_obj}`);
        setData(data_obj);
        
    }

    useEffect(() => {
        // While data is undefined, try to load data at 0.5s
        if (data != null) {
            return;
        }
        const interval = setInterval(() => {
            if (data != null) {
                return;
            }
            loadData();
            
        }, 500);
        return () => clearInterval(interval);

    }, [data]);

    // Automatically reload data every 0.5s

    return (
        <div>
            <button onClick={() => loadData()}>Load Data</button>
            <Plot

                data={[
                    data ? data : { x: [0], y: [0], type: 'scatter', mode: 'lines+markers', marker: { color: 'red' } }
                ]}
                layout={{ width: "50%", height: "100%", title: 'A Fancy Plot' }}
            />
        </div>
    )
}

export default PlotlyView;