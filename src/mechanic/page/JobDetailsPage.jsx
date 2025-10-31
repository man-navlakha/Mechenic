import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "@/context/WebSocketContext";

import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // <-- ADD THIS IMPORT
import { MapPin, Phone, Car, Navigation, Check, X, SquareX, Loader2 } from "lucide-react";
import Navbar from "../componets/Navbar";

// --- START: Reusable SwipeButton Component (Unchanged) ---
const SwipeButton = ({ onSwipeSuccess, text = "Swipe to Action", successText = "Success!", Icon, gradientColors = { from: "from-gray-500", to: "to-gray-600" }, iconColor = "text-gray-600", disabled = false, }) => {
    const [sliderLeft, setSliderLeft] = useState(0); const [isDragging, setIsDragging] = useState(false); const [isSuccess, setIsSuccess] = useState(false); const containerRef = useRef(null); const sliderRef = useRef(null); const startXRef = useRef(0);
    useEffect(() => { if (disabled) { setIsSuccess(false); setSliderLeft(0); } }, [disabled]);
    const handleDragStart = useCallback((e) => { if (isSuccess || disabled) return; setIsDragging(true); const clientX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX; if (sliderRef.current) { startXRef.current = clientX - sliderRef.current.getBoundingClientRect().left; } document.body.classList.add('no-select'); }, [isSuccess, disabled]);
    const handleDragMove = useCallback((e) => { if (!isDragging || isSuccess || disabled) return; const clientX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX; if (containerRef.current && sliderRef.current) { const containerRect = containerRef.current.getBoundingClientRect(); const sliderWidth = sliderRef.current.offsetWidth; let newLeft = clientX - containerRect.left - startXRef.current; const maxLeft = containerRect.width - sliderWidth; newLeft = Math.max(0, Math.min(newLeft, maxLeft)); setSliderLeft(newLeft); } }, [isDragging, isSuccess, disabled]);
    const handleDragEnd = useCallback(() => { if (!isDragging) return; setIsDragging(false); document.body.classList.remove('no-select'); if (containerRef.current && sliderRef.current) { const containerWidth = containerRef.current.offsetWidth; const sliderWidth = sliderRef.current.offsetWidth; const threshold = (containerWidth - sliderWidth) * 0.85; if (sliderLeft >= threshold) { setSliderLeft(containerWidth - sliderWidth); setIsSuccess(true); setTimeout(() => onSwipeSuccess(), 300); } else { setSliderLeft(0); } } }, [isDragging, sliderLeft, onSwipeSuccess]);
    useEffect(() => { const moveHandler = (e) => handleDragMove(e); const endHandler = () => handleDragEnd(); if (isDragging) { window.addEventListener('mousemove', moveHandler); window.addEventListener('touchmove', moveHandler); window.addEventListener('mouseup', endHandler); window.addEventListener('touchend', endHandler); } return () => { window.removeEventListener('mousemove', moveHandler); window.removeEventListener('touchmove', moveHandler); window.removeEventListener('mouseup', endHandler); window.removeEventListener('touchend', endHandler); }; }, [isDragging, handleDragMove, handleDragEnd]);
    return (<> <div ref={containerRef} className={`relative w-full h-[54px] rounded-xl flex items-center justify-center overflow-hidden border select-none mt-2 ${disabled ? 'bg-gray-300/80 border-gray-400 cursor-not-allowed opacity-70' : 'bg-gray-200/70 border-gray-300'}`}> <div className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} rounded-xl`} style={{ width: `${sliderLeft + (sliderRef.current?.offsetWidth || 60)}px` }} /> <div ref={sliderRef} className={`absolute top-1/2 -translate-y-1/2 h-[46px] w-[60px] flex items-center justify-center rounded-lg shadow-md bg-white ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`} style={{ left: `${sliderLeft}px`, transition: isDragging ? 'none' : 'left 0.2s ease-out' }} onMouseDown={handleDragStart} onTouchStart={handleDragStart}> {isSuccess ? <Check className={`w-6 h-6 ${iconColor}`} /> : <Icon className="w-6 h-6 text-gray-500 animate-pulse" />} </div> <span className={`font-semibold transition-opacity duration-300 ${isSuccess ? 'text-white' : 'text-gray-600'} ${sliderLeft > 20 && !isSuccess ? 'opacity-0' : 'opacity-100'}`}> {isSuccess ? successText : text} </span> </div> <style>{`.no-select {-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}`}</style> </>);
};

// --- START: Cancellation Modal Component (Unchanged) ---
const CancelJobModal = ({ isOpen, onClose, onSelectReason, loading }) => {
    if (!isOpen) return null; const reasons = [{ text: "Customer requested to cancel", icon: Phone }, { text: "Unable to reach customer", icon: X }, { text: "I'm not available at this time", icon: MapPin }, { text: "Other (Please specify)", icon: SquareX },];
    const handleSwipe = (reasonText) => { if (loading) return; if (reasonText.startsWith("Other")) { const customReason = prompt("Please provide a specific reason for cancellation:"); if (customReason && customReason.trim() !== "") onSelectReason(customReason); } else { onSelectReason(reasonText); } };
    return (<div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/60 backdrop-blur-sm"> <div className="relative z-[3001] w-full max-w-md bg-white rounded-t-2xl p-6 shadow-2xl"> <div className="flex justify-between items-center mb-4"> <h2 className="text-xl font-bold text-gray-800">Reason for Cancellation</h2> <button onClick={onClose} disabled={loading} className="p-1 rounded-full hover:bg-gray-200"><X className="w-6 h-6 text-gray-600" /></button> </div> <div className="space-y-2"> {reasons.map((reason) => <SwipeButton key={reason.text} onSwipeSuccess={() => handleSwipe(reason.text)} text={reason.text} successText="Submitting..." Icon={reason.icon} gradientColors={{ from: 'from-red-500', to: 'to-red-600' }} iconColor="text-red-600" disabled={loading} />)} </div> </div> </div>);
};

// --- START: Haversine distance calculation utility (Unchanged) ---
const getDistanceInKm = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };

// --- START: Main JobDetailsPage Component ---
export default function JobDetailsPage() {
    const { id } = useParams();
    const { job: contextJob, completeJob, cancelJob, socket } = useWebSocket();
    const [job, setJob] = useState(contextJob || null);
    const [loading, setLoading] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [distanceFromJob, setDistanceFromJob] = useState(null);
    const [mechanicCurrentLocation, setMechanicCurrentLocation] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const mechanicMarkerRef = useRef(null);
    const jobMarkerRef = useRef(null);

    // Load job from context or localStorage
    useEffect(() => {
        if (!job) {
            const stored = localStorage.getItem("acceptedJob");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.id.toString() === id) setJob(parsed);
            }
        } else if (contextJob) {
            setJob(contextJob);
        }
    }, [id, contextJob]);

    useEffect(() => {
        const lat = parseFloat(job?.latitude);
        const lng = parseFloat(job?.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const dist = getDistanceInKm(latitude, longitude, lat, lng);
                setDistanceFromJob(dist);
                setMechanicCurrentLocation({ lat: latitude, lng: longitude });

                // 4. ADD THIS BLOCK: Send the real-time location over the WebSocket
                if (socket && socket.readyState === WebSocket.OPEN && job?.id) {
                    socket.send(JSON.stringify({
                        type: "location_update",
                        latitude,
                        longitude,
                        request_id: job.id // This is the crucial part the user's app needs
                    }));
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Could not get your location. Please enable location services.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [job, socket]); // 5. Add 'socket' to the dependency array


    // --- FIX: Centralized function to safely update map markers ---
    const updateMapMarkers = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.maplibregl) return;

        const jobLat = parseFloat(job?.latitude);
        const jobLng = parseFloat(job?.longitude);
        if (isNaN(jobLat) || isNaN(jobLng)) return;

        // Update Job Marker (Red)
        if (jobMarkerRef.current) {
            jobMarkerRef.current.setLngLat([jobLng, jobLat]);
        } else {
            jobMarkerRef.current = new window.maplibregl.Marker({ color: 'red' })
                .setLngLat([jobLng, jobLat])
                .addTo(map);
        }

        // Update Mechanic Marker (Green)
        if (mechanicCurrentLocation) {
            if (mechanicMarkerRef.current) {
                mechanicMarkerRef.current.setLngLat([mechanicCurrentLocation.lng, mechanicCurrentLocation.lat]);
            } else {
                mechanicMarkerRef.current = new window.maplibregl.Marker({ color: 'green' })
                    .setLngLat([mechanicCurrentLocation.lng, mechanicCurrentLocation.lat])
                    .addTo(map);
            }

            // Fit bounds to show both markers
            const bounds = new window.maplibregl.LngLatBounds();
            bounds.extend([mechanicCurrentLocation.lng, mechanicCurrentLocation.lat]);
            bounds.extend([jobLng, jobLat]);
            map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 500 });
        }
    }, [job, mechanicCurrentLocation]);


    // --- FIX: Refactored map initialization to be more robust ---
    useEffect(() => {
        const lat = parseFloat(job?.latitude);
        const lng = parseFloat(job?.longitude);

        if (mapInstanceRef.current || isNaN(lat) || isNaN(lng)) {
            return;
        }

        const initializeMap = () => {
            if (!window.maplibregl || !mapContainerRef.current) return;

            const map = new window.maplibregl.Map({
                container: mapContainerRef.current,
                center: [lng, lat],
                zoom: 13,
                style: `https://api.maptiler.com/maps/streets/style.json?key=wf1HtIzvVsvPfvNrhwPz`,
            });

            mapInstanceRef.current = map;

            // IMPORTANT: Only add markers after the map has fully loaded
            map.on('load', () => {
                updateMapMarkers();
            });
        };

        if (!window.maplibregl) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.js';
            script.async = true;
            script.onload = initializeMap;
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.href = 'https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        } else {
            initializeMap();
        }

    }, [job, updateMapMarkers]);

    // Effect to update markers when mechanic's location changes
    useEffect(() => {
        // Only run if the map already exists
        if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
            updateMapMarkers();
        }
    }, [mechanicCurrentLocation, updateMapMarkers]);


    if (!job) {
        return <div className="flex items-center justify-center h-screen text-gray-400">Loading job details...</div>;
    }

    const handleCompleteJob = async () => {
        if (loading) return;
        const priceInput = prompt("Please enter the final price for the service (₹):");
        if (priceInput === null) return;
        const price = parseFloat(priceInput);
        if (isNaN(price) || price < 0) {
            alert("Please enter a valid, non-negative price.");
            return;
        }

        setLoading(true);
        console.log("[UI] Starting complete job flow for job:", job?.id, "price:", price);
        try {
            // Ask the provider to complete the job but suppress provider navigation
            await completeJob(job.id, price, { suppressNavigate: true });

            // Persist some completed job summary locally (optional)
            localStorage.setItem("job_comp", JSON.stringify({
                id: job.id,
                price,
                first_name: job.first_name,
                last_name: job.last_name,
                vehicle_type: job.vehical_type || job.vehicle_type,
                problem: job.problem,
            }));

            // Navigate to your dedicated completion page
            navigate('/job_completed/');
        } catch (err) {
            console.error("[UI] completeJob failed:", err);
            const msg = err?.response?.data?.detail || err?.message || "Unknown error while completing job.";
            alert("Could not complete job: " + msg);
        } finally {
            setLoading(false);
        }
    };


    const handleCancelJob = async (reason) => {
        if (loading) return;
        setLoading(true);
        try {
            await cancelJob(job.id, reason);
            setIsCancelModalOpen(false);
        } catch (err) {
            console.error("Failed to cancel job:", err);
            alert("Something went wrong with the cancellation.");
        } finally {
            setLoading(false);
        }
    };
    const handleNavigate = () => {
        const lat = parseFloat(job?.latitude);
        const lng = parseFloat(job?.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            // This URL will open Google Maps navigation directly to the coordinates
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            alert("Location data is not available for this job.");
        }
    };

    const isNearJob = distanceFromJob !== null && distanceFromJob <= 0.5;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="py-10 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader className="bg-white border-b flex items-center justify-between w-full">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2"><Car className="text-blue-500" />Job #{job.id}</CardTitle>
                            <button onClick={() => setIsCancelModalOpen(true)} className="p-2 rounded-full hover:bg-red-100 transition-colors"><SquareX className="text-red-500 w-7 h-7" /></button>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-md border border-gray-200 overflow-hidden">
                        <div ref={mapContainerRef} className="w-full h-64 md:h-80 bg-gray-200" />
                    </Card>

                    <Card className="shadow-md border border-gray-200">
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center gap-4">
                                <img src={job.user_profile_pic || "/default-user.png"} alt="User" className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover" />
                                <div>
                                    <div className="text-lg font-semibold text-gray-800">{job.first_name} {job.last_name}</div>
                                    <div className="flex items-center gap-2 text-gray-600"><Phone className="text-green-600 w-4 h-4" /><span>{job.mobile_number}</span></div>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-2 text-gray-700">
                                <div><strong>Vehicle Type:</strong> {job.vehicle_type || job.vehical_type}</div>
                                <div><strong>Problem:</strong> {job.problem}</div>
                                {job.additional_details && <div><strong>Additional Details:</strong> {job.additional_details}</div>}
                            </div>
                            <div className="border-t pt-4 space-y-4 text-gray-700">
                                <div className="flex items-start gap-2">
                                    <MapPin className="text-red-500 w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>{job.location}</span>
                                </div>
                                {distanceFromJob !== null && (
                                    <div className="text-center text-sm font-medium text-gray-700 bg-blue-50 border border-blue-100 rounded-lg py-2 -mt-2">
                                        {distanceFromJob < 1 ? `You are approx. ${(distanceFromJob * 1000).toFixed(0)} meters away.` : `You are approx. ${distanceFromJob.toFixed(2)} km away.`}
                                    </div>
                                )}
                                <SwipeButton onSwipeSuccess={handleNavigate} text="Swipe to Navigate" successText="Navigating..." Icon={Navigation} gradientColors={{ from: 'from-blue-500', to: 'to-blue-600' }} iconColor="text-blue-600" disabled={loading} />
                                <div className="text-sm text-gray-500 ml-7 -mt-2">Latitude: {Number(job.latitude).toFixed(6)} | Longitude: {Number(job.longitude).toFixed(6)}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-gray-200">
                        <CardContent className="p-4">

                            {/* 1. Show this if job status is COMPLETED */}
                            {job.status === 'COMPLETED' ? (
                                <div className="text-center p-4 bg-green-100 rounded-lg text-green-800 font-semibold border border-green-200 flex items-center justify-center gap-2">
                                    <Check className="w-6 h-6" />
                                    Job has been completed.
                                </div>
                            ) :

                                /* 2. Show this if distance is still being checked */
                                distanceFromJob === null ? (
                                    <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Checking your distance from the job...</span></div>
                                ) :

                                    /* 3. Show this if near AND job is NOT completed */
                                    isNearJob ? (
                                        <Button
                                            onClick={handleCompleteJob}
                                            disabled={loading}
                                            className="w-full h-14 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            {loading ? (
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            ) : (
                                                <Check className="mr-2 h-6 w-6" />
                                            )}
                                            Complete Job
                                        </Button>
                                    ) :

                                        /* 4. Show this if too far away AND job is NOT completed */
                                        (
                                            <div className="text-center p-4 bg-amber-100 rounded-lg text-amber-800 font-semibold border border-amber-200">
                                                You must be within 500m to complete the job.
                                                <div className="text-sm font-normal">Current Distance: {(distanceFromJob * 1000).toFixed(0)} meters away</div>
                                            </div>
                                        )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CancelJobModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onSelectReason={handleCancelJob} loading={loading} />
        </div>
    );
}