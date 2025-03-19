import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tableFromIPC } from 'apache-arrow';

const DEFAULT_ADDRESS = '127.0.0.1';
const DEFAULT_PORT = 3031;

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
  const [useArrowIPC, setUseArrowIPC] = useState(true);
  
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
  
  // Parse Arrow IPC buffer
  const parseArrowIPC = useCallback((buffer) => {
    try {
      // Convert ArrayBuffer to Arrow Table
      const table = tableFromIPC(buffer);

      console.log('Parsed Arrow table:', table);
      // Convert Arrow table to array of objects
      const tableArray = table.toArray();
      
      if (table.numRows === 0) {
        console.warn('Received empty Arrow table');
        return null;
      }
      
      // Since tableArray gives us an array of structs with all fields,
      // we can directly use the first row
      const row = tableArray[0];
      
      // Extract data from the table
      const result = {
        topic: row.topic,
        time: row.time,
        isArrowIPC: true,
        table,
        data: {},
      };
      
      // Extract all other fields as data
      for (const key in row) {
        if (key !== 'topic' && key !== 'time') {
          result.data[key] = row[key];
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing Arrow IPC data:', error);
      return null;
    }
  }, []);
  
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
      
      // Set binary type to arraybuffer for Arrow IPC data
      ws.binaryType = 'arraybuffer';
      
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
          // Track message count
          setMessageCount(prev => prev + 1);
          lastMessagesRef.current.push(Date.now());
          
          // Handle binary data (Arrow IPC) or text data (JSON)
          if (event.data instanceof ArrayBuffer) {
            // Process binary Arrow IPC data
            const buffer = event.data;
            console.log('Received binary data of length:', buffer.byteLength);
            
            // Parse the Arrow IPC data
            const arrowData = parseArrowIPC(buffer);
            
            if (arrowData) {
              setLatestMessage(arrowData);
              
              // Store by topic
              setMessagesByTopic(prev => ({
                ...prev,
                [arrowData.topic]: {
                  data: arrowData,
                  timestamp: new Date().toISOString()
                }
              }));
            }
          } else {
            // Process JSON data
            const data = JSON.parse(event.data);
            setLatestMessage(data);
            
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
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus('Error');
    }
  }, [address, port, path, parseArrowIPC]);
  
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
    useArrowIPC,
    setUseArrowIPC,
    
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