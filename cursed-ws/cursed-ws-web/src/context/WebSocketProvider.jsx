import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_ADDRESS = '127.0.0.1';
const DEFAULT_PORT = 3030;

// Create the context
const WebSocketContext = createContext({});

/**
 * WebSocketProvider - Provides WebSocket functionality to the application
 * 
 * Manages WebSocket connection and message state
 */
export function WebSocketProvider({ children }) {
  // Connection state
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [path, setPath] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [readyState, setReadyState] = useState(-1);
  
  // Statistics
  const [messageCount, setMessageCount] = useState(0);
  const [messageRate, setMessageRate] = useState(0);
  const startTimeRef = useRef(null);
  const rateIntervalRef = useRef(null);
  const lastMessagesRef = useRef([]);
  const wsRef = useRef(null);
  
  // Message storage
  const [latestMessage, setLatestMessage] = useState(null);
  const [messagesByTopic, setMessagesByTopic] = useState({});
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Build WebSocket URL (with optional path)
      const wsUrl = `ws://${address}:${port}${path ? `/${path.replace(/^\//, '')}` : ''}`;
      console.log(`Attempting to connect to: ${wsUrl}`);
      setConnectionStatus('Connecting...');
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Start timing for rate calculation
      startTimeRef.current = Date.now();
      setMessageCount(0);
      lastMessagesRef.current = [];
      
      // Set up rate calculation interval
      if (rateIntervalRef.current) {
        clearInterval(rateIntervalRef.current);
      }
      
      rateIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const recentMessages = lastMessagesRef.current.filter(
          time => now - time < 1000
        );
        lastMessagesRef.current = recentMessages;
        setMessageRate(recentMessages.length);
      }, 200);
      
      // WebSocket event handlers
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        setReadyState(ws.readyState);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setReadyState(ws.readyState);
        
        // Clean up interval
        if (rateIntervalRef.current) {
          clearInterval(rateIntervalRef.current);
          rateIntervalRef.current = null;
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
        setReadyState(ws.readyState);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLatestMessage(data);
          
          // Track message count
          setMessageCount(prev => prev + 1);
          lastMessagesRef.current.push(Date.now());
          
          // Store message by topic if it has a topic field
          if (data.topic) {
            setMessagesByTopic(prev => ({
              ...prev,
              [data.topic]: {
                data,
                timestamp: new Date().toISOString()
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus('Error');
    }
  }, [address, port, path]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  // Clear message state
  const clearMessage = useCallback(() => {
    setLatestMessage(null);
    setMessagesByTopic({});
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (rateIntervalRef.current) {
        clearInterval(rateIntervalRef.current);
      }
    };
  }, [disconnect]);
  
  // Context value
  const value = {
    // Connection
    address,
    setAddress,
    port,
    setPort,
    path,
    setPath,
    connect,
    disconnect,
    isConnected,
    connectionStatus,
    readyState,
    
    // Messages
    latestMessage,
    messagesByTopic,
    clearMessage,
    
    // Stats
    messageCount,
    messageRate,
    startTime: startTimeRef.current
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook for using the WebSocket context
export function useWebSocketContext() {
  return useContext(WebSocketContext);
} 