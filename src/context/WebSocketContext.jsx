import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import JobNotificationPopup from '@/components/JobNotificationPopup';
import JobInProgress from '@/components/JobInProgress';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import UnverifiedPage from '@/components/UnverifiedPage';



const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // NEW
  const jobTimeoutRef = useRef(null);
  const jobNotificationSound = new Audio('/sounds/reliable-safe-327618.mp3');




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
  // ADD THESE TWO LINES:
  const publicRoutes = ['/login', '/logout', '/form']; // Add any other public routes
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));


  const userInteracted = useRef(false);



  useEffect(() => {
    const markInteracted = () => { userInteracted.current = true; };
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
    if (socketRef.current && [WebSocket.OPEN, WebSocket.CONNECTING].includes(socketRef.current.readyState)) {
      console.log("WebSocket already active, skipping reconnect.");
      return;
    }

    console.log("Connecting to WebSocket...");
    setConnectionStatus('connecting');

    try {
      const res = await api.get("core/ws-token/", { withCredentials: true });
      const wsToken = res.data.ws_token;
      if (!wsToken) throw new Error("Missing WebSocket token");

      const isProduction = import.meta.env.PROD;
      const wsScheme = isProduction ? "wss" : "ws";
      const backendHost = isProduction
        ? (import.meta.env.VITE_BACKEND_HOST || 'mechanic-setu.onrender.com').replace(/^https?:\/\//, '')
        : window.location.host;

      const wsUrl = `${wsScheme}://${backendHost}/ws/job_notifications/?token=${wsToken}`;
      console.log("WS URL:", wsUrl);

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("%c[WS] Connected!", "color: limegreen;");
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        setSocket(ws);

      };

      ws.onmessage = (event) => {
        console.log("[WS] Received:", event.data);
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "new_job":
              if (data.service_request) {
                console.log("[WS] New job received:", data.service_request);
                window.dispatchEvent(
                  new CustomEvent("newJobAvailable", { detail: data.service_request })
                );
              }
              break;

            case "job_update":
            case "job_status_update":
              if (data.job) setJob(data.job);
              break;

            case "job_taken":
              if (job?.id?.toString() === data.job_id?.toString()) {
                alert("This job was taken by another mechanic.");
                clearJob();
              }
              break;

            case "job_expired":
            case "job_cancelled":
              if (job?.id?.toString() === data.job_id?.toString()) {
                clearJob();
                if (data.type === "job_cancelled") alert(`Job cancelled: ${data.message}`);
              }
              break;

            default:
              console.log("[WS] Unhandled type:", data.type);
          }
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      ws.onclose = (e) => {
        console.warn("[WS] Closed:", e.code, e.reason);
        setSocket(null);
        setConnectionStatus("disconnected");

      
        if (intendedOnlineState.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(3000 * reconnectAttempts.current, 30000);
          console.log(`Reconnect attempt ${reconnectAttempts.current} in ${delay}ms`);
          setTimeout(connectWebSocket, delay);
        }
      };

      ws.onerror = (err) => {
        console.error("[WS] Error:", err);
        setConnectionStatus("error");
      };
    } catch (err) {
      console.error("[WS] Failed to connect:", err);
      setConnectionStatus("error");
    }
  };

  useEffect(() => {
    if (!job || basicNeeds?.status === 'WORKING') return;

    console.log('[Job Timer] Starting 30s auto-reject timer...');
    clearTimeout(jobTimeoutRef.current);

    jobTimeoutRef.current = setTimeout(() => {
      console.warn('[Job Timer] Job auto-rejected (timeout).');
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'job_status_update',
          job_id: job.id,
          status: 'REJECTED',
          reason: 'timeout',
        }));
      }
      setJob(null);
      localStorage.removeItem('acceptedJob');
    }, 30000);

    return () => clearTimeout(jobTimeoutRef.current);
  }, [job, basicNeeds?.status]);

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
    const jobData = event.detail;
    console.log("New job available:", jobData);
    setJob(jobData);

    // Only play sound if user has interacted with the page
    if (userInteracted.current) {
      const sound = new Audio('/sounds/alert-33762.mp3');
      sound.volume = 0.5;
      sound.currentTime = 0;

      sound.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    } else {
      console.log("User not interacted yet — skipping sound play.");
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

  useEffect(() => {
    const unlockAudio = () => {
      if (jobNotificationSound.current) {
        jobNotificationSound.current.play()
          .then(() => {
            jobNotificationSound.current.pause();
            jobNotificationSound.current.currentTime = 0;
            console.log("Audio unlocked ✅");
          })
          .catch(() => { });
      }
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  // Modified handleAcceptJob function
  const handleAcceptJob = async () => {
    if (!job) return;

    try {
      // Immediately stop auto-reject timer
      clearTimeout(jobTimeoutRef.current);

      console.log(`[JOB] Accepting job #${job.id}...`);

      // Accept the job through API
      const res = await api.post(`/jobs/AcceptServiceRequest/${job.id}/`);
      const acceptedJob = res.data?.job || job;
      console.log("[JOB] Accepted via API:", acceptedJob);

      // Stop receiving new jobs
      intendedOnlineState.current = false;
      setIsOnline(false);

      // Update mechanic status locally and remotely
      await api.put("/jobs/UpdateMechanicStatus/", { status: "WORKING" });
      setBasicNeeds(prev => ({ ...prev, status: "WORKING" }));

      // Save to localStorage for persistence
      localStorage.setItem("acceptedJob", JSON.stringify(acceptedJob));
      setJob(acceptedJob);

      // Optionally notify WebSocket (if supported)
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "job_status_update",
          job_id: acceptedJob.id,
          status: "ACCEPTED",
        }));
      }

      console.log("[JOB] Navigation to job page...");
      navigate(`/job/${acceptedJob.id}`);
    } catch (error) {
      console.error("[JOB] Failed to accept job:", error);

      // fallback — restore 30s auto reject if still pending
      jobTimeoutRef.current = setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "job_status_update",
            job_id: job.id,
            status: "REJECTED",
            reason: "timeout_after_accept_failure",
          }));
        }
        setJob(null);
        localStorage.removeItem("acceptedJob");
      }, 30000);
    }
  };






  const cancelJob = async (jobId, reason) => {
    try {
      await api.post(`/jobs/CancelServiceRequest/${jobId}/`, { cancellation_reason: reason });
      console.log("Job cancellation request sent.");
      clearJob();
      navigate('/');
    } catch (error) {
      console.error("Failed to cancel job:", error);
      // Optionally, re-throw or handle the error in the UI
      throw error;
    }
  };

  const completeJob = async (jobId, price) => {
    try {
      await api.post(`/jobs/CompleteServiceRequest/${jobId}/`, { price });
      console.log("Job completion request sent.");

      // Go back to being online after completing a job
      await updateStatus("ONLINE");

      clearJob();
      navigate('/');
    } catch (error) {
      console.error("Failed to complete job:", error);
      throw error;
    }
  };


  // Add this useEffect to handle 401 errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error) => {
        // Check if it's a 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          console.error("Authentication error (401):", error.response.data);

          // Check for the specific DRF message
          if (error.response.data?.detail === "Authentication credentials were not provided.") {
            console.log("Redirecting to login due to 401.");
            // Perform the redirect to the login page
            navigate('/login');
          }
        }
        // Important: reject the promise so the original .catch() blocks still fire
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove the interceptor when the component unmounts
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]); // Add navigate as a dependency


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
    clearTimeout(jobTimeoutRef.current);

  };
  // 🔔 Play sound when JobNotificationPopup appears
  useEffect(() => {
    // Play alert repeatedly for 30 seconds while popup is active
    if (job && basicNeeds?.status !== "WORKING" && userInteracted.current) {
      const sound = new Audio("/sounds/alert-33762.mp3");
      sound.volume = 0.5;

      let playCount = 0;
      const maxDuration = 30000; // 30 seconds total
      const playInterval = 4000; // repeat every 4 seconds

      const playSound = () => {
        sound.currentTime = 0;
        sound.play().catch(err =>
          console.warn("Notification sound failed:", err)
        );
        playCount++;
      };

      // play immediately
      playSound();

      // repeat until 30 s reached or job cleared
      const intervalId = setInterval(playSound, playInterval);

      // safety timeout to stop after 30 s
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        console.log("[Sound] Stopped after 30 s timeout.");
      }, maxDuration);

      // cleanup when job changes or popup closes
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        sound.pause();
        sound.currentTime = 0;
        console.log("[Sound] Stopped (cleanup).");
      };
    }
  }, [job, basicNeeds?.status]);


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
    cancelJob,
    completeJob,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {isPublicRoute || isVerified ? children : <UnverifiedPage />}
      {isVerified && !isPublicRoute && (
        <>

          {/* "Active Job" banner */}
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

          {/* "New Job" popup */}
          {!isOnJobPage && basicNeeds?.status !== "WORKING" && job && (
            <JobNotificationPopup
              job={job}
              onAccept={handleAcceptJob}
              onReject={handleRejectJob}
            />
          )}
        </>
      )}
    </WebSocketContext.Provider>
  );
};