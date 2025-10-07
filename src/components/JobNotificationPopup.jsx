import React from 'react';
import { MapPin, Wrench, Car, Clock, X, CheckCircle2 } from 'lucide-react';

const JobNotificationPopup = ({ job, onAccept, onReject }) => {
  if (!job) {
    return null;
  }

  console.log("Rendering JobNotificationPopup with job:", job);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50/80 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
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
              <Car className="w-5 h-5 text-blue-600" />
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

          {/* Additional Info if available */}
          {(job.customer_name || job.estimated_time || job.customer_phone) && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {job.customer_name && (
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Customer</p>
                  <p className="text-sm font-semibold text-gray-900">{job.customer_name}</p>
                </div>
              )}
              {job.estimated_time && (
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Est. Time</p>
                  <p className="text-sm font-semibold text-gray-900">{job.estimated_time}</p>
                </div>
              )}
              {job.customer_phone && (
                <div className="col-span-2 text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Contact</p>
                  <p className="text-sm font-semibold text-gray-900">{job.customer_phone}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onReject}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-gray-600"
            >
              <X className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={onAccept}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-green-600"
            >
              <CheckCircle2 className="w-5 h-5" />
              Accept Job
            </button>
          </div>
          
          {/* Quick Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 bg-gray-100/80 py-2 rounded-lg backdrop-blur-sm">
              Auto-reject in <span className="font-semibold text-amber-600">29 seconds</span>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500/10 rounded-full translate-y-8 -translate-x-8" />
      </div>
    </div>
  );
};

export default JobNotificationPopup;