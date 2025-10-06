import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import api from "@/utils/api";

export default function StatusSwitch({ initialStatus, setIsOnline, isVerified, isOnline }) {
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'error', 'disconnected'
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get WebSocket configuration
  const getWebSocketConfig = () => {
    // Use environment variables or fallback to localhost for development
    const backendHost = import.meta.env.VITE_BACKEND_HOST || 'https://mechanic-setu.onrender.com';
    
    return {
      backendHost: backendHost,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5
    };
  };

  const connectWebSocket = async () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error("[WS] Max reconnection attempts reached");
      setConnectionStatus('error');
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      const res = await api.get("core/ws-token/", {
        withCredentials: true,
      });

      const wsToken = res.data.ws_token;

      if (!wsToken) {
        console.error("[WS ERROR] Failed to get WS token");
        setConnectionStatus('error');
        return;
      }

      const config = getWebSocketConfig();
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${wsScheme}://${config.backendHost}/ws/job_notifications/${wsToken}`;

      console.log("[WS CONNECT]: ", wsUrl);

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("[WS] Connected to job notifications");
        setSocket(newSocket);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0; // Reset counter on successful connection
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WS] New job notification:", data);
          handleJobNotification(data);
        } catch (error) {
          console.error("[WS] Error parsing message:", error);
        }
      };

      newSocket.onclose = (event) => {
        console.log("[WS] Disconnected:", event.code, event.reason);
        setSocket(null);
        setConnectionStatus('disconnected');
        
        // Only attempt reconnect for unexpected closures and if still online
        if (isOnline && event.code !== 1000) {
          reconnectAttempts.current += 1;
          console.log(`[WS] Reconnect attempt ${reconnectAttempts.current} in 3 seconds...`);
          setTimeout(connectWebSocket, config.reconnectDelay);
        }
      };

      newSocket.onerror = (error) => {
        console.error("[WS] Error:", error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error("[WS] Failed to establish connection:", error);
      setConnectionStatus('error');
      
      // Retry connection after delay
      if (isOnline) {
        reconnectAttempts.current += 1;
        setTimeout(connectWebSocket, getWebSocketConfig().reconnectDelay);
      }
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close(1000, "User went offline");
      setSocket(null);
      setConnectionStatus('disconnected');
    }
    reconnectAttempts.current = 0;
  };

  const handleJobNotification = (data) => {
    // Handle different types of job notifications
    switch (data.type) {
      case "new_job":
        console.log("New job available:", data.job);
        showNewJobNotification(data.job);
        break;
      case "job_accepted":
        console.log("Job accepted by another mechanic:", data.job_id);
        break;
      case "job_completed":
        console.log("Job completed:", data.job_id);
        break;
      default:
        console.log("Unknown notification type:", data.type);
    }
  };

  const showNewJobNotification = (job) => {
    // You can use your preferred notification method
    if (Notification.permission === "granted") {
      new Notification("New Job Available", {
        body: `New job: ${job.service_type} - ${job.payout}`,
        icon: "/mechanic-icon.png"
      });
    }
    
    // Trigger custom event that other components can listen to
    window.dispatchEvent(new CustomEvent('newJobAvailable', { detail: job }));
  };

  // WebSocket connection management
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

  const toggleStatus = async (checked) => {
    // Prevent toggle if not verified
    if (!isVerified) {
      alert("You must be verified to go online.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/jobs/UpdateMechanicStatus/", { 
        status: checked ? "ONLINE" : "OFFLINE" 
      });
      
      // Update parent state - this will trigger WebSocket connection/disconnection
      setIsOnline(checked);
      
      console.log("Status updated successfully:", response.data);
      
    } catch (error) {
      // Don't update state on error - parent state remains unchanged
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to update status. Please try again.";
      alert(errorMessage);
      console.error("Status update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'error':
        return <WifiOff className="h-3 w-3 text-red-500" />;
      default:
        return <WifiOff className="h-3 w-3 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Disconnected';
    }
  };

  // Request notification permission when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isOnline}
        onCheckedChange={toggleStatus}
        disabled={!isVerified || loading}
        className={!isVerified ? "opacity-50 cursor-not-allowed" : ""}
      />
      
      <div className="flex items-center space-x-2">
        <Label className={`text-sm font-medium ${
          isOnline ? "text-green-600" : "text-gray-600"
        }`}>
          {isOnline ? "Online" : "Offline"}
        </Label>
        
        {isOnline && (
          <div className="flex items-center space-x-1 text-xs">
            {getConnectionStatusIcon()}
            <span className={`
              ${connectionStatus === 'connected' ? 'text-green-500' : ''}
              ${connectionStatus === 'connecting' ? 'text-yellow-500' : ''}
              ${connectionStatus === 'error' ? 'text-red-500' : ''}
              ${connectionStatus === 'disconnected' ? 'text-gray-500' : ''}
            `}>
              {getConnectionStatusText()}
            </span>
          </div>
        )}
        
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        )}
        
        {!isVerified && (
          <span className="text-red-500 text-xs font-medium">
            (Verification required)
          </span>
        )}
      </div>
    </div>
  );
}