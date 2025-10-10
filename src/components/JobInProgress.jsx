import React, { useEffect, useRef, useState } from 'react';

const JobInProgress = ({ jobData, mechanicPosition }) => {
  const mapRef = useRef(null);
  const initStateRef = useRef({ initializing: false, initialized: false, retryCount: 0 });
  const [mapStatus, setMapStatus] = useState('idle');
  const [map, setMap] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  const userPosition = {
    lat: jobData?.latitude,
    lng: jobData?.longitude,
  };

  const loadMapplsSDK = () => {
    console.log("loadMapplsSDK called; existing mappls ?", !!window.mappls);
    if (document.getElementById("mappls-sdk") || window.mappls) {
      console.log("SDK script already present or loaded, scheduling init");
      setTimeout(initializeMap, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "mappls-sdk";
    script.src = `https://apis.mappls.com/advancedmaps/api/YOUR_MAPPLS_API_KEY/map_sdk?layer=vector&v=3.0`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Mappls SDK script loaded");
      initStateRef.current.sdkLoaded = true;
      setTimeout(initializeMap, 100);
    };
    script.onerror = () => {
      console.error("Failed to load Mappls SDK script");
      setMapStatus("error");
    };

    document.head.appendChild(script);
  };

  const onMapReady = (mapInstance) => {
    console.log("onMapReady called", mapInstance);
    initStateRef.current.initialized = true;
    initStateRef.current.initializing = false;
    setMap(mapInstance);
    setMapStatus("loaded");

    // Add mechanic marker
    try {
      new window.mappls.Marker({
        map: mapInstance,
        position: mechanicPosition,
        title: "Mechanic",
        icon_url: "https://maps.mappls.com/images/pin_2.png",
      });
    } catch (err) {
      console.error("Error placing mechanic marker:", err);
    }

    // Add user marker
    try {
      new window.mappls.Marker({
        map: mapInstance,
        position: userPosition,
        title: jobData?.user?.name || "User",
        icon_url: "https://maps.mappls.com/images/pin_1.png",
      });
    } catch (err) {
      console.error("Error placing user marker:", err);
    }

    drawRoute(mapInstance);
  };

  const drawRoute = (mapInstance) => {
    console.log("Calling direction with origin, dest:", mechanicPosition, userPosition);
    if (!window.mappls || !window.mappls.direction) {
      console.warn("mappls.direction API not present");
      return;
    }

    new window.mappls.direction({
      map: mapInstance,
      origin: `${mechanicPosition.lat},${mechanicPosition.lng}`,
      destination: `${userPosition.lat},${userPosition.lng}`,
      profile: "driving",
      steps: true,
      callback: (response) => {
        console.log("Direction callback response:", response);
        if (response && response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          const duration = route.summary.duration; // in seconds
          const distance = route.summary.distance; // in meters
          const durationMin = Math.ceil(duration / 60);
          const distanceKm = (distance / 1000).toFixed(2);
          const priceEstimate = (parseFloat(distanceKm) * 2).toFixed(2);

          console.log("Parsed route info:", { durationMin, distanceKm, priceEstimate });
          setDistanceInfo({
            duration: durationMin,
            distance: distanceKm,
            price: priceEstimate,
          });
        } else {
          console.warn("No routes in response");
        }
      },
      error: (error) => {
        console.error("Direction error:", error);
      }
    });
  };

  const initializeMap = () => {
    console.log("initializeMap invoked; state:", initStateRef.current, "window.mappls:", !!window.mappls);
    if (initStateRef.current.initializing || initStateRef.current.initialized) {
      console.log("Already initializing or initialized, skipping");
      return;
    }
    const container = document.getElementById("map");
    if (!container) {
      console.warn("Map container not found!");
      // retry logic
      if (initStateRef.current.retryCount < 3) {
        initStateRef.current.retryCount++;
        console.log("Retrying initializeMap after delay, count:", initStateRef.current.retryCount);
        setTimeout(initializeMap, 500);
      }
      return;
    }

    if (!window.mappls || !window.mappls.Map) {
      console.warn("mappls.Map not found, loading SDK");
      loadMapplsSDK();
      return;
    }

    initStateRef.current.initializing = true;
    setMapStatus("loading");

    try {
      const mapInstance = new window.mappls.Map("map", {
        center: mechanicPosition,
        zoom: 13,
        zoomControl: true,
      });
      mapRef.current = mapInstance;

      mapInstance.on("load", () => {
        console.log("Map load event fired");
        onMapReady(mapInstance);
      });

      // Fallback in case "load" doesn’t fire
      setTimeout(() => {
        if (!initStateRef.current.initialized) {
          console.warn("Map load event didn't fire in time — calling onMapReady fallback");
          onMapReady(mapInstance);
        }
      }, 5000);
    } catch (error) {
      console.error("Error creating map instance:", error);
      setMapStatus("error");
      initStateRef.current.initializing = false;
    }
  };

  useEffect(() => {
    console.log("JobInProgress useEffect: jobData, mechanicPosition", jobData, mechanicPosition);
    if (!mechanicPosition || !jobData) {
      console.warn("Missing mechanicPosition or jobData, skipping map init");
      return;
    }
    initializeMap();

    return () => {
      // cleanup
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.error("Error removing mapRef:", err);
        }
        mapRef.current = null;
      }
      initStateRef.current = { initializing: false, initialized: false, retryCount: 0 };
      setMapStatus("idle");
      setMap(null);
      setDistanceInfo(null);
    };
  }, [mechanicPosition, jobData]);

  return (
    <div className="job-in-progress-container">
      <h3>Job In Progress Screen</h3>
      <div><strong>Map status:</strong> {mapStatus}</div>
      <div className="job-details bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-bold mb-2">Customer Details</h2>
        <p><strong>Name:</strong> {jobData?.user?.name}</p>
        <p><strong>Phone:</strong> {jobData?.user?.phone}</p>
        <p><strong>Address:</strong> {jobData?.user?.address}</p>
        <p><strong>Vehicle Type:</strong> {jobData?.vehicle_type}</p>
        <p><strong>Problem:</strong> {jobData?.problem_description}</p>
        {distanceInfo ? (
          <div className="mt-3">
            <p><strong>Distance:</strong> {distanceInfo.distance} km</p>
            <p><strong>ETA:</strong> {distanceInfo.duration} mins</p>
            <p><strong>Estimated Price:</strong> ₹{distanceInfo.price}</p>
          </div>
        ) : (
          <div><em>Loading route info...</em></div>
        )}
      </div>
      <div id="map" style={{ height: '400px', width: '100%', borderRadius: '12px', background: '#eee' }} />
    </div>
  );
};

export default JobInProgress;
