import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [dialogError, setDialogError] = useState('');
  const [dialogSuccess, setDialogSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'student'
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        const usersWithPasswords = response.data.data.map(user => ({
          ...user,
          password: user.password || 'password123'
        }));
        setUsers(usersWithPasswords);
        setFilteredUsers(usersWithPasswords);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setDialogError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    let searchTerm = searchQuery.toLowerCase();
    if (!searchTerm.includes('@')) {
      searchTerm += '@cfd.nu.edu.pk';
    }

    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const resetSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      console.log('Opening dialog for user:', user);
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password || 'password123',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'student'
      });
    }
    setOpenDialog(true);
    setDialogError('');
    setDialogSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setDialogError('');
    setDialogSuccess('');
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingUser) {
        // Update existing user - don't allow email change
        const updateData = {
          name: formData.name,
          role: formData.role,
          password: formData.password
        };

        // Make sure we have a valid ID
        if (!editingUser._id) {
          setDialogError('Invalid user data. Please try again.');
          return;
        }

        console.log('Updating user with ID:', editingUser._id);
        
        const response = await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, updateData);
        
        if (response.data.success) {
          const updatedUser = {
            ...editingUser,
            ...response.data.data,
          };
          
          setUsers(prev =>
            prev.map(user => 
              user._id === editingUser._id ? updatedUser : user
            )
          );
          setFilteredUsers(prev =>
            prev.map(user => 
              user._id === editingUser._id ? updatedUser : user
            )
          );
          
          setDialogSuccess('User updated successfully!');
          setTimeout(() => {
            handleCloseDialog();
          }, 1500);
        }
      } else {
        // Create new user
        const emailWithDomain = formData.email.includes('@') ? 
          formData.email : 
          formData.email + '@cfd.nu.edu.pk';

        const response = await axios.post('http://localhost:5000/api/users', {
          name: formData.name,
          email: emailWithDomain,
          password: formData.password,
          role: formData.role
        });
        
        if (response.data.success) {
          const newUser = {
            ...response.data.data,
            password: formData.password
          };
          
          setUsers(prev => [...prev, newUser]);
          setFilteredUsers(prev => [...prev, newUser]);
          
          setDialogSuccess('User created successfully!');
          setTimeout(() => {
            handleCloseDialog();
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
      if (err.response?.status === 409) {
        setDialogError('A user with this email already exists');
      } else if (err.response?.status === 400) {
        setDialogError(err.response.data.error || 'Invalid input data');
      } else if (err.response?.status === 404) {
        setDialogError('User not found. Please refresh the page and try again.');
      } else {
        setDialogError('Failed to save user. Please try again.');
      }
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setDialogError('Please enter a name');
      return false;
    }
    if (!editingUser && !formData.email) {
      setDialogError('Please enter an email');
      return false;
    }
    if (!formData.role) {
      setDialogError('Please select a role');
      return false;
    }
    return true;
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      
      // Update both users and filtered users lists
      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
      
      setDialogSuccess('User deleted successfully!');
      setTimeout(() => {
        setDeletingUser(null);
        setDialogSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error deleting user:', err);
      setDialogError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to delete user'
      );
    }
  };

  const renderUserTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'white' }}>Name</TableCell>
            <TableCell sx={{ color: 'white' }}>Email</TableCell>
            <TableCell sx={{ color: 'white' }}>Role</TableCell>
            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'student' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      startIcon={<EditIcon />}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setDeletingUser(user)}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                {loading ? 'Loading...' : 'No users found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
        User Management
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by email (type username only)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                @cfd.nu.edu.pk
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" onClick={resetSearch}>
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {renderUserTable()}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Update User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          {dialogSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {dialogSuccess}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
              disabled={editingUser}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    @cfd.nu.edu.pk
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              label="Password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                )
              }}
              helperText="Default password is 'password123'"
            />
            
            <FormControl component="fieldset">
              <FormLabel component="legend">User Role</FormLabel>
              <RadioGroup
                row
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <FormControlLabel value="student" control={<Radio />} label="Student" />
                <FormControlLabel value="driver" control={<Radio />} label="Driver" />
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            {editingUser ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deletingUser} 
        onClose={() => setDeletingUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          {dialogSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {dialogSuccess}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete the user <strong>{deletingUser?.name}</strong>?
            This action cannot be undone.
          </Typography>
          {deletingUser?.role === 'admin' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Warning: Deleting an admin user may affect system access.
              Make sure there is at least one admin remaining.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeletingUser(null)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deletingUser._id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers; 