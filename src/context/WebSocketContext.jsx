import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import JobNotificationPopup from '@/components/JobNotificationPopup';
import JobInProgress from '@/components/JobInProgress';
// Add import at top
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";



const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // NEW
  const jobTimeoutRef = useRef(null);
  const jobNotificationSound = new Audio('/sounds/alert-33762.mp3');
  jobNotificationSound.volume = 0.5;
  jobNotificationSound.preload = 'auto';



  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null);
  const [job, setJob] = useState(null);
  const reconnectAttempts = useRef(0);
  const intendedOnlineState = useRef(false);
  const maxReconnectAttempts = 5;
  const locationInterval = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isOnJobPage =
    location.pathname.startsWith("/job/") ||
    location.pathname.startsWith("/login");


  const userInteracted = useRef(false);

  // Listen for first interaction
  useEffect(() => {
    const markInteracted = () => { userInteracted.current = true; }
    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    window.addEventListener('touchstart', markInteracted, { once: true });
    return () => {
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
    };
  }, []);


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
        setSocket(newSocket);
        socketRef.current = newSocket;
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        // --- START: Location Sending Logic ---
        if (locationInterval.current) {
          clearInterval(locationInterval.current);
        }

        // Send location immediately on connect, then every 1 minute
        const sendLocation = () => {
          if (newSocket.readyState === WebSocket.OPEN) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`[Location] Sending update: lat=${latitude}, lon=${longitude}`);
                newSocket.send(JSON.stringify({
                  type: 'location_update',
                  latitude,
                  longitude,
                }));
              },
              (error) => {
                console.error("[Location] Error getting position:", error.message);
              },
              { enableHighAccuracy: true }
            );
          }
        };

        sendLocation(); // Send once immediately
        locationInterval.current = setInterval(sendLocation, 60000); // And then every 60 seconds
        // --- END: Location Sending Logic ---
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WS] Raw message received:", event.data);
          console.log("[WS] Parsed data:", data);

          if (data.type === 'new_job' && data.service_request) {
            window.dispatchEvent(new CustomEvent('newJobAvailable', {
              detail: data.service_request
            }));
          } else if (data.type === 'job_update' || data.type === 'job_status_ack' || data.type === 'job_status_update') {
            if (data.job) {
              setJob(data.job);
            } else if (data.job_id && data.status) {
              setJob(prev => (prev?.id?.toString() === data.job_id.toString()) ? { ...prev, status: data.status } : prev);
              if (['COMPLETED', 'CANCELLED'].includes(data.status)) {
                localStorage.removeItem('acceptedJob');
              }
            }
          } else if (data.type === 'job_expired') {
            console.log(`[WS] Job expired: ${data.job_id}`);
            // Only remove popup if the expired job matches the current job
            setJob(prev => (prev?.id?.toString() === data.job_id.toString() ? null : prev));
            localStorage.removeItem('acceptedJob');
          }

        } catch (e) {
          console.error("Error parsing WS message", e, "Raw data:", event.data);
        }
      };


      newSocket.onclose = (event) => {
        console.warn(`[WS] Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        console.log("WebSocket close event:", event);
        setSocket(null);
        socketRef.current = null;

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
    if (socketRef.current) {
      socketRef.current.close(1000, "User initiated disconnect");
    }
    setSocket(null);
    socketRef.current = null;
    setConnectionStatus('disconnected');
  };

  // Send job status over websocket (with REST fallback)
  const sendJobStatus = async (jobId, status) => {
    const payload = { type: 'job_status_update', job_id: jobId.toString(), status }; // status: "COMPLETED" | "CANCELLED"
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
        console.log('[WS] Sent job status via WS', payload);
        return { ok: true, via: 'ws' };
      } else {
        console.warn('[WS] socket not open — falling back to REST', payload);
        // REST fallback (adjust endpoint to match your backend)
        await api.post(`/jobs/UpdateJobStatus/${jobId}/`, { status });
        return { ok: true, via: 'rest' };
      }
    } catch (err) {
      console.error('[sendJobStatus] failed', err);
      try {
        // second chance: REST fallback
        await api.post(`/jobs/UpdateJobStatus/${jobId}/`, { status });
        return { ok: true, via: 'rest' };
      } catch (err2) {
        console.error('[sendJobStatus] REST fallback failed', err2);
        return { ok: false, error: err2 };
      }
    }
  };

  const clearJob = () => {
    setJob(null);
    localStorage.removeItem('acceptedJob');
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

    if (userInteracted.current) {
      jobNotificationSound.currentTime = 0; // restart sound if already playing
      jobNotificationSound.play().catch(err => {
        console.warn("Audio play failed:", err);
      });
    }
  };




  useEffect(() => {
    const handleVisibilityChange = () => {
      if (basicNeeds?.status === 'WORKING') return;
      if (document.visibilityState === 'hidden' && intendedOnlineState.current) {
        updateStatus('OFFLINE');
      } else if (document.visibilityState === 'visible' && intendedOnlineState.current) {
        handleSetIsOnline(true);
      }
    };

    const handlePageHide = () => {
      if (intendedOnlineState.current) updateStatus('OFFLINE');
    };

    const handlePageShow = (event) => {
      if (event.persisted) fetchInitialStatus();
    };

    const handleNewJob = (event) => setJob(event.detail);

    // Fetch initial status
    fetchInitialStatus().then(() => {
      const storedJob = localStorage.getItem("acceptedJob");
      if (storedJob) {
        const parsedJob = JSON.parse(storedJob);
        if (parsedJob) {
          setJob(parsedJob);
          setBasicNeeds(prev => ({ ...prev, status: "WORKING" }));
          intendedOnlineState.current = true;
          setIsOnline(true);
        }
      }
    });

    // Add event listeners
    window.addEventListener("newJobAvailable", handleNewJob);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    // Connect WebSocket only if verified
    if (isVerified) connectWebSocket();

    return () => {
      window.removeEventListener("newJobAvailable", handleNewJob);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      disconnectWebSocket();
    };
  }, [isVerified]);


  // Modified handleAcceptJob function
  const handleAcceptJob = async () => {
    if (!job) return;
    try {
      // Accept job via API
      await api.post(`/jobs/AcceptServiceRequest/${job.id}/`);
      console.log("Job accepted via API.");

      // Update mechanic status → WORKING
      await api.put("/jobs/UpdateMechanicStatus/", { status: "WORKING" });
      console.log("Mechanic status updated to WORKING");

      // Update local state immediately
      setBasicNeeds(prev => ({ ...prev, status: "WORKING" }));
      intendedOnlineState.current = true;
      setIsOnline(true);

      // Save job locally
      localStorage.setItem("acceptedJob", JSON.stringify(job));
      setJob(job);

      // Navigate to job details page
      navigate(`/job/${job.id}`);
    } catch (error) {
      console.error("Failed to accept job:", error);
    }
  };




  useEffect(() => {
    console.log("Initial mount - fetching status");
    fetchInitialStatus();

    // ✅ Restore accepted job if not ONLINE
    const storedJob = localStorage.getItem('acceptedJob');
    if (storedJob) {
      const parsedJob = JSON.parse(storedJob);
      // Don't show if status is already ONLINE
      if (parsedJob && basicNeeds?.status !== 'ONLINE') {
        console.log("Restoring accepted job from localStorage:", parsedJob);
        setJob(parsedJob);
      }
    }
  }, []);


  useEffect(() => {
    if (basicNeeds?.status === 'ONLINE') {
      localStorage.removeItem('acceptedJob');
      setJob(null); // clear in-memory job too
      console.log("Status is ONLINE — cleared accepted job");
    }
  }, [basicNeeds?.status]);

  {
    job && basicNeeds?.status !== 'ONLINE' && (
      <JobInProgress job={job} />
    )
  }


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
    connectWebSocket,
    disconnectWebSocket,
    job,               // expose current job
    sendJobStatus,     // function to send status
    clearJob,          // helper to clear job & localStorage

  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}

      {/* Debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-19 left-2 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
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
      {!isOnJobPage && basicNeeds?.status === "WORKING" && job && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white flex items-center justify-between px-4 py-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold">Active Job #{job.id}</span>
            <span className="text-sm opacity-90 truncate max-w-xs">{job.problem}</span>
          </div>
          <button
            onClick={() => navigate(`/job/${job.id}`)}
            className="bg-white text-blue-600 px-3 py-1 rounded-md font-medium hover:bg-gray-100 transition"
          >
            View Job
          </button>
        </div>
      )}

      {!isOnJobPage && basicNeeds?.status !== "WORKING" && job && (
        <JobNotificationPopup
          job={job}
          onAccept={handleAcceptJob}
          onReject={handleRejectJob}
        />
      )}



    </WebSocketContext.Provider>
  );
};