import React, { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export default function StatusSwitch() {
  const { isOnline, setIsOnline, isVerified, connectionStatus, basicNeeds } = useWebSocket();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (checked) => {
    if (!isVerified) {
      alert("You must be verified to go online.");
      return;
    }

    setLoading(true);
    try {
      setIsOnline(checked); // WebSocketContext handles API call
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update status.";
      alert(errorMessage);
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

  // Determine displayed status
  let statusLabel = "Offline";
  if (basicNeeds?.status === "WORKING") statusLabel = "Working";
  else if (isOnline) statusLabel = "Online";

  return (
    isVerified ?
      !loading ?
        <div className="flex items-center text-sm space-x-2">
          <Switch
            checked={isOnline && basicNeeds?.status !== "WORKING"} // disable toggle when working
            onCheckedChange={toggleStatus}
            disabled={!isVerified || loading || basicNeeds?.status === "WORKING"}
            className={!isVerified ? "opacity-50 cursor-not-allowed" : ""}
          />
          <div className="flex items-start space-x-2">
            <div className={`font-medium ${statusLabel === 'Online' ? 'text-green-600' : statusLabel === 'Working' ? 'text-blue-600' : 'text-gray-600'}`}>
              {statusLabel}
            </div>

            {isOnline && basicNeeds?.status !== "WORKING" && (
              <div className="flex items-center space-x-1">
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
          </div>
        </div>
        :
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
      :
      <span className="text-red-500 text-xs font-medium">(Verification required)</span>
  );
}
