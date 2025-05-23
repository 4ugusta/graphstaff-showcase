import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  GroupWork as GroupWorkIcon,
  SupervisedUserCircle as DepartmentIcon,
  Logout as LogoutIcon,
  HowToReg as RoleIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const theme = useTheme();
  
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  const toggleSubMenu = (menu) => {
    if (menu === 'employees') {
      setEmployeesOpen(!employeesOpen);
    } else if (menu === 'admin') {
      setAdminOpen(!adminOpen);
    }
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenu(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenu(null);
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GraphStaff
          </Typography>
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user?.name}
              </Typography>
              <IconButton 
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenu}
                open={Boolean(userMenu)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Account Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit">Login</Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography variant="h6" component="div">
            GraphStaff Menu
          </Typography>
          {isAuthenticated && (
            <Typography variant="body2">
              {isAdmin ? 'Administrator' : 'Employee'}
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <List>
          <ListItem button onClick={() => {
            toggleDrawer();
          }}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          
          <ListItem button onClick={() => {
            toggleDrawer();
          }}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button onClick={() => toggleSubMenu('employees')}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Employees" />
            {employeesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={employeesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                sx={{ pl: 4 }}
                onClick={() => {
                  toggleDrawer();
                }}
              >
                <ListItemIcon>
                  <GroupWorkIcon />
                </ListItemIcon>
                <ListItemText primary="All Employees" />
              </ListItem>
              
              <ListItem 
                button 
                sx={{ pl: 4 }}
                onClick={() => {
                  toggleDrawer();
                }}
              >
                <ListItemIcon>
                  <DepartmentIcon />
                </ListItemIcon>
                <ListItemText primary="By Department" />
              </ListItem>
            </List>
          </Collapse>
          
          {isAdmin && (
            <>
              <ListItem button onClick={() => toggleSubMenu('admin')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Administration" />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              
              <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem 
                    button 
                    sx={{ pl: 4 }}
                    onClick={() => {
                      toggleDrawer();
                    }}
                  >
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add Employee" />
                  </ListItem>
                  
                  <ListItem 
                    button 
                    sx={{ pl: 4 }}
                    onClick={() => {
                      toggleDrawer();
                    }}
                  >
                    <ListItemIcon>
                      <RoleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Manage Roles" />
                  </ListItem>
                </List>
              </Collapse>
            </>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem button onClick={() => {
            toggleDrawer();
          }}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}