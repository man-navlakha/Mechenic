import React from 'react';

const JobNotificationPopup = ({ job, onAccept, onReject }) => {
  if (!job) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>New Job Available!</h2>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Vehicle Type:</strong> {job.vehical_type}</p>
        <p><strong>Problem:</strong> {job.problem}</p>
        <div className="popup-actions">
          <button onClick={onAccept} className="accept-btn">Accept</button>
          <button onClick={onReject} className="reject-btn">Reject</button>
        </div>
      </div>
    </div>
  );
};

export default JobNotificationPopup;