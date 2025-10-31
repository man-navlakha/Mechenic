// WebSocketProvider.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import JobNotificationPopup from '@/components/JobNotificationPopup';
import JobInProgress from '@/components/JobInProgress';
import UnverifiedPage from '@/components/UnverifiedPage';
import { toast } from "sonner";
import { useNavigate, useLocation } from 'react-router-dom';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used inside a <WebSocketProvider>");
  }
  return ctx;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const connectionStatusRef = useRef('disconnected'); // keep a ref mirror
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isOnline, setIsOnlineState] = useState(false); // mechanic visible online state
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null);
  const [job, setJob] = useState(null);

  const jobRef = useRef(null);
  const lastClearedJobId = useRef(null);
  const jobTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const intendedOnlineState = useRef(false); // what user intends (toggle)
  const pendingMessages = useRef([]); // queue for messages to be sent when ws reconnects
  const pingIntervalRef = useRef(null);
  const userInteracted = useRef(false);
  const audioRef = useRef(new Audio('/sounds/alert-33762.mp3'));
  const jobNotificationSound = useRef(new Audio('/sounds/reliable-safe-327618.mp3'));

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ['/login', '/logout', '/form', '/verify'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
  const isOnJobPage =
    location.pathname.startsWith("/job/") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/verify");

  // local mirrors & helpers
  useEffect(() => { jobRef.current = job; }, [job]);

  // Mark that the user has interacted (so we can play audio)
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

  // Simple debounce helper used for updateStatus
  const debounce = (fn, delay = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  // ===== API: update mechanic status (with small debounce) =====
  const updateStatus = debounce(async (status) => {
    try {
      console.log("[STATUS] Updating mechanic status to:", status);
      if (status === 'OFFLINE') {
        // Use fetch with keepalive to try to succeed on pagehide
        await fetch('/api/jobs/UpdateMechanicStatus/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OFFLINE' }),
          keepalive: true,
        });
      } else {
        await api.put("/jobs/UpdateMechanicStatus/", { status });
      }
      console.log("[STATUS] Status updated successfully ✅");
      toast.success(`Status set to ${status}`);
    } catch (error) {
      console.error("[STATUS] Failed to update status:", error);
      toast.error("Failed to update status.");
    }
  }, 800);

  // ===== fetch initial status from server (basic_needs) =====
  const fetchInitialStatus = async () => {
    try {
      const res = await api.get("/jobs/GetBasicNeeds/");
      const data = res.data.basic_needs || {};
      setBasicNeeds(data);
      setIsVerified(!!data.is_verified);
      const serverIsOnline = data.status === "ONLINE" && !!data.is_verified;
      setIsOnlineState(serverIsOnline);
      intendedOnlineState.current = serverIsOnline;
      return data;
    } catch (err) {
      console.warn("[WS] fetchInitialStatus failed:", err);
      return null;
    }
  };

  // ===== helpers: queue + flush messages =====
  const queueMessage = (payload) => {
    pendingMessages.current.push(payload);
    console.log("[WS] queued message:", payload, "queueLen:", pendingMessages.current.length);
  };

  const flushQueue = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    while (pendingMessages.current.length > 0) {
      const msg = pendingMessages.current.shift();
      try {
        socketRef.current.send(JSON.stringify(msg));
        console.log("[WS] Flushed queued message:", msg);
      } catch (err) {
        console.error("[WS] Failed to flush message, requeueing:", err, msg);
        pendingMessages.current.unshift(msg);
        break;
      }
    }
  };

  // ===== connect logic with token fetch and event handlers =====
  const connectWebSocket = async () => {
    // prevent duplicate connects
    if (socketRef.current && [WebSocket.OPEN, WebSocket.CONNECTING].includes(socketRef.current.readyState)) {
      console.log("[WS] socket already active; skipping connect.");
      return;
    }

    if (!intendedOnlineState.current) {
      console.log("[WS] Intended state is offline; skipping connect.");
      return;
    }

    if (!isVerified) {
      console.log("[WS] User not verified; skipping connect.");
      return;
    }

    setConnectionStatus('connecting');
    connectionStatusRef.current = 'connecting';
    try {
      const res = await api.get("core/ws-token/", { withCredentials: true });
      const wsToken = res?.data?.ws_token;
      if (!wsToken) throw new Error("Missing WebSocket token from server");

      const isProduction = import.meta.env.PROD;
      const wsScheme = isProduction ? "wss" : "ws";
      const backendHost = isProduction
        ? (import.meta.env.VITE_BACKEND_HOST || 'mechanic-setu.onrender.com').replace(/^https?:\/\//, '')
        : window.location.host;

      const wsUrl = `${wsScheme}://${backendHost}/ws/job_notifications/?token=${wsToken}`;
      console.log("[WS] connecting to", wsUrl);

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = async () => {
        console.log("%c[WS] Connected!", "color: limegreen;");
        setConnectionStatus('connected');
        connectionStatusRef.current = 'connected';
        reconnectAttempts.current = 0;
        setSocket(ws);

        // start lightweight ping to detect half-open connections
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          try {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: "ping", ts: Date.now() }));
            }
          } catch (e) { /* ignore */ }
        }, 25000); // every 25s

        // flush any queued messages
        flushQueue();

        // Revalidate current job (important after reconnect)
        if (jobRef.current?.id) {
          try {
            const r = await api.get(`/jobs/GetJob/${jobRef.current.id}/`);
            const serverJob = r?.data?.job;
            if (!serverJob || serverJob.status === "CANCELLED" || serverJob.status === "EXPIRED") {
              console.warn("[WS] Current job invalid on server; clearing local job.");
              lastClearedJobId.current = jobRef.current.id?.toString();
              setJob(null);
              jobRef.current = null;
              localStorage.removeItem("acceptedJob");
              toast.warning("Job was cancelled or expired while you were disconnected.");
            } else {
              // update any changed fields from server
              setJob(serverJob);
            }
          } catch (err) {
            console.warn("[WS] Revalidate job failed:", err);
          }
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // handle message types
          switch (data.type) {
            case "new_job": {
              const newJob = data.service_request;
              console.log("%c[WS] >>> NEW_JOB EVENT RECEIVED <<<", "color: #00eaff; font-weight: bold;");
              console.log("[WS] new_job payload:", newJob);
              console.log("[WS] current basicNeeds?.status:", basicNeeds?.status);
              console.log("[WS] current jobRef:", jobRef.current);
              console.log("[WS] current jobRef.id:", jobRef.current?.id);
              console.log("[WS] newJob.status:", newJob?.status);

              if (!newJob) {
                console.warn("[WS] new_job missing service_request payload");
                break;
              }

              if (basicNeeds?.status === "WORKING") {
                console.warn("[WS] Ignored new_job because mechanic is WORKING");
                break;
              }

              if (jobRef.current?.id?.toString() === newJob.id?.toString()) {
                console.warn("[WS] Ignored duplicate new_job for same job ID:", newJob.id);
                break;
              }

              if (newJob.status !== "PENDING") {
                console.warn("[WS] Ignored new_job because status is not PENDING:", newJob.status);
                break;
              }

              console.log("%c[WS] ✅ Dispatching newJobAvailable event and updating UI", "color: limegreen; font-weight: bold;");
              window.dispatchEvent(new CustomEvent("newJobAvailable", { detail: newJob }));

              // optional immediate UI preview (to confirm event firing)
              setJob(newJob);
              jobRef.current = newJob;
              break;
            }


            // --- FIX APPLIED HERE ---
            case "job_update":
              if (data.job) setJob(data.job);
              break;

            case "job_status_update":
              console.log("Job status update:", data);
              
              // Update job state if it's the current job
              setJob(prevJob => (prevJob && prevJob.id.toString() === data.job_id.toString()) ? { ...prevJob, status: data.status } : prevJob);
              
              // Show a notification when the job is marked complete
              if (data.status === 'COMPLETED') {
                // You can customize this message
                toast.success(`Job (ID: ${data.job_id}) has been completed!`);
              }
              break;
            // --- END OF FIX ---


            case "job_taken":
              if (jobRef.current?.id?.toString() === data.job_id?.toString()) {
                toast.warning("This job was taken by another mechanic.");
                lastClearedJobId.current = data.job_id?.toString();
                setJob(null);
                jobRef.current = null;
                localStorage.removeItem("acceptedJob");
              }
              break;

            case "job_cancelled":
            case "job_expired": {
              const jobId = data.job_id?.toString();
              // Clear if it’s the same or unknown job to prevent stale state
              if (!jobRef.current || jobRef.current.id?.toString() === jobId) {
                console.log(`[WS] ${data.type} received — clearing local job.`);
                lastClearedJobId.current = jobId;
                setJob(null);
                jobRef.current = null;
                localStorage.removeItem("acceptedJob");
                toast.warning(data.message || `Job ${data.type.replace("job_", "")}`);
                clearTimeout(jobTimeoutRef.current);
                jobTimeoutRef.current = setTimeout(async () => {
                  await updateStatus("ONLINE");
                  setBasicNeeds(prev => ({ ...prev, status: "ONLINE" }));
                  intendedOnlineState.current = true;
                  setIsOnlineState(true);
                  navigate("/");
                }, 300);
              } else {
                console.log(`[WS] ${data.type} for another job #${jobId} ignored.`);
              }
              break;
            }
            default:
              console.log("[WS] Unhandled message type:", data.type);
          }
        } catch (err) {
          console.error("[WS] message parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[WS] Error:", err);
        setConnectionStatus("error");
        connectionStatusRef.current = 'error';
      };

      ws.onclose = (e) => {
        console.warn("[WS] Closed:", e.code, e.reason);
        setSocket(null);
        socketRef.current = null;
        setConnectionStatus("disconnected");
        connectionStatusRef.current = 'disconnected';

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // try to reconnect (exponential-ish backoff up to max)
        if (intendedOnlineState.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1500 * reconnectAttempts.current, 30000);
          console.log(`[WS] Reconnect attempt #${reconnectAttempts.current} in ${delay}ms`);
          setTimeout(connectWebSocket, delay);
        } else {
          console.log("[WS] Will not reconnect further (max attempts or intended offline).");
        }
      };
    } catch (err) {
      console.error("[WS] Failed to connect:", err);
      setConnectionStatus("error");
      connectionStatusRef.current = 'error';
    }
  };

  // ensure socket connected helper (tries to connect if intended state is online)
  const ensureSocketConnected = async () => {
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;
      await connectWebSocket();
    } catch (err) {
      console.error("[WS] ensureSocketConnected error:", err);
    }
  };

  // ===== Auto offline/online handling for visibility and network =====
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (basicNeeds?.status === 'WORKING') return;
      if (document.visibilityState === 'hidden' && intendedOnlineState.current) {
        updateStatus('OFFLINE');
      } else if (document.visibilityState === 'visible' && intendedOnlineState.current) {
        // reconnect if needed
        handleSetIsOnline(true);
      }
    };

    const handlePageHide = () => {
      if (intendedOnlineState.current) updateStatus('OFFLINE');
    };

    const handlePageShow = (event) => {
      if (event.persisted) fetchInitialStatus();
    };

    const handleOnline = () => {
      console.log("[WS] Browser regained network connectivity.");
      ensureSocketConnected();
    };

    const handleOffline = () => {
      console.log("[WS] Browser went offline.");
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [basicNeeds?.status]);

  // ===== initialize on mount: fetch status, restore accepted job if present =====
  useEffect(() => {
    (async () => {
      const data = await fetchInitialStatus();

      // restore accepted job if persisted and server doesn't say ONLINE
      const storedJob = localStorage.getItem('acceptedJob');
      if (storedJob) {
        try {
          const parsed = JSON.parse(storedJob);
          if (parsed && data?.status !== 'ONLINE') {
            setJob(parsed);
            jobRef.current = parsed;
            setBasicNeeds(prev => ({ ...prev, status: "WORKING" }));
            intendedOnlineState.current = true;
            setIsOnlineState(true);
          } else {
            // if server thinks ONLINE, clear persisted accepted job to avoid dupes
            localStorage.removeItem('acceptedJob');
          }
        } catch (err) { /* ignore parse errors */ }
      }

      // connect if user is verified + intended online
      if (data?.is_verified && intendedOnlineState.current) {
        await connectWebSocket();
      }
    })();

    // unlock audio on first user click (safe audio policy)
    const unlockAudio = () => {
      try {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(() => { });
        jobNotificationSound.current.play().then(() => {
          jobNotificationSound.current.pause();
          jobNotificationSound.current.currentTime = 0;
        }).catch(() => { });
      } catch (_) { }
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });

    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        try { socketRef.current.close(1000, "Unmounting"); }
        catch (_) { }
      }
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      window.removeEventListener('click', unlockAudio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== auto-reject timer for incoming job (30s) =====
  useEffect(() => {
    if (!job || basicNeeds?.status === 'WORKING') return;
    clearTimeout(jobTimeoutRef.current);

    jobTimeoutRef.current = setTimeout(() => {
      console.warn('[Job Timer] Auto-rejecting job due to timeout.');
      const j = jobRef.current;
      if (j && socketRef.current?.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({
            type: 'job_status_update',
            job_id: j.id,
            status: 'REJECTED',
            reason: 'timeout',
          }));
        } catch (err) {
          // if socket can't send, queue it
          queueMessage({
            type: 'job_status_update',
            job_id: j.id,
            status: 'REJECTED',
            reason: 'timeout',
          });
        }
      }
      setJob(null);
      jobRef.current = null;
      localStorage.removeItem('acceptedJob');
    }, 30000);

    return () => clearTimeout(jobTimeoutRef.current);
  }, [job, basicNeeds?.status]);

  // ===== Play notification sounds repetitively for up to 30s while popup visible =====
  useEffect(() => {
    if (job && basicNeeds?.status !== "WORKING" && userInteracted.current) {
      const sound = audioRef.current;
      sound.volume = 0.5;

      let playCount = 0;
      const maxDuration = 30000;
      const playInterval = 4000;

      const playSound = () => {
        try {
          sound.currentTime = 0;
          sound.play().catch(err => console.warn("Notification sound failed:", err));
          playCount++;
        } catch (err) { }
      };

      playSound();
      const intervalId = setInterval(playSound, playInterval);
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
      }, maxDuration);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        try { sound.pause(); sound.currentTime = 0; } catch (e) { }
      };
    }
  }, [job, basicNeeds?.status]);

  // ===== Websocket-safe send with REST fallback and queuing =====
  const safeSend = async (payload, restFallback = null) => {
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
        console.log("[WS] Sent via WS:", payload);
      } else {
        console.warn("[WS] Socket not open — queueing and trying REST fallback if provided.");
        queueMessage(payload);
        if (restFallback) {
          try { await restFallback(); } catch (e) { console.warn("[WS] REST fallback failed:", e); }
        } else {
          toast.warning("Connection lost. Action queued.");
        }
        ensureSocketConnected();
      }
    } catch (err) {
      console.error("[WS] safeSend error:", err);
      if (restFallback) {
        try { await restFallback(); } catch (e) { console.error("[WS] REST fallback also failed:", e); }
      } else {
        queueMessage(payload);
      }
    }
  };

  // ===== job actions (accept/cancel/complete) =====
  const handleAcceptJob = async () => {
    if (!jobRef.current) return;
    clearTimeout(jobTimeoutRef.current);

    try {
      console.log(`[JOB] Accepting job #${jobRef.current.id}...`);
      const res = await api.post(`/jobs/AcceptServiceRequest/${jobRef.current.id}/`);
      const acceptedJob = res.data?.job || jobRef.current;

      intendedOnlineState.current = false;
      setIsOnlineState(false);

      // update status to WORKING on server
      await api.put("/jobs/UpdateMechanicStatus/", { status: "WORKING" });
      setBasicNeeds(prev => ({ ...prev, status: "WORKING" }));

      // persist accepted job
      localStorage.setItem("acceptedJob", JSON.stringify(acceptedJob));
      setJob(acceptedJob);
      jobRef.current = acceptedJob;

      // notify via WS if available, else queue
      const payload = { type: "job_status_update", job_id: acceptedJob.id, status: "ACCEPTED" };
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      } else {
        queueMessage(payload);
      }

      navigate(`/job/${acceptedJob.id}`);
    } catch (err) {
      console.error("[JOB] Accept failed:", err);
      // Re-enable auto-reject in case accept failed
      jobTimeoutRef.current = setTimeout(() => {
        const j = jobRef.current;
        if (!j) return;
        try {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: "job_status_update",
              job_id: j.id,
              status: "REJECTED",
              reason: "timeout_after_accept_failure",
            }));
          } else {
            queueMessage({
              type: "job_status_update",
              job_id: j.id,
              status: "REJECTED",
              reason: "timeout_after_accept_failure",
            });
          }
        } catch (e) { }
        setJob(null);
        jobRef.current = null;
        localStorage.removeItem("acceptedJob");
      }, 30000);
    }
  };

  const cancelJob = async (jobId, reason) => {
    try {
      await safeSend(
        { type: "job_status_update", job_id: jobId, status: "CANCELLED", reason },
        async () => await api.post(`/jobs/CancelServiceRequest/${jobId}/`, { cancellation_reason: reason })
      );

      lastClearedJobId.current = jobId?.toString();
      setJob(null);
      jobRef.current = null;
      localStorage.removeItem('acceptedJob');

      await updateStatus("ONLINE");
      setBasicNeeds(prev => ({ ...prev, status: "ONLINE" }));
      intendedOnlineState.current = true;
      setIsOnlineState(true);

      navigate('/');
      toast.success("Job cancelled.");
    } catch (err) {
      console.error("[JOB] Cancel failed:", err);
      toast.error("Failed to cancel job. Please try again.");
    }
  };

  const completeJob = async (jobId, price) => {
    console.groupCollapsed("%c[JOB] >>> COMPLETE_JOB TRIGGERED <<<", "color: #00eaff; font-weight: bold;");
    console.log("[JOB] Job ID:", jobId);
    console.log("[JOB] Price:", price);
    console.log("[JOB] jobRef.current:", jobRef.current);
    console.log("[JOB] basicNeeds?.status:", basicNeeds?.status);
    console.log("[WS] socketRef.current state:", socketRef.current?.readyState);
    console.groupEnd();

    try {
      const payload = {
        type: "job_status_update",
        job_id: jobId,
        status: "COMPLETED",
        price,
      };

      console.log("[WS] Attempting to send completion payload:", payload);

      // Try to send via WebSocket first, fallback to REST
      await safeSend(
        payload,
        async () => {
          console.log("[WS] REST fallback triggered for completion...");
          return await api.post(`/jobs/CompleteServiceRequest/${jobId}/`, { price });
        }
      );

      console.log("%c[JOB] ✅ Completion message sent (via WS or REST).", "color: limegreen; font-weight: bold;");


      // Update mechanic to ONLINE
      console.log("[STATUS] Updating mechanic to ONLINE after completion...");
      await updateStatus("ONLINE");

      setBasicNeeds(prev => ({ ...prev, status: "ONLINE" }));
      intendedOnlineState.current = true;
      setIsOnlineState(true);

      lastClearedJobId.current = jobId?.toString();
      setJob(null);
      jobRef.current = null;
      localStorage.removeItem('acceptedJob');

      navigate('/');
      toast.success("✅ Job completed successfully!");
      console.log("%c[JOB] Job completion workflow finished cleanly ✅", "color: limegreen; font-weight: bold;");
    } catch (err) {
      console.error("%c[JOB] ❌ Complete job failed:", "color: red; font-weight: bold;", err);

      if (err.response) {
        console.error("[JOB] Error response:", err.response.status, err.response.data);
      }

      toast.error("Failed to complete job. Please try again.");
    }
  };


  // explicit disconnect
  const disconnectWebSocket = () => {
    console.log("[WS] Disconnecting by request...");
    intendedOnlineState.current = false;
    if (socketRef.current) {
      try { socketRef.current.close(1000, "User initiated disconnect"); } catch (e) { }
      socketRef.current = null;
    }
    setSocket(null);
    setConnectionStatus('disconnected');
    connectionStatusRef.current = 'disconnected';
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  // toggle online/offline from UI
  const handleSetIsOnline = async (newIsOnline) => {
    console.log("[WS] handleSetIsOnline:", newIsOnline);
    intendedOnlineState.current = newIsOnline;
    setIsOnlineState(newIsOnline);

    try {
      await updateStatus(newIsOnline ? 'ONLINE' : 'OFFLINE');
      if (newIsOnline) {
        await connectWebSocket();
      } else {
        disconnectWebSocket();
      }
    } catch (err) {
      console.error("[WS] Failed to toggle online:", err);
      toast.error("Failed to update online status.");
    }
  };

  // axios interceptor to redirect to login on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (error.response.data?.detail === "Authentication credentials were not provided.") {
            navigate('/login');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [navigate]);

  // Clear acceptedJob when server says ONLINE (we don't need persisted accepted job)
  useEffect(() => {
    if (basicNeeds?.status === 'ONLINE') {
      localStorage.removeItem('acceptedJob');
      setJob(null);
      jobRef.current = null;
      console.log("[WS] server status ONLINE — cleared acceptedJob");
    }
  }, [basicNeeds?.status]);

  // UI: local reject handler (no server call — UI only)
  const handleRejectJob = () => {
    console.log("[JOB] Job rejected by user locally:", jobRef.current);
    setJob(null);
    jobRef.current = null;
    clearTimeout(jobTimeoutRef.current);
  };

  // Provider value
  const value = {
    socket,
    connectionStatus,
    isOnline,
    setIsOnline: handleSetIsOnline,
    isVerified,
    basicNeeds,
    connectWebSocket,
    disconnectWebSocket,
    job,
    sendJobStatus: safeSend,
    clearJob: () => {
      lastClearedJobId.current = jobRef.current?.id?.toString();
      setJob(null);
      jobRef.current = null;
      localStorage.removeItem('acceptedJob');
    },
    cancelJob,
    completeJob,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {isPublicRoute || isVerified ? children : <UnverifiedPage />}

      {isVerified && !isPublicRoute && (
        <>
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
        </>
      )}
    </WebSocketContext.Provider>
  );
};
