import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Badge,
  Divider,
  CardHeader,
  useTheme
} from '@mui/material';
import {
  ViewList as GridViewIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const GET_EMPLOYEES = gql`
  query GetEmployees($page: Int, $limit: Int, $sortBy: String, $sortOrder: String, $filterName: String) {
    employees(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, filterName: $filterName) {
      employees {
        id
        name
        age
        class
        subjects
        attendance
        createdAt
        updatedAt
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Random avatar colors for consistent employee colors
const getAvatarColor = (name) => {
  const colors = [
    '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
    '#c2185b', '#0097a7', '#ffa000', '#5d4037'
  ];
  
  // Generate a simple hash from the name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colors[hash % colors.length];
};

// Function to generate initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default function TileView({ onSelect, setView }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  
  // State for sorting, filtering, and pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterName, setFilterName] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // GraphQL query with variables
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES, { 
    variables: { 
      page,
      limit: rowsPerPage,
      sortBy,
      sortOrder,
      filterName: filterName || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilterName(searchInput);
    setPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Menu handling
  const handleMenuOpen = (event, employee) => {
    event.stopPropagation();
    setSelectedTile(employee);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Delete functionality would go here
    console.log('Delete employee:', selectedTile.id);
    setDeleteConfirmOpen(false);
    // After delete, refetch the data
    refetch();
  };

  const handleEditClick = () => {
    handleMenuClose();
    console.log('Edit employee:', selectedTile.id);
    // Edit functionality would be implemented here
  };

  const handleFlagClick = () => {
    handleMenuClose();
    console.log('Flag employee:', selectedTile.id);
    // Flag functionality would be implemented here
  };

  // Render loading state
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading employees: {error.message}</Typography>
        <Button 
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Extract data from the query result
  const employees = data?.employees?.employees || [];
  const pageInfo = data?.employees?.pageInfo || {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Title and view toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ mr: 2 }}>
            Employees
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<GridViewIcon />} 
            onClick={() => setView('grid')}
            size="small"
          >
            Grid View
          </Button>
        </Box>

        {/* Search form */}
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search employees..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    aria-label="filter"
                    sx={{ mr: -1 }}
                  >
                    <FilterIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Box>

      {/* Employee tiles */}
      <Grid container spacing={3}>
        {employees.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No employees found
              </Typography>
            </Box>
          </Grid>
        ) : (
          employees.map((emp) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
              <Card 
                elevation={3}
                onClick={() => onSelect(emp)}
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Badge 
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        emp.attendance > 95 ? (
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 10, 
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              border: `2px solid ${theme.palette.background.paper}`
                            }} 
                          />
                        ) : emp.attendance > 90 ? (
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 10, 
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'warning.main',
                              border: `2px solid ${theme.palette.background.paper}`
                            }} 
                          />
                        ) : (
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 10, 
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              border: `2px solid ${theme.palette.background.paper}`
                            }} 
                          />
                        )
                      }
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: getAvatarColor(emp.name),
                          width: 50,
                          height: 50,
                          fontSize: '1.2rem'
                        }}
                      >
                        {getInitials(emp.name)}
                      </Avatar>
                    </Badge>
                  }
                  action={
                    <IconButton 
                      aria-label="settings" 
                      onClick={(e) => handleMenuOpen(e, emp)}
                    >
                      <MoreIcon />
                    </IconButton>
                  }
                  title={
                    <Typography variant="h6" component="div" noWrap>
                      {emp.name}
                    </Typography>
                  }
                  subheader={emp.class}
                />
                
                <Divider sx={{ mx: 2 }} />
                
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Age:</strong> {emp.age}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Attendance:</strong> {emp.attendance}%
                    </Typography>
                  </Box>
                  
                  {emp.subjects && emp.subjects.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Subjects:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {emp.subjects.slice(0, 3).map(subject => (
                          <Chip 
                            key={subject} 
                            label={subject} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {emp.subjects.length > 3 && (
                          <Chip 
                            label={`+${emp.subjects.length - 3}`} 
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(emp);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Pagination 
          count={pageInfo.totalPages} 
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Tile action menu */}
      <Menu
        id="tile-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 150,
            borderRadius: '8px',
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          },
        }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedTile) onSelect(selectedTile);
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>👁️</Box> View Details
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        <MenuItem onClick={handleFlagClick}>
          <FlagIcon fontSize="small" sx={{ mr: 1 }} /> Flag
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {selectedTile?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}