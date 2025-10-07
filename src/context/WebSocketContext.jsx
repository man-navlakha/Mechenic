import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null);
  const reconnectAttempts = useRef(0);
  // A ref to track the intended online state, separate from the actual connection
  const intendedOnlineState = useRef(false);

  // Function to update the mechanic's status on the backend
  const updateStatus = (status) => {
    try {
      if (status === 'OFFLINE') {
        fetch('/api/jobs/UpdateMechanicStatus/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'OFFLINE' }),
          keepalive: true, // <--- this is key!
        });
      } else {
        api.put("/jobs/UpdateMechanicStatus/", { status });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };


  const fetchInitialStatus = async () => {
    try {
      const res = await api.get("/jobs/GetBasicNeeds/");
      const data = res.data.basic_needs || {};
      setBasicNeeds(data);
      setIsVerified(!!data.is_verified);
      const serverIsOnline = data.status === "ONLINE" && !!data.is_verified;
      setIsOnline(serverIsOnline);
      intendedOnlineState.current = serverIsOnline;
    } catch (error) {
      console.warn("Failed to fetch initial status:", error);
    }
  };

  // Fetch initial status on mount
  useEffect(() => {
    fetchInitialStatus();
  }, []);

  // Effect to manage page lifecycle events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && intendedOnlineState.current) {
        updateStatus('OFFLINE');
      } else if (document.visibilityState === 'visible' && intendedOnlineState.current) {
        // When tab becomes visible again, reconnect if the user intended to be online
        setIsOnline(true);
      }
    };

    const handlePageHide = (event) => {
      if (intendedOnlineState.current) {
        updateStatus('OFFLINE');
      }
    };

    // This handles the user navigating back to the page
    const handlePageShow = (event) => {
      if (event.persisted) {
        // Re-fetch status if the page was loaded from cache (e.g., back button)
        fetchInitialStatus();
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange);
    // 'pagehide' is more reliable than 'beforeunload' for this purpose
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);


    // WebSocket connection logic
    if (isOnline && isVerified) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
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

  // This function will be called from the StatusSwitch component
  const handleSetIsOnline = (newIsOnline) => {
    intendedOnlineState.current = newIsOnline;
    setIsOnline(newIsOnline);
    updateStatus(newIsOnline ? 'ONLINE' : 'OFFLINE');
  };


  const value = {
    socket,
    connectionStatus,
    isOnline,
    setIsOnline: handleSetIsOnline, // Expose the new handler
    isVerified,
    basicNeeds,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};