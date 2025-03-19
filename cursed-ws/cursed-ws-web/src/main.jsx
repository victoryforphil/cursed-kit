import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import App from './App.jsx'
import { theme } from './theme'
import "@sinm/react-file-tree/icons.css";
import "@sinm/react-file-tree/styles.css";
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/code-highlight/styles.css';
import './index.css'
import { WebSocketProvider } from './context/WebSocketProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
)