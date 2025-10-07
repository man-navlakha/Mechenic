import React, { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext'; // 👈 Import the hook
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import api from "@/utils/api";

export default function StatusSwitch() {
  // 👇 Get state and functions from the context
  const { isOnline, setIsOnline, isVerified, connectionStatus } = useWebSocket();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (checked) => {
    if (!isVerified) {
      alert("You must be verified to go online.");
      return;
    }

    setLoading(true);
    try {
      // The context will now handle the API call
      setIsOnline(checked);
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
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        {!isVerified && <span className="text-red-500 text-xs font-medium">(Verification required)</span>}
      </div>
    </div>
  );
}