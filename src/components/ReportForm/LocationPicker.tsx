import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  selectedPosition: { lat: number; lng: number };
  onSelectLocation: (position: { lat: number; lng: number }, address: string) => void;
}

// Default center position (can be set to a major city or country center)
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City

const LocationPicker: React.FC<LocationPickerProps> = ({ selectedPosition, onSelectLocation }) => {
  const [position, setPosition] = useState(selectedPosition.lat !== 0 ? selectedPosition : defaultCenter);
  const [address, setAddress] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    if (selectedPosition.lat !== 0 && selectedPosition.lng !== 0) {
      setPosition(selectedPosition);
      fetchAddress(selectedPosition.lat, selectedPosition.lng);
    }
  }, [selectedPosition]);

  // Fetch address from coordinates using reverse geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const newAddress = data.results[0].formatted_address;
        setAddress(newAddress);
        return newAddress;
      }
      return '';
    } catch (error) {
      console.error('Error fetching address:', error);
      return '';
    }
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(newPos);
        
        const newAddress = await fetchAddress(newPos.lat, newPos.lng);
        onSelectLocation(newPos, newAddress);
      },
    });
    
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '300px', mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Click on the map to select waste location
      </Typography>
      
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '4px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {position.lat !== 0 && position.lng !== 0 && <Marker position={[position.lat, position.lng]} />}
      </MapContainer>
    </Box>
  );
};

export default LocationPicker; 