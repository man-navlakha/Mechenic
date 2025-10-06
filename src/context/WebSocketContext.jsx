import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null); // 👈 State to hold user data
  const reconnectAttempts = useRef(0);

  // Fetch initial mechanic status and data when the app loads
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const res = await api.get("/jobs/GetBasicNeeds/");
        const data = res.data.basic_needs || {};
        setBasicNeeds(data); // 👈 Store all basic needs data
        setIsVerified(!!data.is_verified);
        // Only set online if also verified
        setIsOnline(data.status === "ONLINE" && !!data.is_verified);
      } catch (error) {
        console.warn("Failed to fetch initial status:", error);
        // User is likely not authenticated, which is a normal state on the login page.
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

    return () => {
      disconnectWebSocket();
    };
  }, [isOnline, isVerified]);

  const connectWebSocket = async () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }
    
    setConnectionStatus('connecting');
    try {
      const res = await api.get("core/ws-token/", { withCredentials: true });
      const wsToken = res.data.ws_token;
      if (!wsToken) throw new Error("Failed to get WebSocket token");

      const isProduction = import.meta.env.PROD;
      const wsScheme = isProduction ? "wss" : "ws";
      const backendHost = isProduction
        ? (import.meta.env.VITE_BACKEND_HOST || 'mechanic-setu.onrender.com').replace(/^(https?:\/\/)/, '')
        : window.location.host;

      const wsUrl = `${wsScheme}://${backendHost}/ws/job_notifications/?token=${wsToken}`;
      
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("[WS] Connected");
        setSocket(newSocket);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      newSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("[WS] Message:", data);
            window.dispatchEvent(new CustomEvent('newJobAvailable', { detail: data }));
        } catch (e) {
            console.error("Error parsing WS message", e);
        }
      };

      newSocket.onclose = () => {
        console.log("[WS] Disconnected");
        setSocket(null);
        setConnectionStatus('disconnected');
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
      socket.close(1000, "User initiated disconnect");
    }
  };

  // The value provided by the context
  const value = {
    socket,
    connectionStatus,
    isOnline,
    setIsOnline,
    isVerified,
    basicNeeds, // 👈 Expose the basicNeeds data
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};