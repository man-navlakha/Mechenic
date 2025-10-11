import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "@/context/WebSocketContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Car, User } from "lucide-react";

export default function JobDetailsPage() {
  const { id } = useParams();
  const { job: contextJob } = useWebSocket();
  const [job, setJob] = useState(contextJob || null);

  // Try to restore job from localStorage if context empty
  useEffect(() => {
    if (!job) {
      const stored = localStorage.getItem("acceptedJob");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id.toString() === id) {
          setJob(parsed);
        }
      }
    }
  }, [id, job]);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading job details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Job Header */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Car className="text-blue-500" />
              Job #{job.id}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 mt-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <img
                src={job.user_profile_pic || "/default-user.png"}
                alt="User"
                className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover"
              />
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {job.first_name} {job.last_name}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="text-green-600 w-4 h-4" />
                  <span>{job.mobile_number}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="border-t pt-4 space-y-2 text-gray-700">
              <div>
                <strong>Vehicle Type:</strong> {job.vehical_type}
              </div>
              <div>
                <strong>Problem:</strong> {job.problem}
              </div>
              {job.additional_details && (
                <div>
                  <strong>Additional Details:</strong> {job.additional_details}
                </div>
              )}
            </div>

            {/* Location Info */}
            <div className="border-t pt-4 space-y-2 text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin className="text-red-500 w-5 h-5 mt-1" />
                <span>{job.location}</span>
              </div>
              <div className="text-sm text-gray-500 ml-6">
                Latitude: {job.latitude.toFixed(6)} | Longitude:{" "}
                {job.longitude.toFixed(6)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="py-4 flex justify-between">
            <Button variant="destructive">Cancel Job</Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mark as Completed
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
