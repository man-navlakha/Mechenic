import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import api from "@/utils/api";

export default function StatusSwitch({ initialStatus, setIsOnline, isVerified }) {
  const [isLocalOnline, setIsLocalOnline] = useState(initialStatus === "ONLINE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLocalOnline(initialStatus === "ONLINE");
  }, [initialStatus]);

  const toggleStatus = async (checked) => {
    if (!isVerified) {
      alert("You must be verified to go online.");
      return;
    }

    setIsLocalOnline(checked);
    setLoading(true);
    try {
      await api.put("/jobs/UpdateMechanicStatus/", { status: checked ? "ONLINE" : "OFFLINE" });
      setIsOnline?.(checked); // sync parent
    } catch (error) {
      setIsLocalOnline(!checked); // rollback
      console.error(error);
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
      />
      <Label className="text-sm">
        {isLocalOnline ? "Online" : "Offline"}
        {!isVerified && <span className="text-red-500 text-xs ml-1">Verification required</span>}
      </Label>
    </div>
  );
}
