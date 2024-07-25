import React from 'react'
import ReactDOM from 'react-dom/client'
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
// include blueprint-icons.css for icon font support
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import './index.css'
import 'dockview/dist/styles/dockview.css';
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="app">
    <App />
    </div>
  </React.StrictMode>
)
