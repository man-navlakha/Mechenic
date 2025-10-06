import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const reconnectAttempts = useRef(0);

  // Fetch initial mechanic status when the app loads
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const res = await api.get("/jobs/GetBasicNeeds/");
        const data = res.data.basic_needs || {};
        setIsOnline(data.status === "ONLINE" && !!data.is_verified);
        setIsVerified(!!data.is_verified);
      } catch (error) {
        console.warn("Failed to fetch initial status:", error);
      }
    };
    fetchInitialStatus();
  }, []);

  // Manage WebSocket connection based on online status
  useEffect(() => {
    if (isOnline && isVerified) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    // Cleanup function to close socket when the provider unmounts
    return () => {
      disconnectWebSocket();
    };
  }, [isOnline, isVerified]);

  const connectWebSocket = async () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("[WS] Already connected.");
      return;
    }
    
    setConnectionStatus('connecting');
    try {
      const res = await api.get("core/ws-token/", { withCredentials: true });
      const wsToken = res.data.ws_token;
      if (!wsToken) throw new Error("Failed to get WebSocket token");

      // --- FIX STARTS HERE ---
      // Use wss in production, ws in development.
      const isProduction = import.meta.env.PROD;
      const wsScheme = isProduction ? "wss" : "ws";
      
      // In development, connect to the Vite proxy. In production, connect to the backend host.
      const backendHost = isProduction
        ? (import.meta.env.VITE_BACKEND_HOST || 'mechanic-setu.onrender.com').replace(/^(https?:\/\/)/, '')
        : window.location.host;

      const wsUrl = `${wsScheme}://${backendHost}/ws/job_notifications/?token=${wsToken}`;
      // --- FIX ENDS HERE ---

      console.log("[WS] Connecting to:", wsUrl);
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("[WS] Connected");
        setSocket(newSocket);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      newSocket.onmessage = (event) => {
        console.log("[WS] Message:", event.data);
        try {
            const data = JSON.parse(event.data);
            window.dispatchEvent(new CustomEvent('newJobAvailable', { detail: data }));
        } catch (e) {
            console.error("Error parsing WS message", e);
        }
      };

      newSocket.onclose = () => {
        console.log("[WS] Disconnected");
        setSocket(null);
        setConnectionStatus('disconnected');
        // Optional: Implement a reconnect strategy
      };

      newSocket.onerror = (error) => {
        console.error("[WS] Error:", error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error("[WS] Connection setup failed:", error);
      setConnectionStatus('error');
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      console.log("[WS] Closing connection.");
      socket.close(1000, "User initiated disconnect");
      setSocket(null);
      setConnectionStatus('disconnected');
    }
  };

  const value = {
    socket,
    connectionStatus,
    isOnline,
    setIsOnline,
    isVerified,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};