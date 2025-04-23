import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  AddLocationAlt as AddLocationIcon,
  Visibility as VisibilityIcon,
  PlaylistAddCheck as CheckIcon,
  DeleteSweep as DeleteIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import WasteMap from '../components/Map/WasteMap';
import { reportService } from '../services/ReportService';
import { useAuth } from '../context/AuthContext';

// Waste type options for filter
const wasteTypes = [
  { value: '', label: 'All Types' },
  { value: 'organic', label: 'Organic Waste' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'paper', label: 'Paper/Cardboard' },
  { value: 'glass', label: 'Glass' },
  { value: 'metal', label: 'Metal' },
  { value: 'electronic', label: 'E-waste' },
  { value: 'medical', label: 'Medical Waste' },
  { value: 'construction', label: 'Construction Debris' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'other', label: 'Other' }
];

// Status options for filter
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' }
];

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState({
    wasteType: '',
    status: ''
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });

  // Handle filter changes
  const handleFilterChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all reports (limited to first page)
        const { reports } = await reportService.getReports();
        
        // Get pending and resolved reports
        const pendingReports = await reportService.getReportsByStatus('pending');
        const resolvedReports = await reportService.getReportsByStatus('resolved');
        
        setStats({
          totalReports: reports.length,
          pendingReports: pendingReports.length,
          resolvedReports: resolvedReports.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to TrashMap
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Connecting citizens and municipal authorities for efficient waste management
        </Typography>
        
        {!currentUser && (
          <Button
            variant="contained"
            component={Link}
            to="/register"
            size="large"
            sx={{ mt: 2 }}
          >
            Join TrashMap Today
          </Button>
        )}
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <VisibilityIcon color="primary" sx={{ mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.totalReports}
              </Typography>
              <Typography color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <AddLocationIcon color="warning" sx={{ mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.pendingReports}
              </Typography>
              <Typography color="text.secondary">
                Pending Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <CheckIcon color="info" sx={{ mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.resolvedReports}
              </Typography>
              <Typography color="text.secondary">
                Resolved Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#4caf50', color: 'white' }}>
            <CardContent>
              <DeleteIcon sx={{ mb: 1, color: 'white' }} />
              <Typography variant="h5" component="div">
                {Math.round((stats.resolvedReports / (stats.totalReports || 1)) * 100)}%
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Resolution Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Map Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Waste Map
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Explore waste reports across the city. Use the filters below to narrow down the results.
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="waste-type-filter-label">Waste Type</InputLabel>
              <Select
                labelId="waste-type-filter-label"
                id="wasteType"
                name="wasteType"
                value={filter.wasteType}
                label="Waste Type"
                onChange={handleFilterChange}
              >
                {wasteTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status"
                name="status"
                value={filter.status}
                label="Status"
                onChange={handleFilterChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Waste Map */}
        <WasteMap 
          filter={{
            wasteType: filter.wasteType || undefined,
            status: filter.status as any || undefined
          }}
          height={500}
        />
      </Paper>
      
      {/* Call to Action */}
      <Paper sx={{ p: 4, textAlign: 'center', mb: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h5" gutterBottom>
          See waste that needs attention?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          Help keep our community clean by reporting waste locations you encounter.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to={currentUser ? "/report" : "/login"}
          size="large"
          startIcon={<AddLocationIcon />}
        >
          {currentUser ? "Report Waste Location" : "Login to Report Waste"}
        </Button>
      </Paper>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* About Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          About TrashMap
        </Typography>
        <Typography variant="body1" paragraph>
          TrashMap is a web-based platform that bridges the gap between citizens and municipal authorities. 
          It enables users to report waste locations in real-time, while empowering authorities to manage, 
          track, and optimize waste collection using an interactive dashboard, map-based tracking, and AI-supported insights.
        </Typography>
        <Typography variant="body1">
          Join us in making our community cleaner and healthier for everyone.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 