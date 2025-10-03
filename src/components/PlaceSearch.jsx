import React, { useState } from 'react';

const PlaceSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const searchPlaces = async (q) => {
    if (!q) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&viewbox=68.0,24.7,74.5,20.0&bounded=1&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Place search error:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(setTimeout(() => {
      searchPlaces(value);
    }, 500));
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setResults([]);

    onSelect({
      address: place.display_name,
      latitude: place.lat,
      longitude: place.lon,
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Search Your Shop Location (Gujarat only)
      </label>
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
  );
};

export default PlaceSearch;
