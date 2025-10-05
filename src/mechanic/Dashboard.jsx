import { useEffect, useRef, useState } from "react";
import Navbar from "../mechanic/componets/Navbar";
import RightPanel from "./componets/RightPanel";
import api from "@/utils/api";

export default function Dashboard() {
  const mapRef = useRef(null); // store map instance
  const mapInitializedRef = useRef(false); // track if map is initialized
  const [mechanicPosition, setMechanicPosition] = useState({
    lat: 23.0225,
    lng: 72.5714, // default Ahmedabad
  });
  const [map, setMap] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [basicNeeds, setBasicNeeds] = useState(null);

  // Fetch basic_needs (ignore error handling for now)
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

  // Get mechanic location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMechanicPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.warn("Geolocation error:", error.message)
      );
    }
  }, []);

  // Initialize Mappls map only once
  useEffect(() => {
    // 1️⃣ Map initialization function
    const initMap = () => {
      if (mapInitializedRef.current) return; // already initialized
      const container = document.getElementById("map");
      if (!container) return;

      try {
        const mapInstance = new window.mappls.Map("map", {
          center: mechanicPosition,
          zoom: 13,
        });

        mapRef.current = mapInstance;
        mapInitializedRef.current = true;
        setMap(mapInstance);

        // Add mechanic marker
        new window.mappls.Marker({
          map: mapInstance,
          position: mechanicPosition,
          html: `<div style="font-size:2rem;">📍</div>`,
          popupHtml: "<b>Your Location</b>",
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // 2️⃣ If SDK is already loaded
    if (window.mappls && !mapInitializedRef.current) {
      initMap();
      return;
    }

    // 3️⃣ Dynamically load SDK script
    if (!document.getElementById("mappls-sdk") && !mapInitializedRef.current) {
      const script = document.createElement("script");
      script.id = "mappls-sdk";
      script.src =
        "https://apis.mappls.com/advancedmaps/api/a645f44a39090467aa143b8da31f6dbd/map_sdk?layer=vector&v=3.0&callback=initMapCallback";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // 4️⃣ Assign global callback (required by SDK)
    window.initMapCallback = initMap;

    // 5️⃣ Cleanup - only cleanup on component unmount
    return () => {
      if (mapRef.current && mapInitializedRef.current) {
        try {
          // Only attempt to remove if map is fully initialized
          if (typeof mapRef.current.remove === "function") {
            mapRef.current.remove();
          }
        } catch (error) {
          console.warn("Error removing map:", error);
        } finally {
          mapRef.current = null;
          mapInitializedRef.current = false;
        }
      }
    };
  }, []); // Remove mechanicPosition dependency to prevent re-initialization

  // Job markers when ONLINE
  useEffect(() => {
    if (!map) return;

    const jobRequests = [
      { id: 1, position: { lat: 23.03, lng: 72.58 }, details: "Flat Tire Change", payout: "₹500" },
      { id: 2, position: { lat: 23.01, lng: 72.56 }, details: "Battery Jumpstart", payout: "₹700" },
      { id: 3, position: { lat: 23.04, lng: 72.57 }, details: "Engine Diagnostic", payout: "₹1200" },
    ];

    // Clear old markers
    markers.forEach((m) => {
      try {
        if (m && typeof m.remove === "function") {
          m.remove();
        }
      } catch (error) {
        console.warn("Error removing marker:", error);
      }
    });
    const newMarkers = [];

    if (isOnline) {
      jobRequests.forEach((job) => {
        try {
          const marker = new window.mappls.Marker({
            map,
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
          newMarkers.push(marker);
        } catch (error) {
          console.warn("Error creating marker:", error);
        }
      });
    }

    setMarkers(newMarkers);

    // Cleanup markers on unmount or when isOnline changes
    return () => {
      newMarkers.forEach((m) => {
        try {
          if (m && typeof m.remove === "function") {
            m.remove();
          }
        } catch (error) {
          console.warn("Error removing marker in cleanup:", error);
        }
      });
    };
  }, [isOnline, map]);

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