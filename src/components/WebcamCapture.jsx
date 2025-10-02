import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    // Convert base64 to File
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'profile_pic.jpg', { type: 'image/jpeg' });
        onCapture(file);
      });
  };

  return (
    <div className="space-y-2">
      {!capturedImage ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user' }}
            className="rounded-md border"
          />
          <Button onClick={capture}>Capture</Button>
        </>
      ) : (
        <>
          <img src={capturedImage} alt="Captured" className="w-24 h-24 object-cover rounded-md border" />
          <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake</Button>
        </>
      )}
    </div>
  );
};

export default WebcamCapture;
