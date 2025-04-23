import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { VisibilityOutlined as ViewIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService, WasteReport } from '../services/ReportService';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const MyReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch user reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userReports = await reportService.getUserReports(currentUser.uid);
        setReports(userReports);
      } catch (err) {
        console.error('Error fetching user reports:', err);
        setError('Failed to load your reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [currentUser]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter reports by status
  const getFilteredReports = (status?: string) => {
    if (!status) return reports;
    return reports.filter(report => report.status === status);
  };

  // Card view for reports
  const ReportCards = ({ filteredReports }: { filteredReports: WasteReport[] }) => (
    <Grid container spacing={3}>
      {filteredReports.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">No reports found in this category.</Typography>
          </Paper>
        </Grid>
      ) : (
        filteredReports.map(report => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image={report.imageUrl}
                alt={report.wasteType}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {report.wasteType.charAt(0).toUpperCase() + report.wasteType.slice(1)}
                  </Typography>
                  <Chip 
                    label={report.status.toUpperCase()} 
                    color={getStatusColor(report.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {report.address}
                </Typography>
                
                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                  Reported on: {formatDate(report.createdAt)}
                </Typography>
                
                {report.notes && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {report.notes.length > 100 ? `${report.notes.substring(0, 100)}...` : report.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  // Table view for reports
  const ReportTable = ({ filteredReports }: { filteredReports: WasteReport[] }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No reports found in this category.
              </TableCell>
            </TableRow>
          ) : (
            filteredReports.map(report => (
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
                <TableCell sx={{ maxWidth: 200 }} >
                  <Typography variant="body2" noWrap title={report.address}>
                    {report.address}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Reports
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          View and track all your submitted waste reports
        </Typography>
        
        {!currentUser ? (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Alert severity="info">
              You need to be logged in to view your reports. 
              Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.
            </Alert>
          </Paper>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        ) : reports.length === 0 ? (
          <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              You haven't submitted any reports yet
            </Typography>
            <Typography paragraph>
              Start by reporting waste locations you encounter in your community.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/report"
              sx={{ mt: 2 }}
            >
              Report Waste Location
            </Button>
          </Paper>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  aria-label="report tabs"
                >
                  <Tab label="All Reports" />
                  <Tab label="Pending" />
                  <Tab label="Assigned" />
                  <Tab label="Resolved" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <ReportCards filteredReports={getFilteredReports()} />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <ReportCards filteredReports={getFilteredReports('pending')} />
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <ReportCards filteredReports={getFilteredReports('assigned')} />
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <ReportCards filteredReports={getFilteredReports('resolved')} />
              </TabPanel>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" gutterBottom>
                Table View
              </Typography>
              
              <ReportTable 
                filteredReports={
                  tabValue === 0 ? reports : 
                  tabValue === 1 ? getFilteredReports('pending') :
                  tabValue === 2 ? getFilteredReports('assigned') :
                  getFilteredReports('resolved')
                } 
              />
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyReportsPage; 