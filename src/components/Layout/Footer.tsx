import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { GitHub as GitHubIcon, Twitter as TwitterIcon, Facebook as FacebookIcon } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="/">
              TrashMap
            </Link>{' '}
            {new Date().getFullYear()}
            {' - Connecting citizens and waste management'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
            <IconButton aria-label="github" color="inherit" size="small">
              <GitHubIcon />
            </IconButton>
            <IconButton aria-label="twitter" color="inherit" size="small">
              <TwitterIcon />
            </IconButton>
            <IconButton aria-label="facebook" color="inherit" size="small">
              <FacebookIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 