import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const GET_EMPLOYEE_DETAILS = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      age
      class
      subjects
      attendance
      createdAt
      updatedAt
    }
  }
`;

// Generate consistent avatar colors based on name
const getAvatarColor = (name) => {
  const colors = [
    '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
    '#c2185b', '#0097a7', '#ffa000', '#5d4037'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Function to get initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Sample attendance data for chart (last 6 months)
const generateAttendanceData = (baseAttendance) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    value: Math.max(Math.min(baseAttendance + (Math.random() * 10 - 5), 100), 75)
  }));
};

export default function EmployeeDetail({ emp, onBack }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [favorite, setFavorite] = React.useState(false);
  
  // Fetch more detailed employee data if needed
  const { data, loading } = useQuery(GET_EMPLOYEE_DETAILS, { 
    variables: { id: emp.id },
    // Use data from cache if available
    fetchPolicy: 'cache-first'
  });
  
  // Get employee data from query or use the passed emp object
  const employee = data?.employee || emp;
  const attendanceHistory = generateAttendanceData(employee.attendance);
  
  // Format createdAt date if available
  const formattedDate = employee.createdAt 
    ? new Date(parseInt(employee.createdAt)).toLocaleDateString() 
    : 'N/A';
    
  return (
    <Box sx={{ pb: 4 }}>
      {/* Back button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onBack}
          variant="outlined"
        >
          Back to List
        </Button>
        
        <Box>
          {isAdmin && (
            <Button 
              startIcon={<EditIcon />} 
              variant="contained" 
              color="primary"
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          <IconButton 
            color={favorite ? "error" : "default"} 
            onClick={() => setFavorite(!favorite)}
            sx={{ border: `1px solid ${theme.palette.divider}` }}
          >
            {favorite ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Employee details header card */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 3, 
                background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 3
              }}>
                <Avatar 
                  src={null} 
                  sx={{ 
                    width: 100, 
                    height: 100,
                    fontSize: '2rem',
                    bgcolor: getAvatarColor(employee.name),
                    border: '4px solid white'
                  }}
                >
                  {getInitials(employee.name)}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {employee.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Chip 
                      label={employee.class} 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                    
                    <Chip 
                      label={`${employee.age} years old`}
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} 
                    />
                    
                    <Chip 
                      icon={<ScheduleIcon sx={{ color: 'white !important' }} />}
                      label={`${employee.attendance}% Attendance`}
                      sx={{ 
                        bgcolor: employee.attendance > 95 
                          ? 'rgba(46, 125, 50, 0.8)' 
                          : employee.attendance > 90 
                            ? 'rgba(237, 108, 2, 0.8)' 
                            : 'rgba(211, 47, 47, 0.8)',
                        color: 'white'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      startIcon={<MailIcon />} 
                      variant="outlined" 
                      size="small" 
                      sx={{ 
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Email
                    </Button>
                    <Button 
                      startIcon={<PhoneIcon />} 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Call
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Basic info */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} /> Academic Information
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ '& > div': { mb: 2 } }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Class:
                    </Typography>
                    <Typography variant="body1">
                      {employee.class}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age:
                    </Typography>
                    <Typography variant="body1">
                      {employee.age} years
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Subjects:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {employee.subjects?.map(subject => (
                        <Chip 
                          key={subject} 
                          label={subject} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Employee Since:
                    </Typography>
                    <Typography variant="body1">
                      {formattedDate}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Attendance stats */}
          <Grid item xs={12} md={8}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Attendance History
                </Typography>
                
                <Grid container spacing={2}>
                  {attendanceHistory.map((month, index) => (
                    <Grid item xs={6} sm={4} md={2} key={month.month}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {month.month}
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex', justifyContent: 'center' }}>
                          <Box sx={{ position: 'relative', height: 80, width: 80 }}>
                            <CircularProgress
                              variant="determinate"
                              value={month.value}
                              size={80}
                              thickness={5}
                              sx={{ 
                                color: month.value > 95 
                                  ? 'success.main' 
                                  : month.value > 90 
                                    ? 'warning.main'
                                    : 'error.main',
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={80}
                              thickness={5}
                              sx={{ 
                                color: theme.palette.grey[200],
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: -1
                              }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                {Math.round(month.value)}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {employee.attendance && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Attendance Rate: {employee.attendance}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={employee.attendance} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          bgcolor: employee.attendance > 95 
                            ? 'success.main' 
                            : employee.attendance > 90 
                              ? 'warning.main'
                              : 'error.main',
                        }
                      }} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Additional information section */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes & Additional Information
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" paragraph>
                  {employee.name} is a {employee.class.toLowerCase()} specializing in {employee.subjects?.join(', ')}. 
                  With an attendance rate of {employee.attendance}%, {employee.name} {employee.attendance > 95 ? 'demonstrates exceptional commitment' : employee.attendance > 90 ? 'shows good commitment' : 'could improve attendance'} to their teaching responsibilities.
                </Typography>
                
                <Typography variant="body1">
                  Faculty members in the {employee.class} category typically handle advanced coursework and may participate in departmental committees. This role includes curriculum development, student advising, and research oversight.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}