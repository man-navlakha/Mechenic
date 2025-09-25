import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Loader2, Search, Navigation, Crosshair } from 'lucide-react';
import L from 'leaflet';

// Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    html: `<div class="relative">
      <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
      <div class="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-75"></div>
    </div>`,
    className: 'bg-transparent border-0',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(lat, lng);
      map.flyTo([lat, lng], map.getZoom());
    },
    locationfound(e) {
      const { lat, lng } = e.latlng;
      setPosition(lat, lng);
      map.flyTo([lat, lng], map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position]); // <- This line is key

  return position ? (
    <Marker
      position={position}
      icon={createCustomIcon()}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition(lat, lng);
        },
      }}
    />
  ) : null;
};


const PlacePickerGujarat = ({ value = {}, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Initialize position with proper fallback and validation
  const getInitialPosition = () => {
    const lat = parseFloat(value.latitude);
    const lon = parseFloat(value.longitude);
    
    if (!isNaN(lat) && !isNaN(lon) && lat >= 20 && lat <= 25 && lon >= 68 && lon <= 75) {
      return [lat, lon];
    }
    return [23.0225, 72.5714]; // Default to Ahmedabad
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [address, setAddress] = useState(value.address || '');

  const viewbox = '68.0,24.7,74.5,20.0'; // Gujarat bounding box

  // Sync with parent value
  useEffect(() => {
    const lat = parseFloat(value.latitude);
    const lon = parseFloat(value.longitude);
    const addr = value.address;

    if (!isNaN(lat) && !isNaN(lon) && lat >= 20 && lat <= 25 && lon >= 68 && lon <= 75) {
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
    if (!q) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&viewbox=${viewbox}&bounded=1&limit=8`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Place search error:', error);
      setLocationError('Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => searchPlaces(val), 800));
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Error fetching address';
    }
  };

  const updatePosition = async (lat, lon, displayName = null) => {
    // Validate coordinates
    if (isNaN(lat) || isNaN(lon) || lat < 20 || lat > 25 || lon < 68 || lon > 75) {
      setLocationError('Invalid coordinates for Gujarat region');
      return;
    }

    const newPosition = [lat, lon];
    setPosition(newPosition);
    
    let finalAddress = displayName;
    if (!finalAddress) {
      finalAddress = await reverseGeocode(lat, lon);
    }
    
    setAddress(finalAddress);
    setQuery(finalAddress);
    
    if (onChange) {
      onChange({
        address: finalAddress,
        latitude: lat,
        longitude: lon,
      });
    }
    
    setResults([]);
    setLocationError('');
  };

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    updatePosition(lat, lon, place.display_name);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        
        // Check if location is within Gujarat bounds
        if (latitude >= 20 && latitude <= 25 && longitude >= 68 && longitude <= 75) {
          await updatePosition(latitude, longitude);
        } else {
          setLocationError('Your location is outside Gujarat. Please select a location within Gujarat.');
        }
        setIsDetectingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsDetectingLocation(false);
        setLocationError('Unable to retrieve your location. Please ensure location permissions are granted.');
      },
      { 
        timeout: 15000,
        enableHighAccuracy: true 
      }
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  // Safe position access with fallback
  const safePosition = position || [23.0225, 72.5714];
  const safeAddress = address || 'No location selected';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Shop Location
        </CardTitle>
        <CardDescription>
          Search and select your shop location in Gujarat
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Section */}
        <div className="space-y-3">
          <Label htmlFor="location-search">Search Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              type="text"
              placeholder="e.g., Gandhi Market, Surat"
              value={query}
              onChange={handleInputChange}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1 h-7 w-7"
              >
                ×
              </Button>
            )}
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-0">
                <ScrollArea className="h-32">
                  <div className="space-y-1 p-2">
                    {results.map((place) => (
                      <div
                        key={place.place_id}
                        className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleSelect(place)}
                      >
                        <div className="font-medium text-sm">{place.display_name.split(',')[0]}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {place.display_name.split(',').slice(1).join(',')}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Map Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Interactive Map</Label>
            <Badge variant="outline" className="text-xs">
              Click on map to set location
            </Badge>
          </div>
          
          <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
            <MapContainer 
              center={safePosition} 
              zoom={12} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker position={safePosition} setPosition={updatePosition} />
            </MapContainer>
          </div>
        </div>

        <Separator />

        {/* Selected Location Info */}
        <div className="space-y-3">
          <Label>Selected Location</Label>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{safeAddress}</p>
                    {safeAddress !== 'No location selected' && (
                      <p className="text-xs text-muted-foreground">
                        Lat: {safePosition[0].toFixed(6)}, Lng: {safePosition[1].toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Error */}
        {locationError && (
          <Alert variant="destructive">
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="flex-1"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Detecting...
              </>
            ) : (
              <>
                <Crosshair className="h-4 w-4 mr-2" />
                Current Location
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => updatePosition(23.0225, 72.5714, 'Ahmedabad, Gujarat')}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Ahmedabad
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 Click on the map or search to set your shop location
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlacePickerGujarat;