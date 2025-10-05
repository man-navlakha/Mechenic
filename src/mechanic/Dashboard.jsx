import { useEffect, useRef, useState } from "react";
import Navbar from "../mechanic/componets/Navbar";
import RightPanel from "./componets/RightPanel";
import api from "@/utils/api";

export default function Dashboard() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [map, setMap] = useState(null);
  const [mechanicPosition, setMechanicPosition] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [basicNeeds, setBasicNeeds] = useState(null);
  const [mapStatus, setMapStatus] = useState("loading");
  const [locationStatus, setLocationStatus] = useState("getting");
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Track initialization state
  const initStateRef = useRef({
    sdkLoaded: false,
    initializing: false,
    initialized: false,
    retryCount: 0
  });

  // Fetch basic_needs
  useEffect(() => {
    const fetchBasicNeeds = async () => {
      try {
        const res = await api.get("/jobs/GetBasicNeeds/");
        const data = res.data.basic_needs || {};
        setBasicNeeds(data);
        setIsOnline(data.status === "ONLINE" && data.is_verified);
        setIsVerified(!!data.is_verified);
      } catch (error) {
        console.warn("Failed to fetch basic needs:", error);
      }
    };
    fetchBasicNeeds();
  }, []);

  // Check location permissions and capabilities
  useEffect(() => {
    const checkLocationSupport = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser");
        setLocationStatus("unsupported");
        setShowLocationPrompt(true);
        setMechanicPosition({ lat: 23.0225, lng: 72.5714 });
        return false;
      }
      return true;
    };

    if (checkLocationSupport()) {
      // Try to get location immediately
      getLocation();
    }
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setShowLocationPrompt(true);
      return;
    }

    setLocationStatus("getting");
    setShowLocationPrompt(false);

    const successCallback = (position) => {
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log("Location updated:", newPosition, new Date().toLocaleTimeString());
      setMechanicPosition(newPosition);
      setLocationStatus("success");
      setLastLocationUpdate(new Date());
      setShowLocationPrompt(false);
      
      // Update mechanic marker if map is already initialized
      updateMechanicMarker(newPosition);
    };

    const errorCallback = (error) => {
      console.error("Geolocation error:", error.message);
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationStatus("permission_denied");
          setShowLocationPrompt(true);
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationStatus("unavailable");
          setShowLocationPrompt(true);
          break;
        case error.TIMEOUT:
          setLocationStatus("timeout");
          setShowLocationPrompt(true);
          break;
        default:
          setLocationStatus("error");
          setShowLocationPrompt(true);
          break;
      }
      
      // Fallback to default position only if we don't have any position
      if (!mechanicPosition) {
        setMechanicPosition({ lat: 23.0225, lng: 72.5714 });
      }
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for mobile devices
      maximumAge: 300000 // 5 minutes - accept cached location if recent
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  // Set up periodic location updates once we have initial permission
  useEffect(() => {
    if (locationStatus !== "success") return;

    const intervalTime = Math.random() * 60000 + 180000; // 3-4 minutes in milliseconds
    const intervalId = setInterval(getLocation, intervalTime);

    console.log(`Location update interval set to ${Math.round(intervalTime / 1000)} seconds`);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [locationStatus]);

  // Update mechanic marker when position changes
  const updateMechanicMarker = (newPosition) => {
    if (!mapRef.current) return;

    // Remove existing mechanic marker
    const mechanicMarker = markersRef.current.find(m => m._isMechanicMarker);
    if (mechanicMarker) {
      try {
        mechanicMarker.remove();
        markersRef.current = markersRef.current.filter(m => !m._isMechanicMarker);
      } catch (error) {
        console.warn("Error removing old mechanic marker:", error);
      }
    }

    // Add new mechanic marker
    try {
      const newMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: newPosition,
        html: `<div style="font-size:2rem;">📍</div>`,
        popupHtml: `
          <div style="font-family: sans-serif;">
            <b>Your Location</b>
            <br/>
            <small>Last updated: ${lastLocationUpdate ? lastLocationUpdate.toLocaleTimeString() : 'Just now'}</small>
            <br/>
            <small>Lat: ${newPosition.lat.toFixed(6)}</small>
            <br/>
            <small>Lng: ${newPosition.lng.toFixed(6)}</small>
          </div>
        `,
      });
      newMarker._isMechanicMarker = true;
      markersRef.current.push(newMarker);

      // Center map on new position (only if it's a significant move)
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter) {
        const distance = getDistance(
          currentCenter.lat, currentCenter.lng,
          newPosition.lat, newPosition.lng
        );
        // Only re-center if moved more than 500 meters
        if (distance > 500) {
          mapRef.current.setCenter(newPosition);
        }
      } else {
        mapRef.current.setCenter(newPosition);
      }
    } catch (error) {
      console.warn("Error updating mechanic marker:", error);
    }
  };

  // Helper function to calculate distance between two coordinates in meters
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Manual location refresh function
  const refreshLocation = () => {
    getLocation();
  };

  // Function to handle location enable button click
  const handleEnableLocation = () => {
    console.log("User clicked enable location button");
    getLocation();
  };

  // Get user-friendly location error message
  const getLocationErrorMessage = () => {
    switch (locationStatus) {
      case "permission_denied":
        return "Location access was denied. Please enable location permissions in your browser settings.";
      case "unavailable":
        return "Location information is unavailable. Please check your device settings.";
      case "timeout":
        return "Location request timed out. Please try again.";
      case "unsupported":
        return "Your browser doesn't support location services.";
      case "error":
        return "Failed to get your location. Please try again.";
      default:
        return "Unable to access your location. Please enable location services.";
    }
  };

  // Get device-specific instructions
  const getDeviceInstructions = () => {
    const isiPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isiPhone) {
      return "On iPhone: Go to Settings > Privacy & Security > Location Services > Your Browser, and select 'While Using the App'";
    } else if (isAndroid) {
      return "On Android: Go to Settings > Location > App permissions > Your Browser, and enable location access";
    } else {
      return "Check your browser settings and allow location access for this website";
    }
  };

  // Main map initialization effect - depends on mechanicPosition
  useEffect(() => {
    let isMounted = true;

    // Don't initialize map until we have a position
    if (!mechanicPosition) {
      return;
    }

    const initializeMap = () => {
      if (!isMounted || initStateRef.current.initializing || initStateRef.current.initialized) {
        return;
      }

      const container = document.getElementById("map");
      if (!container) {
        console.warn("Map container not found, retrying...");
        if (initStateRef.current.retryCount < 3) {
          initStateRef.current.retryCount++;
          setTimeout(initializeMap, 500);
        }
        return;
      }

      if (!window.mappls || !window.mappls.Map) {
        console.warn("Mappls SDK not available, retrying...");
        if (initStateRef.current.retryCount < 3) {
          initStateRef.current.retryCount++;
          setTimeout(initializeMap, 500);
        } else {
          loadMapplsSDK();
        }
        return;
      }

      initStateRef.current.initializing = true;
      setMapStatus("loading");

      try {
        console.log("Creating Mappls map instance with position:", mechanicPosition);
        
        // Create map with current mechanic position
        const mapInstance = new window.mappls.Map("map", {
          center: mechanicPosition,
          zoom: 15,
          zoomControl: true,
        });

        mapRef.current = mapInstance;

        // Use both load event and timeout as fallback
        const loadTimeout = setTimeout(() => {
          if (isMounted && !initStateRef.current.initialized) {
            console.log("Map load timeout, proceeding anyway...");
            onMapReady(mapInstance);
          }
        }, 5000);

        mapInstance.on("load", () => {
          clearTimeout(loadTimeout);
          if (isMounted) {
            onMapReady(mapInstance);
          }
        });

        mapInstance.on("error", (error) => {
          clearTimeout(loadTimeout);
          console.error("Map error event:", error);
          if (isMounted) {
            setMapStatus("error");
            initStateRef.current.initializing = false;
          }
        });

      } catch (error) {
        console.error("Error creating map instance:", error);
        if (isMounted) {
          setMapStatus("error");
          initStateRef.current.initializing = false;
        }
      }
    };

    const onMapReady = (mapInstance) => {
      console.log("Map ready with position:", mechanicPosition);
      initStateRef.current.initialized = true;
      initStateRef.current.initializing = false;
      setMap(mapInstance);
      setMapStatus("loaded");
      
      addMechanicMarker(mapInstance);
    };

    const loadMapplsSDK = () => {
      if (document.getElementById("mappls-sdk") || window.mappls) {
        setTimeout(initializeMap, 100);
        return;
      }

      const script = document.createElement("script");
      script.id = "mappls-sdk";
      script.src = "https://apis.mappls.com/advancedmaps/api/a645f44a39090467aa143b8da31f6dbd/map_sdk?layer=vector&v=3.0";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Mappls SDK loaded successfully");
        initStateRef.current.sdkLoaded = true;
        if (isMounted) {
          setTimeout(initializeMap, 100);
        }
      };
      
      script.onerror = () => {
        console.error("Failed to load Mappls SDK");
        if (isMounted) {
          setMapStatus("error");
        }
      };
      
      document.head.appendChild(script);
    };

    // Start initialization
    initializeMap();

    // Cleanup
    return () => {
      isMounted = false;
      console.log("Dashboard unmounting, cleaning up map...");
      cleanupMap();
    };
  }, [mechanicPosition]);

  const addMechanicMarker = (mapInstance) => {
    if (!mechanicPosition) return;
    
    try {
      const marker = new window.mappls.Marker({
        map: mapInstance,
        position: mechanicPosition,
        html: `<div style="font-size:2rem;">📍</div>`,
        popupHtml: `
          <div style="font-family: sans-serif;">
            <b>Your Location</b>
            <br/>
            <small>Last updated: ${lastLocationUpdate ? lastLocationUpdate.toLocaleTimeString() : 'Just now'}</small>
            <br/>
            <small>Lat: ${mechanicPosition.lat.toFixed(6)}</small>
            <br/>
            <small>Lng: ${mechanicPosition.lng.toFixed(6)}</small>
          </div>
        `,
      });
      marker._isMechanicMarker = true;
      markersRef.current.push(marker);
    } catch (error) {
      console.warn("Error adding mechanic marker:", error);
    }
  };

  const cleanupMap = () => {
    console.log("Cleaning up map resources...");
    
    // Clear markers
    markersRef.current.forEach(marker => {
      try {
        if (marker && typeof marker.remove === "function") {
          marker.remove();
        }
      } catch (error) {
        console.warn("Error removing marker:", error);
      }
    });
    markersRef.current = [];

    // Remove map instance
    if (mapRef.current) {
      try {
        mapRef.current = null;
      } catch (error) {
        console.warn("Error during map cleanup:", error);
      }
    }

    initStateRef.current.initialized = false;
    initStateRef.current.initializing = false;
    setMap(null);
  };

  // Job markers effect
  useEffect(() => {
    if (mapStatus !== "loaded" || !map) return;

    const jobRequests = [
      { id: 1, position: { lat: 23.03, lng: 72.58 }, details: "Flat Tire Change", payout: "₹500" },
      { id: 2, position: { lat: 23.01, lng: 72.56 }, details: "Battery Jumpstart", payout: "₹700" },
      { id: 3, position: { lat: 23.04, lng: 72.57 }, details: "Engine Diagnostic", payout: "₹1200" },
    ];

    // Clear only job markers
    const jobMarkers = markersRef.current.filter(m => m._isJobMarker);
    jobMarkers.forEach(marker => {
      try {
        if (marker && marker.remove) marker.remove();
      } catch (error) {
        console.warn("Error removing job marker:", error);
      }
    });
    markersRef.current = markersRef.current.filter(m => !m._isJobMarker);

    // Add new job markers if online
    if (isOnline) {
      jobRequests.forEach(job => {
        try {
          const marker = new window.mappls.Marker({
            map: map,
            position: job.position,
            html: `<div style="font-size:2rem;">⚒️</div>`,
            popupHtml: `
              <div style="font-family: sans-serif;">
                <h3 style="font-weight: bold; font-size: 14px;">${job.details}</h3>
                <p>Estimated Payout: <span style="color: green; font-weight: 600;">${job.payout}</span></p>
                <button style="margin-top:5px; padding:4px 8px; background:#3B82F6; color:white; border:none; border-radius:4px; cursor:pointer;">
                  Accept Job
                </button>
              </div>
            `,
          });
          marker._isJobMarker = true;
          markersRef.current.push(marker);
        } catch (error) {
          console.warn("Error creating job marker:", error);
        }
      });
    }
  }, [isOnline, map, mapStatus]);

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <Navbar
        mechanicName={basicNeeds ? `${basicNeeds.first_name} ${basicNeeds.last_name}` : "Loading..."}
        shopName={basicNeeds?.shop_name}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        isVerified={isVerified}
      />

      <div className="relative flex-grow">
        <div id="map" className="h-full w-full z-0" />
        
        {/* Map status indicator */}
        {mapStatus === "loading" && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {locationStatus === "getting" ? "Getting your location..." : "Loading map..."}
          </div>
        )}
        
        {mapStatus === "error" && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Failed to load map. Please refresh the page.
          </div>
        )}

        {/* Location Enable Prompt */}
        {showLocationPrompt && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg max-w-md z-10">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Location Access Required
                </h3>
                <p className="text-yellow-700 text-sm mb-3">
                  {getLocationErrorMessage()}
                </p>
                <p className="text-yellow-600 text-xs mb-4">
                  {getDeviceInstructions()}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEnableLocation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Enable Location
                  </button>
                  <button
                    onClick={() => setShowLocationPrompt(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Use Default Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location update info */}
        {lastLocationUpdate && locationStatus === "success" && (
          <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
            <div className="flex items-center space-x-2">
              <span>📍 Updated: {lastLocationUpdate.toLocaleTimeString()}</span>
              <button 
                onClick={refreshLocation}
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <RightPanel
          shopName={basicNeeds?.shop_name}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          isVerified={isVerified}
        />
      </div>
    </div>
  );
}