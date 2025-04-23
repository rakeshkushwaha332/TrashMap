import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Map as MapIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    {
      text: 'Map',
      icon: <MapIcon />,
      onClick: () => navigate('/')
    },
    {
      text: 'Report Waste',
      icon: <AddIcon />,
      onClick: () => navigate('/report'),
      requiresAuth: true
    },
    {
      text: 'My Reports',
      icon: <ArticleIcon />,
      onClick: () => navigate('/my-reports'),
      requiresAuth: true
    },
    ...(currentUser?.email?.includes('admin') ? [
      {
        text: 'Admin Dashboard',
        icon: <DashboardIcon />,
        onClick: () => navigate('/admin/dashboard')
      }
    ] : [])
  ];

  const authItems = currentUser ? [
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      onClick: handleLogout
    }
  ] : [
    {
      text: 'Login',
      icon: <LoginIcon />,
      onClick: () => navigate('/login')
    },
    {
      text: 'Register',
      icon: <RegisterIcon />,
      onClick: () => navigate('/register')
    }
  ];

  const drawer = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 250 }}
    >
      <List>
        {menuItems
          .filter(item => !item.requiresAuth || currentUser)
          .map((item, index) => (
            <ListItem button key={index} onClick={item.onClick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      <List>
        {authItems.map((item, index) => (
          <ListItem button key={index} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4caf50' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              color: 'white', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <MapIcon sx={{ mr: 1 }} />
            TrashMap
          </Typography>

          {!isMobile && (
            <>
              {menuItems
                .filter(item => !item.requiresAuth || currentUser)
                .map((item, index) => (
                  <Button 
                    key={index} 
                    color="inherit" 
                    onClick={item.onClick}
                    startIcon={item.icon}
                    sx={{ mx: 1 }}
                  >
                    {item.text}
                  </Button>
                ))}

              {authItems.map((item, index) => (
                <Button 
                  key={index} 
                  color="inherit" 
                  onClick={item.onClick}
                  startIcon={item.icon}
                  sx={{ mx: 1 }}
                >
                  {item.text}
                </Button>
              ))}
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 