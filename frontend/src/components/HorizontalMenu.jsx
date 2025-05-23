import React, { useState, useEffect } from 'react';
import { 
  Box,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as ReportsIcon,
  Groups as TeamsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Star as FavoritesIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function HorizontalMenu({ onTabChange, activeTab = 'dashboard' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdmin } = useAuth();
  
  // Convert activeTab string to numeric index for Tabs component
  const getInitialTabValue = () => {
    switch(activeTab) {
      case 'dashboard': return 0;
      case 'employees': return 1;
      case 'reports': return isAdmin ? 2 : null;
      case 'notifications': return isAdmin ? 3 : 2;
      case 'favorites': return isAdmin ? 4 : 3;
      case 'help': return isAdmin ? 5 : 4;
      default: return 0;
    }
  };

  const [value, setValue] = useState(getInitialTabValue());
  
  // Update the tab value when activeTab changes
  useEffect(() => {
    setValue(getInitialTabValue());
  }, [activeTab, isAdmin]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    // Map tab index to tab name based on user role
    let tabName;
    if (isAdmin) {
      // Admin role tab mapping
      switch(newValue) {
        case 0: tabName = 'dashboard'; break;
        case 1: tabName = 'employees'; break;
        case 2: tabName = 'reports'; break;
        case 3: tabName = 'notifications'; break;
        case 4: tabName = 'favorites'; break;
        case 5: tabName = 'help'; break;
        default: tabName = 'dashboard';
      }
    } else {
      // Employee role tab mapping
      switch(newValue) {
        case 0: tabName = 'dashboard'; break;
        case 1: tabName = 'employees'; break;
        case 2: tabName = 'notifications'; break;
        case 3: tabName = 'favorites'; break;
        case 4: tabName = 'help'; break;
        default: tabName = 'dashboard';
      }
    }
    
    console.log(`${tabName} tab selected`);
    
    // Pass tab name to parent component
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        position: 'relative', // Changed from 'sticky' to 'relative'
        zIndex: 100,
      }}
    >
      <Tabs 
        value={value}
        onChange={handleChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        indicatorColor="primary"
        textColor="primary"
        centered={!isMobile}
        sx={{ 
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: theme.typography.fontWeightMedium,
          }
        }}
      >
        <Tab 
          icon={<DashboardIcon />} 
          iconPosition="start" 
          label={isMobile ? "" : "Dashboard"} 
          sx={{ minWidth: isMobile ? 'auto' : 120 }}
          aria-label="dashboard"
        />
        
        <Tab 
          icon={<TeamsIcon />} 
          iconPosition="start" 
          label={isMobile ? "" : "Employees"} 
          sx={{ minWidth: isMobile ? 'auto' : 120 }}
          aria-label="employees"
        />
        
        {isAdmin && (
          <Tab 
            icon={<ReportsIcon />} 
            iconPosition="start" 
            label={isMobile ? "" : "Reports"} 
            sx={{ minWidth: isMobile ? 'auto' : 120 }}
            aria-label="reports"
          />
        )}
        
        <Tab 
          icon={
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          } 
          iconPosition="start" 
          label={isMobile ? "" : "Notifications"} 
          sx={{ minWidth: isMobile ? 'auto' : 140 }}
          aria-label="notifications"
        />
        
        <Tab 
          icon={<FavoritesIcon />} 
          iconPosition="start" 
          label={isMobile ? "" : "Favorites"} 
          sx={{ minWidth: isMobile ? 'auto' : 120 }}
          aria-label="favorites"
        />
        
        <Tab 
          icon={<HelpIcon />} 
          iconPosition="start" 
          label={isMobile ? "" : "Help"} 
          sx={{ minWidth: isMobile ? 'auto' : 100 }}
          aria-label="help"
        />
      </Tabs>
    </Box>
  );
}