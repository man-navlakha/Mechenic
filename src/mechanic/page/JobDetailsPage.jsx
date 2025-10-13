import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "@/context/WebSocketContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from '@/utils/api';
import { MapPin, Phone, Car } from "lucide-react";
import Navbar from "../componets/Navbar";
import RightPanel from "../componets/RightPanel";

export default function JobDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { job: contextJob, sendJobStatus, clearJob, cancelJob } = useWebSocket();
    const [job, setJob] = useState(contextJob || null);
    const [loading, setLoading] = useState(false);

    // Keep local state in sync with context
    useEffect(() => {
        if (contextJob) setJob(contextJob);
    }, [contextJob]);

    // Restore job from localStorage if context empty
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

    const handleJobAction = async (status) => {
        if (status === 'CANCELLED') {
            const reason = prompt("Please provide a reason for cancellation:");
            if (reason === null || reason.trim() === "") {
                // User cancelled the prompt or entered an empty reason
                return;
            }
            setLoading(true);
            try {
                await cancelJob(job.id, reason);
                // The cancelJob function now handles navigation
            } catch (err) {
                console.error("Failed to cancel job:", err);
                alert("Something went wrong with the cancellation. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            const label = status === 'COMPLETED' ? 'mark this job as completed' : 'cancel this job';
            if (!confirm(`Are you sure you want to ${label}?`)) return;

            setLoading(true);

            try {
                // Send status via WebSocket (or fallback)
                await sendJobStatus(job.id, status);

                // Update mechanic status
                const newMechanicStatus = status === "COMPLETED" ? "ONLINE" : "ONLINE";
                await api.put("jobs/UpdateMechanicStatus/", { status: newMechanicStatus });

                // Clear job from context/localStorage
                clearJob();

                // Navigate back to dashboard
              window.location.href = '/';

            } catch (err) {
                console.error("Failed to update job:", err);
                alert("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="py-10 px-4">
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
                                    <strong>Vehicle Type:</strong> {job.vehicle_type || job.vehical_type}
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
                                    Latitude: {Number(job.latitude).toFixed(6)} | Longitude:{" "}
                                    {Number(job.longitude).toFixed(6)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="shadow-sm border border-gray-200">
                        <CardContent className="py-4 flex justify-between">
                            <Button
                                variant="destructive"
                                onClick={() => handleJobAction("CANCELLED")}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Cancel Job"}
                            </Button>
                            <Button
                                onClick={() => handleJobAction("COMPLETED")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Mark as Completed"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}