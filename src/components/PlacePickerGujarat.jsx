import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';

import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  });

  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        }
      }}
    />
  ) : null;
};

const PlacePickerGujarat = ({ value = {}, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [position, setPosition] = useState([
    parseFloat(value.latitude) || 22.3,
    parseFloat(value.longitude) || 70.8,
  ]);
  const [address, setAddress] = useState(value.address || '');

  const viewbox = '68.0,24.7,74.5,20.0'; // Gujarat bounding box

  // Sync with parent value
  useEffect(() => {
    const lat = parseFloat(value.latitude);
    const lon = parseFloat(value.longitude);
    const addr = value.address;

    if (!isNaN(lat) && !isNaN(lon)) {
      const isDifferent = !position || lat !== position[0] || lon !== position[1];
      if (isDifferent) {
        setPosition([lat, lon]);
      }
    }

    if (addr && addr !== address) {
      setAddress(addr);
      setQuery(addr);
    }
  }, [value]);

  const searchPlaces = async (q) => {
    if (!q) return setResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&viewbox=${viewbox}&bounded=1&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Place search error:', error);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => searchPlaces(val), 500));
  };

  const updatePosition = (lat, lon, displayName) => {
    setPosition([lat, lon]);
    setAddress(displayName);
    setQuery(displayName);
    if (onChange) {
      onChange({
        address: displayName,
        latitude: lat,
        longitude: lon,
      });
    }
  };

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    updatePosition(lat, lon, place.display_name);
    setResults([]);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      if (data.display_name) {
        updatePosition(lat, lon, data.display_name);
      } else {
        setLocationError('Could not fetch address for this location.');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationError('Error fetching address.');
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsDetectingLocation(false);
        reverseGeocode(coords.latitude, coords.longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsDetectingLocation(false);
        setLocationError('Unable to retrieve your location.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Shop Location (Gujarat only)</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="e.g., Gandhi Market, Surat"
          value={query}
          onChange={handleInputChange}
        />
        {results.length > 0 && (
          <ul className="border rounded shadow max-h-48 overflow-y-auto bg-white z-10 relative">
            {results.map((place) => (
              <li
                key={place.place_id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(place)}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="h-64 w-full rounded overflow-hidden">
        <MapContainer center={position} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {/* Coordinates Display */}
      <div className="text-sm text-muted-foreground">
        <strong>Selected:</strong> {address || 'None'}<br />
        <strong>Lat:</strong> {position[0].toFixed(6)} &nbsp;&nbsp;
        <strong>Lng:</strong> {position[1].toFixed(6)}
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="text-red-500 text-sm mt-2">{locationError}</div>
      )}

      {/* Detect Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={detectLocation}
        disabled={isDetectingLocation}
        className="w-full"
      >
        {isDetectingLocation ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Detecting Location...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Auto-detect My Location
          </>
        )}
      </Button>
    </div>
  );
};

export default PlacePickerGujarat;
