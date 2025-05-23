import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import HamburgerMenu from './components/HamburgerMenu';
import HorizontalMenu from './components/HorizontalMenu';
import GridView from './components/GridView';
import TileView from './components/TileView';
import EmployeeDetail from './components/EmployeeDetail';
import Login from './components/Login';
import Register from './components/Register';

// Layout components
import { Box, Container, CircularProgress, Typography } from '@mui/material';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Dashboard - main application view
const Dashboard = () => {
  const [view, setView] = useState('grid');
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // Changed default tab to dashboard

  // Function to render content based on active tab
  const renderContent = () => {
    if (selected) {
      return <EmployeeDetail emp={selected} onBack={() => setSelected(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 1,
            backgroundColor: 'white',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Typography variant="h4" gutterBottom color="primary">Dashboard</Typography>
            <Typography variant="body1" paragraph>Welcome to the GraphStaff dashboard!</Typography>
            <Typography variant="body2">
              This dashboard provides an overview of employee data and key metrics.
              You can use the tabs above to navigate between different sections of the application.
            </Typography>
          </Box>
        );
      case 'employees':
        return view === 'grid' ? (
          <GridView onSelect={setSelected} setView={setView} />
        ) : (
          <TileView onSelect={setSelected} setView={setView} />
        );
      case 'reports':
        return (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 1,
            backgroundColor: 'white',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Typography variant="h4" gutterBottom color="primary">Reports</Typography>
            <Typography variant="body1" paragraph>Generate and view detailed reports on employee performance.</Typography>
            <Typography variant="body2">
              This section allows you to create custom reports based on various metrics
              such as attendance, performance, and departmental statistics.
            </Typography>
          </Box>
        );
      case 'notifications':
        return (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 1,
            backgroundColor: 'white',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Typography variant="h4" gutterBottom color="primary">Notifications</Typography>
            <Typography variant="body1" paragraph>Your latest updates and alerts appear here.</Typography>
            <Typography variant="body2">
              Stay informed about important events, employee updates, and system notifications.
              You can customize your notification preferences in the settings.
            </Typography>
          </Box>
        );
      case 'favorites':
        return (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 1,
            backgroundColor: 'white',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Typography variant="h4" gutterBottom color="primary">Favorites</Typography>
            <Typography variant="body1" paragraph>Quick access to your bookmarked items.</Typography>
            <Typography variant="body2">
              This section displays your favorite employees, reports, and frequently accessed items.
              You can mark items as favorites throughout the application.
            </Typography>
          </Box>
        );
      case 'help':
        return (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 1,
            backgroundColor: 'white',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Typography variant="h4" gutterBottom color="primary">Help Center</Typography>
            <Typography variant="body1" paragraph>Need assistance? Find guides and support resources here.</Typography>
            <Typography variant="body2">
              Browse through our comprehensive documentation, FAQs, and video tutorials.
              If you need further assistance, contact our support team.
            </Typography>
          </Box>
        );
      default:
        return view === 'grid' ? (
          <GridView onSelect={setSelected} setView={setView} />
        ) : (
          <TileView onSelect={setSelected} setView={setView} />
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HamburgerMenu />
      <HorizontalMenu 
        onTabChange={(tab) => setActiveTab(tab)} 
        activeTab={activeTab}
      />
      <Container maxWidth="xl" sx={{ mt: 3, mb: 5, flexGrow: 1 }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

// Auth container component
const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return isLogin ? (
    <Login onToggleForm={() => setIsLogin(false)} />
  ) : (
    <Register onToggleForm={() => setIsLogin(true)} />
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthContainer />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;