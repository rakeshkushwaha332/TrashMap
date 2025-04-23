import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  GetApp as DownloadIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { reportService, WasteReport } from '../../services/ReportService';
import WasteMap from '../../components/Map/WasteMap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

// Priority options
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState({
    wasteType: '',
    status: ''
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    assignedReports: 0,
    resolvedReports: 0
  });
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignee, setAssignee] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (currentUser && !currentUser.email?.includes('admin')) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Fetch reports and stats
  useEffect(() => {
    const fetchReportsAndStats = async () => {
      try {
        setLoading(true);
        
        // Get all reports
        const { reports: allReports } = await reportService.getReports(100);
        setReports(allReports);
        
        // Get reports by status
        const pendingReports = await reportService.getReportsByStatus('pending');
        const assignedReports = await reportService.getReportsByStatus('assigned');
        const resolvedReports = await reportService.getReportsByStatus('resolved');
        
        setStats({
          totalReports: allReports.length,
          pendingReports: pendingReports.length,
          assignedReports: assignedReports.length,
          resolvedReports: resolvedReports.length
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && currentUser.email?.includes('admin')) {
      fetchReportsAndStats();
    }
  }, [currentUser]);

  // Handle filter changes
  const handleFilterChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter reports by type and status
  const getFilteredReports = () => {
    return reports.filter(report => {
      const matchesType = !filter.wasteType || report.wasteType === filter.wasteType;
      const matchesStatus = !filter.status || report.status === filter.status;
      return matchesType && matchesStatus;
    });
  };

  // Handle report action (update status)
  const handleReportAction = (report: WasteReport, status: 'pending' | 'assigned' | 'resolved') => {
    if (status === 'assigned') {
      setSelectedReport(report);
      setDialogOpen(true);
    } else {
      updateReportStatus(report.id!, status);
    }
  };
  
  // Update report status
  const updateReportStatus = async (reportId: string, status: 'pending' | 'assigned' | 'resolved', assignedTo?: string) => {
    try {
      await reportService.updateReportStatus(reportId, status, assignedTo);
      
      // Update local state
      setReports(prev => prev.map(report => {
        if (report.id === reportId) {
          return { ...report, status, assignedTo };
        }
        return report;
      }));
      
      // Update stats
      if (status === 'pending') {
        setStats(prev => ({
          ...prev,
          pendingReports: prev.pendingReports + 1,
          assignedReports: prev.assignedReports - 1,
          resolvedReports: prev.resolvedReports - 1
        }));
      } else if (status === 'assigned') {
        setStats(prev => ({
          ...prev,
          pendingReports: prev.pendingReports - 1,
          assignedReports: prev.assignedReports + 1
        }));
      } else if (status === 'resolved') {
        setStats(prev => ({
          ...prev,
          pendingReports: prev.pendingReports - 1,
          assignedReports: prev.assignedReports - 1,
          resolvedReports: prev.resolvedReports + 1
        }));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      setError('Failed to update report status. Please try again.');
    }
  };
  
  // Update report priority
  const updateReportPriority = async (reportId: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await reportService.updateReportPriority(reportId, priority);
      
      // Update local state
      setReports(prev => prev.map(report => {
        if (report.id === reportId) {
          return { ...report, priority };
        }
        return report;
      }));
    } catch (error) {
      console.error('Error updating report priority:', error);
      setError('Failed to update report priority. Please try again.');
    }
  };
  
  // Handle assignment dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
    setAssignee('');
  };
  
  // Handle assignment submit
  const handleAssignSubmit = () => {
    if (selectedReport && assignee) {
      updateReportStatus(selectedReport.id!, 'assigned', assignee);
      handleDialogClose();
    }
  };
  
  // Export reports as CSV
  const exportReportsCSV = () => {
    const filteredData = getFilteredReports();
    if (filteredData.length === 0) return;
    
    const headers = ['ID', 'Type', 'Status', 'Priority', 'Address', 'Reported By', 'Date', 'Notes'];
    
    const csvData = filteredData.map(report => [
      report.id,
      report.wasteType,
      report.status,
      report.priority || 'N/A',
      report.address,
      report.userName,
      formatDate(report.createdAt),
      report.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `waste-reports-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser || !currentUser.email?.includes('admin')) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert severity="error">
            You do not have permission to access this page.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Municipal Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Manage and track waste reports across the city
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <DashboardIcon color="primary" sx={{ mb: 1 }} />
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
                <WarningIcon color="warning" sx={{ mb: 1 }} />
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
                <ClockIcon color="info" sx={{ mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.assignedReports}
                </Typography>
                <Typography color="text.secondary">
                  Assigned Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <CheckCircleIcon color="success" sx={{ mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.resolvedReports}
                </Typography>
                <Typography color="text.secondary">
                  Resolved Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Dashboard Tabs */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="dashboard tabs"
            >
              <Tab label="Map View" icon={<MapIcon />} iconPosition="start" />
              <Tab label="Reports Management" icon={<AssignmentIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Map Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Waste Reports Map
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
              
              <WasteMap 
                filter={{
                  wasteType: filter.wasteType || undefined,
                  status: filter.status as any || undefined
                }}
                height={600}
              />
            </Box>
          </TabPanel>
          
          {/* Reports Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Manage Waste Reports
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="waste-type-table-filter-label">Waste Type</InputLabel>
                    <Select
                      labelId="waste-type-table-filter-label"
                      id="wasteTypeTable"
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
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="status-table-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-table-filter-label"
                      id="statusTable"
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
                
                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportReportsCSV}
                    disabled={getFilteredReports().length === 0}
                    fullWidth
                  >
                    Export as CSV
                  </Button>
                </Grid>
              </Grid>
              
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Reported By</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredReports().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No reports found matching the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredReports().map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            {report.wasteType.charAt(0).toUpperCase() + report.wasteType.slice(1)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.status.toUpperCase()}
                              color={getStatusColor(report.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={report.priority || 'low'}
                                onChange={(e) => updateReportPriority(report.id!, e.target.value as any)}
                                size="small"
                              >
                                {priorityOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography variant="body2" noWrap title={report.address}>
                              {report.address}
                            </Typography>
                          </TableCell>
                          <TableCell>{report.userName}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {report.status === 'pending' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleReportAction(report, 'assigned')}
                                >
                                  Assign
                                </Button>
                              )}
                              {report.status === 'assigned' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => handleReportAction(report, 'resolved')}
                                >
                                  Resolve
                                </Button>
                              )}
                              {report.status === 'resolved' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  onClick={() => handleReportAction(report, 'pending')}
                                >
                                  Reopen
                                </Button>
                              )}
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Assign Report to Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="assignee"
            label="Team Member Name/ID"
            type="text"
            fullWidth
            variant="outlined"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAssignSubmit} color="primary" disabled={!assignee.trim()}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 