
import React, { useEffect, useState } from "react";
import api from "@/utils/api"; // <-- your axios instance file
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export default function MechanicVerification() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // ✅ Fetch mechanic details
  const fetchMechanicDetails = async () => {
    setErrorMsg(null);
    try {
      const res = await api.get("users/GetMechanicDetailForVerify");
      setMechanics(res.data); // API gives array
    } catch (error) {
      const msg = error.response?.data?.detail || "Something went wrong.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanicDetails();
  }, []);

  // ✅ Verify API
  const verifyMechanic = async (mechanic_id) => {
    setErrorMsg(null);
    try {
      await api.post("users/VerifyMechanic/", { mechanic_id });
      fetchMechanicDetails();
    } catch (error) {
      const msg = error.response?.data?.detail || "Failed to verify mechanic.";
      setErrorMsg(msg);
    }
  };

  // ✅ Reject API
  const rejectMechanic = async (mechanic_id) => {
    setErrorMsg(null);
    try {
      await api.post("users/RejectMechanic/", { mechanic_id });
      fetchMechanicDetails();
    } catch (error) {
      const msg = error.response?.data?.detail || "Failed to reject mechanic.";
      setErrorMsg(msg);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading mechanic details...</p>;

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      {errorMsg && (
        <Alert variant="destructive" className="max-w-lg w-full">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {mechanics.length === 0 ? (
        <p className="text-gray-500">No mechanics pending verification.</p>
      ) : (
        mechanics.map((mechanic) => (
          <Card key={mechanic.id} className="w-full max-w-lg shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Mechanic Verification</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4">
              {/* Profile */}
              <div className="flex justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={mechanic.user?.profile_pic} alt="Profile" />
                  <AvatarFallback>
                    {mechanic.user?.first_name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Details */}
              <div className="grid gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input value={mechanic.user?.first_name || ""} disabled />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={mechanic.user?.last_name || ""} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={mechanic.user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <Input value={mechanic.user?.mobile_number || ""} disabled />
                </div>
                <div>
                  <Label>Aadhar Card</Label>
                  <Input value={mechanic.adhar_card || "N/A"} disabled />
                </div>
              </div>

              {/* Shop Details */}
              <div className="grid gap-3">
                <div>
                  <Label>Shop Name</Label>
                  <Input value={mechanic.shop_name || ""} disabled />
                </div>
                <div>
                  <Label>Shop Address</Label>
                  <Input value={mechanic.shop_address || ""} disabled />
                </div>
                <div>
                  <Label>Shop Location</Label>
                  <Input
                    value={`${mechanic.shop_latitude ?? ""}, ${mechanic.shop_longitude ?? ""}`}
                    disabled
                  />
                </div>
              </div>

              {/* KYC Document */}
              {mechanic.KYC_document && (
                <div>
                  <Label>KYC Document</Label>
                  <a
                    href={mechanic.KYC_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Document
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between mt-4">
                <Button
                  variant="destructive"
                  onClick={() => rejectMechanic(mechanic.id)}
                >
                  Reject ❌
                </Button>
                <Button
                  variant="default"
                  onClick={() => verifyMechanic(mechanic.id)}
                >
                  Verify ✅
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
