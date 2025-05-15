import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { BusIcon, SearchIcon, CancelIcon, AddIcon, CheckCircleIcon, DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';

const ManageBuses = () => {
  const [buses, setBuses] = useState([]);
  const [editingBus, setEditingBus] = useState(null);
  const [deletingBus, setDeletingBus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenDialog = () => {
    setEditingBus(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setEditingBus(null);
    setOpenDialog(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingBus) {
        // Update existing bus
        const response = await api.put(`/buses/${editingBus._id}`, formData);
        setBuses(buses.map(bus => bus._id === editingBus._id ? response.data : bus));
        setSuccess('Bus updated successfully!');
      } else {
        // Add new bus
        const response = await api.post('/buses', formData);
        setBuses([...buses, response.data]);
        setSuccess('Bus added successfully!');
      }

      // Keep dialog open for 1.5 seconds to show success message
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) {
      return;
    }

    try {
      await api.delete(`/buses/${id}`);
      setBuses(buses.filter(bus => bus._id !== id));
      setSuccess('Bus deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bus');
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    // Implement the reset search logic here
  };

  const handleSearch = () => {
    // Implement the search logic here
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <BusIcon sx={{ mr: 1, color: 'primary.main' }} />
        Bus Fleet Management
      </Typography>

      {/* Search and Add Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by Bus Number or Model"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button variant="outlined" onClick={resetSearch} startIcon={<CancelIcon />}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
              Search
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Bus
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bus List */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bus Number</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buses.map(bus => (
              <TableRow key={bus._id}>
                <TableCell>{bus.busNumber}</TableCell>
                <TableCell>{bus.model}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setEditingBus(bus);
                      handleOpenDialog();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setDeletingBus(bus);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <BusIcon sx={{ mr: 1 }} />
          {editingBus ? 'Edit Bus' : 'Add New Bus'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          // ... existing dialog content ...
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
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingBus} onClose={() => setDeletingBus(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bus? This action cannot be undone.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingBus(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deletingBus._id);
              setDeletingBus(null);
            }}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBuses; 