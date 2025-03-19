import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AppLayout } from './layout/AppLayout'
import { TableView } from './components/views/MessagesView'
import { PlotsView } from './components/views/PlotsView'
import { ThreeDView } from './components/views/ThreeDView'
import { DebugView } from './components/views/DebugView'
import { useWebSocketContext } from './context/WebSocketProvider'
import { Box, Text, Group, Badge } from '@mantine/core'
import '@mantine/core/styles.css';

/**
 * Debug status component that shows in dev mode
 */
function ConnectionDebugStatus() {
  const { isConnected, connectionStatus, readyState } = useWebSocketContext();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0,
        zIndex: 1000, 
        padding: '5px 10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '4px 0 0 0'
      }}
    >
      <Group spacing="xs">
        <Text size="xs" c="dimmed">WS:</Text>
        <Badge 
          size="xs" 
          color={isConnected ? 'green' : 'red'}
        >
          {connectionStatus} ({readyState})
        </Badge>
      </Group>
    </Box>
  );
}

/**
 * App - Main application component
 * 
 * Defines the application routes and overall structure
 */
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/table" replace />} />
          <Route path="/table" element={<TableView />} />
          <Route path="/plots" element={<PlotsView />} />
          <Route path="/debug" element={<DebugView />} />

        </Route>
      </Routes>
      <ConnectionDebugStatus />
    </>
  )
}

export default App