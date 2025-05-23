import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  ViewModule as TileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Flag as FlagIcon,
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

export default function GridView({ onSelect, setView }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  
  // State for sorting and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterName, setFilterName] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    class: '',
    subjects: [],
    attendance: ''
  });

  // GraphQL query with variables
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES, { 
    variables: { 
      page: page + 1, // GraphQL uses 1-based index
      limit: rowsPerPage,
      sortBy,
      sortOrder,
      filterName: filterName || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  // Create sortable table headers
  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilterName(searchInput);
    setPage(0); // Reset to first page when searching
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Row menu handling
  const handleMenuOpen = (event, employee) => {
    event.stopPropagation();
    setSelectedRow(employee);
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
    console.log('Delete employee:', selectedRow.id);
    setDeleteConfirmOpen(false);
    // After delete, refetch the data
    refetch();
  };

  const handleEditClick = () => {
    handleMenuClose();
    console.log('Edit employee:', selectedRow.id);
    
    // Set edit data from selected row
    setEditData({
      name: selectedRow.name,
      age: selectedRow.age,
      class: selectedRow.class,
      subjects: selectedRow.subjects,
      attendance: selectedRow.attendance
    });
    
    // Open edit dialog
    setEditDialogOpen(true);
  };
  
  const handleEditClose = () => {
    setEditDialogOpen(false);
  };
  
  const handleEditSave = () => {
    // Here you would implement the actual update mutation
    console.log('Saving edited employee:', selectedRow.id, editData);
    setEditDialogOpen(false);
    // After saving, you would refetch the data
    // refetch();
  };

  const handleFlagClick = () => {
    handleMenuClose();
    console.log('Flag employee:', selectedRow.id);
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
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Title and view toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ mr: 2 }}>
            Employees
          </Typography>
          <Tooltip title="Switch to Tile View">
            <Button 
              variant="outlined" 
              startIcon={<TileIcon />} 
              onClick={() => setView('tile')}
              size="small"
            >
              Tile View
            </Button>
          </Tooltip>
        </Box>

        {/* Search form */}
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
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
              )
            }}
            sx={{ minWidth: 250 }}
          />
          <Button 
            type="submit"
            variant="contained" 
            size="small"
            sx={{ ml: 1 }}
          >
            Search
          </Button>
          <IconButton 
            size="small" 
            aria-label="filter"
            sx={{ ml: 1 }}
          >
            <FilterIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Employee data table */}
      <TableContainer component={Paper} sx={{ 
        mb: 2,
        boxShadow: theme.shadows[3],
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Name
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'age'}
                  direction={sortBy === 'age' ? sortOrder : 'asc'}
                  onClick={() => handleSort('age')}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Age
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'class'}
                  direction={sortBy === 'class' ? sortOrder : 'asc'}
                  onClick={() => handleSort('class')}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Class
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  Subjects
                </Typography>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'attendance'}
                  direction={sortBy === 'attendance' ? sortOrder : 'asc'}
                  onClick={() => handleSort('attendance')}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Attendance
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No employees found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow 
                  key={emp.id} 
                  hover 
                  onClick={() => onSelect(emp)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                    '&:hover': { backgroundColor: theme.palette.action.selected }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">{emp.name}</Typography>
                  </TableCell>
                  <TableCell align="right">{emp.age}</TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.class} 
                      size="small"
                      sx={{ 
                        backgroundColor: theme.palette.info.light,
                        color: theme.palette.info.contrastText
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {emp.subjects.map(subject => (
                        <Chip 
                          key={subject} 
                          label={subject} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${emp.attendance}%`} 
                      size="small" 
                      color={emp.attendance > 95 ? "success" : emp.attendance > 90 ? "warning" : "error"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, emp)}
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={pageInfo.totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Row action menu */}
      <Menu
        id="row-menu"
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
          if (selectedRow) onSelect(selectedRow);
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
            Are you sure you want to delete {selectedRow?.name}? This action cannot be undone.
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
      
      {/* Edit employee dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Edit Employee</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={editData.age}
              onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Class"
              name="class"
              value={editData.class}
              onChange={(e) => setEditData({ ...editData, class: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Subjects (comma-separated)"
              name="subjects"
              value={Array.isArray(editData.subjects) ? editData.subjects.join(', ') : ''}
              onChange={(e) => setEditData({ ...editData, subjects: e.target.value.split(',').map(s => s.trim()) })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Attendance (%)"
              name="attendance"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              value={editData.attendance}
              onChange={(e) => setEditData({ ...editData, attendance: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}