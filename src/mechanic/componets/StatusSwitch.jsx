import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import api from "@/utils/api";

export default function StatusSwitch({ initialStatus, setIsOnline, isVerified }) {
  const [isLocalOnline, setIsLocalOnline] = useState(initialStatus === "ONLINE");
  const [loading, setLoading] = useState(false);

  // Sync with parent when initialStatus changes
  useEffect(() => {
    setIsLocalOnline(initialStatus === "ONLINE");
  }, [initialStatus]);

  const toggleStatus = async (checked) => {
    // Prevent toggle if not verified
    if (!isVerified) {
      alert("You must be verified to go online.");
      return;
    }

    // Optimistic update
    setIsLocalOnline(checked);
    setLoading(true);

    try {
      const response = await api.put("/jobs/UpdateMechanicStatus/", { 
        status: checked ? "ONLINE" : "OFFLINE" 
      });
      
      // Sync with parent state
      setIsOnline?.(checked);
      
      // Optional: Show success feedback
      console.log("Status updated successfully:", response.data);
    } catch (error) {
      // Rollback on error
      setIsLocalOnline(!checked);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to update status. Please try again.";
      alert(errorMessage);
      console.error("Status update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isLocalOnline}
        onCheckedChange={toggleStatus}
        disabled={!isVerified || loading}
        className={!isVerified ? "opacity-50 cursor-not-allowed" : ""}
      />
      
      <div className="flex items-center space-x-2">
        <Label className={`text-sm font-medium ${
          isLocalOnline ? "text-green-600" : "text-gray-600"
        }`}>
          {isLocalOnline ? "Online" : "Offline"}
        </Label>
        
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