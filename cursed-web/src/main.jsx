import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import 'dockview/dist/styles/dockview.css';

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="App">
      <App />
    </div>
  </React.StrictMode>
)
