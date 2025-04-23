import React from 'react';
import { Container, Typography, Box, Alert, Paper } from '@mui/material';
import ReportForm from '../components/ReportForm/ReportForm';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ReportPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Waste Location
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Help keep our community clean by reporting waste that needs attention.
        </Typography>
        
        {!currentUser ? (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Alert severity="info">
              You need to be logged in to report waste locations. 
              Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.
            </Alert>
          </Paper>
        ) : (
          <Box sx={{ mt: 4 }}>
            <ReportForm />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ReportPage; 