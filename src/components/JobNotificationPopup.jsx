import React from 'react';

// You can add your own styling for this component

const JobNotificationPopup = ({ job, onAccept, onReject }) => {
  if (!job) {
    return null;
  }

  return (
    <div className="job-notification-popup-overlay">
      <div className="job-notification-popup-content">
        <h2>New Job Request</h2>
        <div className="job-details">
            <p><strong>Vehicle:</strong> {job.vehical_type || 'N/A'}</p>
            <p><strong>Problem:</strong> {job.problem || 'N/A'}</p>
            <p><strong>Location:</strong> {job.location || 'N/A'}</p>
        </div>
        <div className="job-notification-popup-buttons">
          <button className="accept-button" onClick={onAccept}>Accept</button>
          <button className="reject-button" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default JobNotificationPopup;