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
  const maxReconnectAttempts = 5;

  const updateStatus = async (status) => {
    try {
      console.log("Updating status to:", status);
      if (status === 'OFFLINE') {
        await fetch('/api/jobs/UpdateMechanicStatus/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'OFFLINE' }),
          keepalive: true,
        });
      } else {
        await api.put("/jobs/UpdateMechanicStatus/", { status });
      }
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const fetchInitialStatus = async () => {
    try {
      console.log("Fetching initial status...");
      const res = await api.get("/jobs/GetBasicNeeds/");
      const data = res.data.basic_needs || {};
      console.log("Basic needs data:", data);

      setBasicNeeds(data);
      setIsVerified(!!data.is_verified);

      const serverIsOnline = data.status === "ONLINE" && !!data.is_verified;
      console.log("Server online status:", serverIsOnline);

      setIsOnline(serverIsOnline);
      intendedOnlineState.current = serverIsOnline;
    } catch (error) {
      console.warn("Failed to fetch initial status:", error);
    }
  };

  useEffect(() => {
    console.log("Initial mount - fetching status");
    fetchInitialStatus();
  }, []);

  const connectWebSocket = async () => {
    // Prevent multiple connections
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      console.log("WebSocket already exists with state:", socket.readyState);
      return;
    }

    console.log("Starting WebSocket connection...");
    setConnectionStatus('connecting');

    try {
      const res = await api.get("core/ws-token/", { withCredentials: true });
      const wsToken = res.data.ws_token;
      console.log("WebSocket token received:", wsToken ? "Yes" : "No");

      if (!wsToken) {
        throw new Error("Failed to get WebSocket token");
      }

      const isProduction = import.meta.env.PROD;
      const wsScheme = isProduction ? "wss" : "ws";

      let backendHost;
      if (isProduction) {
        backendHost = import.meta.env.VITE_BACKEND_HOST || 'mechanic-setu.onrender.com';
        backendHost = backendHost.replace(/^(https?:\/\/)/, '');
        console.log("Production backend host:", backendHost);
      } else {
        backendHost = window.location.host;
        console.log("Development backend host:", backendHost);
      }

      const wsUrl = `${wsScheme}://${backendHost}/ws/job_notifications/?token=${wsToken}`;
      console.log("WebSocket URL:", wsUrl);

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("%c[WS] Connection successful!", "color: #4CAF50; font-weight: bold;");
        console.log("WebSocket readyState:", newSocket.readyState);
        setSocket(newSocket);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WS] Raw message received:", event.data);
          console.log("[WS] Parsed data:", data);

          if (data.type === 'new_job') {
            console.log("New job detected - full data:", data);
            console.log("Service request data:", data.service_request);

            if (data.service_request) {
              console.log("Dispatching newJobAvailable event with detail:", data.service_request);
              window.dispatchEvent(new CustomEvent('newJobAvailable', {
                detail: data.service_request
              }));
            } else {
              console.warn("New job type but no service_request in data");
            }
          } else {
            console.log("Other WebSocket message type:", data.type);
          }

        } catch (e) {
          console.error("Error parsing WS message", e, "Raw data:", event.data);
        }
      };

      newSocket.onclose = (event) => {
        console.warn(`[WS] Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        console.log("WebSocket close event:", event);
        setSocket(null);
        setConnectionStatus('disconnected');

        // Reconnection logic
        if (reconnectAttempts.current < maxReconnectAttempts && intendedOnlineState.current) {
          reconnectAttempts.current += 1;
          const delay = Math.min(3000 * reconnectAttempts.current, 30000);
          console.log(`Attempting reconnect ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);

          setTimeout(() => {
            if (intendedOnlineState.current) {
              connectWebSocket();
            }
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached");
        }
      };

      newSocket.onerror = (error) => {
        console.error("[WS] WebSocket error occurred");
        console.error("WebSocket error details:", error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error("[WS] Connection setup failed:", error);
      setConnectionStatus('error');

      // Retry connection on setup failure
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = 3000 * reconnectAttempts.current;
        console.log(`Retrying connection setup ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
          if (intendedOnlineState.current) {
            connectWebSocket();
          }
        }, delay);
      }
    }
  };

  const disconnectWebSocket = () => {
    console.log("Disconnecting WebSocket...");
    if (socket) {
      socket.close(1000, "User initiated disconnect");
    }
    setSocket(null);
    setConnectionStatus('disconnected');
  };

  const handleSetIsOnline = (newIsOnline) => {
    console.log("Setting online state to:", newIsOnline);
    intendedOnlineState.current = newIsOnline;
    setIsOnline(newIsOnline);
    updateStatus(newIsOnline ? 'ONLINE' : 'OFFLINE');
  };

  const handleNewJob = (event) => {
    console.log("newJobAvailable event received:", event.detail);
    setJob(event.detail);
  };

  useEffect(() => {
    console.log("WebSocket Effect - isOnline:", isOnline, "isVerified:", isVerified);

    const handleVisibilityChange = () => {
      console.log("Visibility changed:", document.visibilityState);
      if (document.visibilityState === 'hidden' && intendedOnlineState.current) {
        console.log("Page hidden, setting offline");
        updateStatus('OFFLINE');
      } else if (document.visibilityState === 'visible' && intendedOnlineState.current) {
        console.log("Page visible, setting online");
        handleSetIsOnline(true);
      }
    };

    const handlePageHide = () => {
      console.log("Page hide event");
      if (intendedOnlineState.current) {
        updateStatus('OFFLINE');
      }
    };

    const handlePageShow = (event) => {
      console.log("Page show event, persisted:", event.persisted);
      if (event.persisted) {
        fetchInitialStatus();
      }
    };

    // Add event listener for new jobs
    window.addEventListener('newJobAvailable', handleNewJob);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    console.log("Setting up WebSocket based on conditions");
    if (isOnline && isVerified) {
      console.log("Conditions met - connecting WebSocket");
      connectWebSocket();
    } else {
      console.log("Conditions not met - isOnline:", isOnline, "isVerified:", isVerified);
      disconnectWebSocket();
    }

    return () => {
      console.log("Cleaning up WebSocket connection and event listeners");
      window.removeEventListener('newJobAvailable', handleNewJob);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      disconnectWebSocket();
    };
  }, [isOnline, isVerified]);

  const handleAcceptJob = () => {
    console.log("Accepting job:", job);
    if (socket && socket.readyState === WebSocket.OPEN && job && basicNeeds) {
      const acceptMessage = {
        type: 'accept_job',
        service_request_id: job.id,
        mechanic_user_id: basicNeeds.user_id,
      };
      console.log("Sending accept message:", acceptMessage);
      socket.send(JSON.stringify(acceptMessage));
    } else {
      console.warn("Cannot accept job - missing requirements:", {
        socket: !!socket,
        socketReady: socket ? socket.readyState : 'no socket',
        job: !!job,
        basicNeeds: !!basicNeeds,
        userId: basicNeeds?.user_id
      });
    }
    setJob(null);
  };

  const handleRejectJob = () => {
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
    // Add methods for manual testing
    connectWebSocket,
    disconnectWebSocket,
    simulateNewJob: (testJob) => {
      console.log("Simulating new job:", testJob);
      setJob(testJob);
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}

      {/* Debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 left-2 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
          <div><strong>WebSocket Debug</strong></div>
          <div>Status: <span className={
            connectionStatus === 'connected' ? 'text-green-400' :
              connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
          }>{connectionStatus}</span></div>
          <div>Online: <span className={isOnline ? 'text-green-400' : 'text-red-400'}>{isOnline.toString()}</span></div>
          <div>Verified: <span className={isVerified ? 'text-green-400' : 'text-red-400'}>{isVerified.toString()}</span></div>
          <div>Socket: {socket ? <span className="text-green-400">Connected ({socket.readyState})</span> : <span className="text-red-400">No Socket</span>}</div>
          <div>Current Job: {job ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</div>
          <div>Reconnect: {reconnectAttempts.current}/{maxReconnectAttempts}</div>
          <button
            onClick={() => {
              console.log("Full state:", {
                connectionStatus,
                isOnline,
                isVerified,
                socket: socket ? `readyState: ${socket.readyState}` : null,
                basicNeeds,
                intendedOnline: intendedOnlineState.current,
                job
              });
            }}
            className="mt-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Log State
          </button>
        </div>
      )}

      <JobNotificationPopup
        job={job}
        onAccept={handleAcceptJob}
        onReject={handleRejectJob}
      />
    </WebSocketContext.Provider>
  );
};