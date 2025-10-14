// src/components/EarningsSummary.jsx
import React, { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const EarningsSummary = () => {
    const navigate = useNavigate();
    const [jobData, setJobData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("job_comp");
        if (data) {
            try {
                setJobData(JSON.parse(data));
            } catch (error) {
                console.error("Failed to parse job data:", error);
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#2d1f4e] to-[#1a1030] py-3 px-0 text-white">

            {/* Top Content */}
            <Card className="w-full max-w-sm bg-transparent border-none shadow-none self-center mt-10">
                <CardHeader className="text-left space-y-4">
                    <div className="text-green-400 text-sm flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4" />
                        Order Completed
                    </div>

                    <div>
                        <div className="text-gray-400 text-lg font-medium">Total earnings</div>
                        <div className="text-6xl font-bold bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-slate-400 bg-clip-text text-white mt-2">
                            ₹{jobData?.price || "0"}
                        </div>
                    </div>

                    <div className="space-y-2 mt-6 text-md text-white">
                        <div><span className="text-gray-400">Job ID:</span> {jobData?.id}</div>
                        <div><span className="text-gray-400">Customer:</span> {jobData?.first_name} {jobData?.last_name}</div>
                        <div><span className="text-gray-400">Vehicle Type:</span> {jobData?.vehicle_type}</div>
                        <div><span className="text-gray-400">Problem:</span> {jobData?.problem}</div>
                    </div>
                </CardHeader>
            </Card>

            {/* Sticky Bottom Button */}
            <div className="w-full max-w-sm self-center mb-6 px-6">
                <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-md rounded-md"
                    onClick={() => {
                        localStorage.removeItem("job_comp");
                        localStorage.removeItem("acceptedJob");
                        window.location.href = "/";
                    }}
                >
                    Go to homepage
                </Button>
            </div>


        </div>
    );
};

export default EarningsSummary;
