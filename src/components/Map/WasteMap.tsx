import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Paper, CircularProgress, Chip, Card, CardContent, CardMedia } from '@mui/material';
import { reportService, WasteReport } from '../../services/ReportService';
import 'leaflet/dist/leaflet.css';

// Fix for marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for different waste types
const getWasteIcon = (wasteType: string) => {
  let color = '#ff0000'; // Default red
  
  switch (wasteType) {
    case 'organic':
      color = '#4caf50'; // Green
      break;
    case 'plastic':
      color = '#2196f3'; // Blue
      break;
    case 'paper':
      color = '#ffc107'; // Yellow
      break;
    case 'glass':
      color = '#9c27b0'; // Purple
      break;
    case 'electronic':
      color = '#f44336'; // Red
      break;
    case 'medical':
      color = '#e91e63'; // Pink
      break;
    case 'hazardous':
      color = '#ff5722'; // Deep orange
      break;
    default:
      color = '#607d8b'; // Blue grey
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width:14px; height:14px; border-radius:50%; border:2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Status chip color mapper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'assigned':
      return 'info';
    case 'resolved':
      return 'success';
    default:
      return 'default';
  }
};

// Convert timestamp to readable date
const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

interface WasteMapProps {
  filter?: {
    wasteType?: string;
    status?: 'pending' | 'assigned' | 'resolved';
  };
  height?: number | string;
}

const WasteMap: React.FC<WasteMapProps> = ({ filter, height = 600 }) => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        let fetchedReports: WasteReport[] = [];
        
        if (filter?.status) {
          fetchedReports = await reportService.getReportsByStatus(filter.status);
        } else if (filter?.wasteType) {
          fetchedReports = await reportService.getReportsByWasteType(filter.wasteType);
        } else {
          const result = await reportService.getReports(100); // Get up to 100 reports for the map
          fetchedReports = result.reports;
        }
        
        setReports(fetchedReports);
        
        // Set map center to the first report's location if available
        if (fetchedReports.length > 0 && fetchedReports[0].location) {
          setMapCenter([fetchedReports[0].location.lat, fetchedReports[0].location.lng]);
        }
      } catch (err) {
        console.error('Error fetching reports for map:', err);
        setError('Failed to load waste reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [filter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (reports.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height }}>
        <Typography>No waste reports found for the selected filters.</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={getWasteIcon(report.wasteType)}
          >
            <Popup maxWidth={300} minWidth={200}>
              <Card sx={{ maxWidth: 300, boxShadow: 'none' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={report.imageUrl}
                  alt={`${report.wasteType} waste`}
                />
                <CardContent sx={{ py: 1, px: 1 }}>
                  <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                    {report.wasteType.charAt(0).toUpperCase() + report.wasteType.slice(1)} Waste
                  </Typography>
                  
                  <Chip 
                    label={report.status.toUpperCase()} 
                    color={getStatusColor(report.status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {report.address}
                  </Typography>
                  
                  {report.notes && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Notes:</strong> {report.notes}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" display="block">
                    Reported by: {report.userName}
                  </Typography>
                  
                  <Typography variant="caption" display="block">
                    Date: {formatDate(report.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default WasteMap; 