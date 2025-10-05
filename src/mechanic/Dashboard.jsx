import { useEffect, useRef, useState } from "react";
import Navbar from "../mechanic/componets/Navbar";
import RightPanel from "./componets/RightPanel";
import api from "@/utils/api";

export default function Dashboard() {
   const mapRef = useRef(null); // store map instance
  const [mechanicPosition, setMechanicPosition] = useState({
    lat: 23.0225,
    lng: 72.5714, // default Ahmedabad
  });
  const [map, setMap] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [basicNeeds, setBasicNeeds] = useState(null)
  
useEffect(() => {
  return () => {
    if (mapRef.current && typeof mapRef.current.destroy === "function") {
      mapRef.current.destroy();
      mapRef.current = null;
    }
  };
}, []);

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

  // Load Mappls SDK
 useEffect(() => {
    if (window.mappls && !mapRef.current) {
      window.initMap(); // SDK already loaded, init directly
      return;
    }

    // if already injected, skip
    if (document.getElementById("mappls-sdk")) return;

    const script = document.createElement("script");
    script.id = "mappls-sdk";
    script.src =
      "https://apis.mappls.com/advancedmaps/api/a645f44a39090467aa143b8da31f6dbd/map_sdk?layer=vector&v=3.0&callback=initMap";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // define callback before script loads
   window.initMap = () => {
  if (mapRef.current) return; // already initialized
  const container = document.getElementById("map");
  if (!container) return;

  const mapInstance = new window.mappls.Map("map", {
    center: mechanicPosition,
    zoom: 13,
  });

  mapRef.current = mapInstance;
  setMap(mapInstance); // <-- this is the missing piece

  // mechanic marker
  new window.mappls.Marker({
    map: mapInstance,
    position: mechanicPosition,
    html: `<div style="font-size:2rem;">🧑‍🔧</div>`,
    popupHtml: "<b>Your Location</b>",
  });
};


    return () => {
      // ✅ Cleanup map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mechanicPosition]);





  // Job markers when ONLINE
  useEffect(() => {
    if (!map) return;

    const jobRequests = [
      { id: 1, position: { lat: 23.03, lng: 72.58 }, details: "Flat Tire Change", payout: "₹500" },
      { id: 2, position: { lat: 23.01, lng: 72.56 }, details: "Battery Jumpstart", payout: "₹700" },
      { id: 3, position: { lat: 23.04, lng: 72.57 }, details: "Engine Diagnostic", payout: "₹1200" },
    ];

    // Clear old markers
    markers.forEach((m) => m.remove());
    const newMarkers = [];

    if (isOnline) {
      jobRequests.forEach((job) => {
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
      });
    }

    setMarkers(newMarkers);
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
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          isVerified={isVerified}
        />
      </div>
    </div>
  );
}
