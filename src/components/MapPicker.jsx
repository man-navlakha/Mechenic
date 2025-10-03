// components/MapPicker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
    dragend() {
      // optional: handle drag end
    }
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      }}
    />
  );
};

const MapPicker = ({ latitude, longitude, onChange }) => {
  const initialPosition = latitude && longitude
    ? [parseFloat(latitude), parseFloat(longitude)]
    : [20.5937, 78.9629]; // Default to center of India

  const [position, setPosition] = useState(initialPosition);

  // Update parent on marker move
  React.useEffect(() => {
    if (position) {
      onChange({
        lat: position[0],
        lng: position[1]
      });
    }
  }, [position]);

  return (
    <div className="h-64 w-full rounded overflow-hidden">
      <MapContainer center={position} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
