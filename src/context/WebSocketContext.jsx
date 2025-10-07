import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import JobNotificationPopup from '@/components/JobNotificationPopup';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null);
  const [job, setJob] = useState(null);
  const reconnectAttempts = useRef(0);
  const intendedOnlineState = useRef(false);

  const updateStatus = (status) => {
    try {
      if (status === 'OFFLINE') {
        fetch('/api/jobs/UpdateMechanicStatus/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'OFFLINE' }),
          keepalive: true,
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

  useEffect(() => {
    fetchInitialStatus();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && intendedOnlineState.current) {
        updateStatus('OFFLINE');
      } else if (document.visibilityState === 'visible' && intendedOnlineState.current) {
        handleSetIsOnline(true);
      }
    };

    const handlePageHide = () => {
      if (intendedOnlineState.current) {
        updateStatus('OFFLINE');
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        fetchInitialStatus();
      }
    }

    const handleNewJob = (event) => {
      setJob(event.detail);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('newJobAvailable', handleNewJob);

    if (isOnline && isVerified) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('newJobAvailable', handleNewJob);
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

      // src/context/WebSocketContext.jsx

      // Inside the connectWebSocket function
      newSocket.onopen = () => {
        console.log("%c[WS] Connection successful!", "color: #4CAF50; font-weight: bold;");
        setSocket(newSocket);
        setConnectionStatus('connected');
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Log the raw data from the server
          console.log("%c[WS] Message Received:", "color: #2196F3; font-weight: bold;", data);

          // Check if the received data has the 'job' key
          if (data.job) {
            console.log("[WS] 'job' key found. Dispatching 'newJobAvailable' event.");
            window.dispatchEvent(new CustomEvent('newJobAvailable', { detail: data.job }));
          } else {
            console.warn("[WS] Received message, but it's missing the 'job' key.", data);
          }

        } catch (e) {
          console.error("[WS] Error parsing message:", e);
        }
      };

      newSocket.onclose = (event) => {
        console.warn(`[WS] Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        setSocket(null);
        setConnectionStatus('disconnected');
      };

      newSocket.onerror = (error) => {
        console.error("[WS] An error occurred:", error);
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

  const handleSetIsOnline = (newIsOnline) => {
    intendedOnlineState.current = newIsOnline;
    setIsOnline(newIsOnline);
    updateStatus(newIsOnline ? 'ONLINE' : 'OFFLINE');
  };

  const handleAcceptJob = () => {
    if (socket && job && basicNeeds) {
      socket.send(JSON.stringify({
        type: 'accept_job',
        service_request_id: job.id,
        mechanic_user_id: basicNeeds.user_id, // Ensure user_id is in basicNeeds
      }));
    }
    setJob(null); // Close the popup
  };

  const handleRejectJob = () => {
    // Just close the popup for now
    console.log('Rejected job:', job);
    setJob(null);
  };

  const value = {
    socket,
    connectionStatus,
    isOnline,
    setIsOnline: handleSetIsOnline,
    isVerified,
    basicNeeds,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
      <JobNotificationPopup
        job={job}
        onAccept={handleAcceptJob}
        onReject={handleRejectJob}
      />
    </WebSocketContext.Provider>
  );
};