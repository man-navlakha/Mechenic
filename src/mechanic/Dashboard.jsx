import { useEffect, useState } from "react";
import Navbar from "../mechanic/componets/Navbar"
import RightPanel from "./componets/RightPanel";


const mechanicPosition = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad

const jobRequests = [
  { id: 1, position: { lat: 23.03, lng: 72.58 }, details: "Flat Tire Change", payout: "₹500" },
  { id: 2, position: { lat: 23.01, lng: 72.56 }, details: "Battery Jumpstart", payout: "₹700" },
  { id: 3, position: { lat: 23.04, lng: 72.57 }, details: "Engine Diagnostic", payout: "₹1200" },
];

export default function Dashboard() {
  const [map, setMap] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Load Mappls script dynamically
    const script = document.createElement("script");
    script.src =
      "https://apis.mappls.com/advancedmaps/api/a645f44a39090467aa143b8da31f6dbd/map_sdk?layer=vector&v=3.0&callback=initMap";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Global init function
    window.initMap = () => {
      const mapInstance = new window.mappls.Map("map", {
        center: mechanicPosition,
        zoom: 13,
      });

      setMap(mapInstance);

      // Add mechanic marker (custom emoji)
      new window.mappls.Marker({
        map: mapInstance,
        position: mechanicPosition,
        html: `<div style="font-size:2rem;">🧑‍🔧</div>`,
      }).bindPopup("Your current location.");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
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
      <Navbar mechanicName="John Doe" />

      <div className="relative flex-grow">
        <div id="map" className="h-full w-full z-0" />

        {/* Right Panel Overlay */}
        <RightPanel isOnline={isOnline} setIsOnline={setIsOnline} />
      </div>
    </div>
  );
}
