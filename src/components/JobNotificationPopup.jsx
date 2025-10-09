import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Wrench, Car, Clock, X, ChevronsRight, Check ,Bike, Truck } from 'lucide-react';


const getVehicleIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'car':
      return <Car className="w-5 h-5 text-blue-600" />;
    case 'bike':
      return <Bike className="w-5 h-5 text-blue-600" />;
    case 'truck':
      return <Truck className="w-5 h-5 text-blue-600" />;
    default:
      return <Car className="w-5 h-5 text-blue-600" />; // fallback icon
  }
};
// --- Helper Component for the Swipe Button ---
const SwipeToAcceptButton = ({ onAccept }) => {
  const [sliderLeft, setSliderLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const startXRef = useRef(0);

  // --- FIX 1: Wrap event handlers in useCallback to prevent stale state ---
  const handleDragStart = useCallback((e) => {
    if (isSuccess) return;
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
    if (sliderRef.current) {
        startXRef.current = clientX - sliderRef.current.getBoundingClientRect().left;
    }
    document.body.classList.add('no-select');
  }, [isSuccess]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || isSuccess) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
    if (containerRef.current && sliderRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const sliderWidth = sliderRef.current.offsetWidth;
        let newLeft = clientX - containerRect.left - startXRef.current;
        const maxLeft = containerRect.width - sliderWidth;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        setSliderLeft(newLeft);
    }
  }, [isDragging, isSuccess]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.classList.remove('no-select');

    if (containerRef.current && sliderRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const sliderWidth = sliderRef.current.offsetWidth;
        const threshold = (containerWidth - sliderWidth) * 0.85;

        if (sliderLeft >= threshold) {
            setSliderLeft(containerWidth - sliderWidth);
            setIsSuccess(true);
            setTimeout(() => onAccept(), 300);
        } else {
            setSliderLeft(0);
        }
    }
  }, [isDragging, sliderLeft, onAccept]);

  useEffect(() => {
    const moveHandler = (e) => handleDragMove(e);
    const endHandler = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('touchmove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchend', endHandler);
    }

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchend', endHandler);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-[54px] bg-gray-200/70 rounded-xl flex items-center justify-center overflow-hidden border border-gray-300 select-none"
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-xl"
          style={{ width: `${sliderLeft + (sliderRef.current?.offsetWidth || 60)}px` }}
        />
        <div
          ref={sliderRef}
          className={`absolute top-1/2 -translate-y-1/2 h-[46px] w-[60px] flex items-center justify-center rounded-lg shadow-md cursor-grab active:cursor-grabbing bg-white`}
          style={{ left: `${sliderLeft}px`, transition: isDragging ? 'none' : 'left 0.2s ease-out' }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {isSuccess ? <Check className="w-6 h-6 text-green-600" /> : <ChevronsRight className="w-6 h-6 text-gray-500 animate-pulse" />}
        </div>
        <span className={`font-semibold transition-opacity duration-300 ${isSuccess ? 'text-white' : 'text-gray-600'} ${sliderLeft > 20 && !isSuccess ? 'opacity-0' : 'opacity-100'}`}>
          {isSuccess ? 'Accepted!' : 'Swipe to Accept'}
        </span>
      </div>
      <style>{`.no-select {-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}`}</style>
    </>
  );
};

// --- Main Job Notification Component ---
const JobNotificationPopup = ({ job, onAccept, onReject }) => {
  if (!job) {
    return null;
  }

  return (
    <>
      <div className='fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm'>
        {/* --- FIX 2: Corrected z-index to be above the backdrop --- */}
        <div className='fixed top-10 right-2 z-[2001]'>
          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-gray-600"
          >
            <X className="w-5 h-5" />
            Reject
          </button>
        </div>

        <div className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50/80 rounded-t-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">New Service Request</h2>
                  <p className="text-blue-100 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Just now
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute right-6 top-4" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Vehicle Type */}
           <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
  <div className="p-2 bg-blue-100 rounded-lg">
    {getVehicleIcon(job.vehicle_type)}
  </div>
  <div className="flex-1">
    <p className="text-sm font-medium text-gray-600">Vehicle Type</p>
    <p className="text-lg font-semibold text-gray-900">
      {job.vehicle_type || 'Not specified'}
    </p>
  </div>
</div>

            {/* Problem Description */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="p-2 bg-amber-100 rounded-lg mt-1">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Problem Description</p>
                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                  {job.problem || job.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Service Location</p>
                <p className="text-base font-semibold text-gray-900">
                  {job.location || job.address || 'Location not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 pt-2">
            <SwipeToAcceptButton onAccept={onAccept} />
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 bg-gradient-to-br from-white to-gray-50/80 py-2 rounded-lg backdrop-blur-sm">
                Auto-reject in <span className="font-semibold text-amber-600">29 seconds</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobNotificationPopup;