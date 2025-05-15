import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DirectionsBus as BusIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, set } from 'date-fns';
import api from '../../services/api';

const ManageSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBus, setSelectedBus] = useState('');
  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState({ 
    name: '', 
    time: format(new Date(), 'HH:mm')
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [busLoading, setBusLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Fetch schedules and buses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching schedules and buses...');
        
        // Fetch schedules first
        const schedulesRes = await api.get('/schedules');
        console.log('Schedules response:', schedulesRes.data);
        
        if (!Array.isArray(schedulesRes.data)) {
          throw new Error('Invalid schedules data received');
        }
        
        setSchedules(schedulesRes.data);

        // Only fetch buses if not in edit mode
        if (!editingSchedule) {
          const busesRes = await api.get('/schedules/buses');
          console.log('Buses response:', busesRes.data);
          
          if (!Array.isArray(busesRes.data)) {
            throw new Error('Invalid buses data received');
          }
          
          // Filter out buses that already have schedules
          const busesWithSchedules = new Set(schedulesRes.data.map(schedule => schedule.busId?._id));
          const availableBuses = busesRes.data.filter(bus => !busesWithSchedules.has(bus._id));
          
          setBuses(availableBuses);
          
          if (availableBuses.length === 0) {
            setError('No buses available for scheduling. All buses already have schedules.');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', err);
        console.error('Response:', err.response);
        console.error('Request config:', err.config);
        setError(err.response?.data?.message || 'Failed to load schedules data');
        setSchedules([]);
        setBuses([]);
      } finally {
        setLoading(false);
        setBusLoading(false);
      }
    };

    fetchData();
  }, [editingSchedule]);

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      // Edit mode
      setEditingSchedule(schedule);
      setSelectedBus(schedule.busId._id);
      setStops(schedule.stops.map(stop => ({
        ...stop,
        id: Date.now() + Math.random(),
        time: stop.time
      })));
    } else {
      // Add mode
      setEditingSchedule(null);
      setStops([]);
      setSelectedBus('');
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setSuccess('');
    setEditingSchedule(null);
    setNewStop({ name: '', time: format(new Date(), 'HH:mm') });
  };

  const handleAddStop = () => {
    if (!newStop.name.trim()) {
      setError('Stop name is required');
      return;
    }

    try {
      setStops([...stops, { 
        ...newStop, 
        id: Date.now(),
        time: newStop.time // Time is already in HH:mm format
      }]);
      setNewStop({ name: '', time: format(new Date(), 'HH:mm') });
      setError('');
    } catch (err) {
      setError('Invalid time format. Please use HH:mm format.');
    }
  };

  const handleRemoveStop = (stopId) => {
    setStops(stops.filter((stop) => stop.id !== stopId));
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule && !selectedBus) {
      setError('Please select a bus');
      return;
    }
    if (stops.length < 2) {
      setError('Add at least two stops for the route');
      return;
    }

    try {
      const formattedStops = stops.map((stop, index) => ({
        name: stop.name,
        time: stop.time,
        order: index + 1
      }));

      let response;
      if (editingSchedule) {
        // Update existing schedule
        response = await api.put(`/schedules/${editingSchedule._id}`, {
          busId: selectedBus,
          stops: formattedStops
        });
        setSchedules(schedules.map(s => 
          s._id === editingSchedule._id ? response.data : s
        ));
        setSuccess('Schedule updated successfully!');
      } else {
        // Create new schedule
        response = await api.post('/schedules', {
          busId: selectedBus,
          stops: formattedStops
        });
        setSchedules([...schedules, response.data]);
        // Remove the selected bus from available buses
        setBuses(buses.filter(bus => bus._id !== selectedBus));
        setSuccess('Schedule added successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingSchedule ? 'update' : 'save'} schedule`);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const scheduleToDelete = schedules.find(s => s._id === scheduleId);
      await api.delete(`/schedules/${scheduleId}`);
      setSchedules(schedules.filter(schedule => schedule._id !== scheduleId));
      
      // Add the bus back to available buses if it's not already there
      if (scheduleToDelete && !buses.some(bus => bus._id === scheduleToDelete.busId._id)) {
        const newBus = {
          _id: scheduleToDelete.busId._id,
          busNumber: scheduleToDelete.busId.busNumber,
          model: scheduleToDelete.busId.model
        };
        setBuses([...buses, newBus]);
      }
      
      setSuccess('Schedule deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete schedule');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            Bus Schedules
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
            disabled={loading || buses.length === 0}
          >
            Add New Schedule
          </Button>
        </Box>

        {/* Success/Error Alerts */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Schedules List */}
        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : schedules.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>
                  {error ? 'Error loading schedules' : 'No schedules found. Create your first schedule!'}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            schedules.map((schedule) => (
              <Grid item xs={12} md={6} key={schedule._id}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {schedule.busId?.busNumber} - {schedule.busId?.model}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        onClick={() => handleOpenDialog(schedule)}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {/* Stops List */}
                  <List dense>
                    {schedule.stops.sort((a, b) => a.order - b.order).map((stop) => (
                      <ListItem key={stop._id || stop.id}>
                        <ListItemText
                          primary={stop.name}
                          secondary={stop.time}
                          primaryTypographyProps={{
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>

        {/* Add/Edit Schedule Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            {editingSchedule ? <EditIcon sx={{ mr: 1 }} /> : <AddIcon sx={{ mr: 1 }} />}
            {editingSchedule ? 'Edit Bus Schedule' : 'Add New Bus Schedule'}
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

            {/* Bus Selection */}
            {!editingSchedule && (
              <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
                <InputLabel>Select Bus</InputLabel>
                <Select
                  value={selectedBus}
                  label="Select Bus"
                  onChange={(e) => setSelectedBus(e.target.value)}
                  disabled={busLoading || buses.length === 0}
                >
                  {busLoading ? (
                    <MenuItem disabled>Loading buses...</MenuItem>
                  ) : buses.length === 0 ? (
                    <MenuItem disabled>No buses available for scheduling</MenuItem>
                  ) : (
                    buses.map((bus) => (
                      <MenuItem key={bus._id} value={bus._id}>
                        {bus.busNumber} - {bus.model}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}

            {/* Add Stop Form */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Add Stops
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Stop Name"
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TimePicker
                    label="Time"
                    value={parse(newStop.time, 'HH:mm', new Date())}
                    onChange={(newTime) => {
                      if (newTime) {
                        setNewStop({
                          ...newStop,
                          time: format(newTime, 'HH:mm')
                        });
                      }
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
                  <Button
                fullWidth
                variant="outlined"
                    onClick={handleAddStop}
                    startIcon={<AddIcon />}
                sx={{ mt: 1 }}
                disabled={!newStop.name.trim()}
                  >
                Add Stop
                  </Button>
            </Box>

            {/* Stops List */}
            {stops.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Route Stops ({stops.length})
                </Typography>
                <List dense>
                  {stops.map((stop, index) => (
                    <ListItem key={stop.id}>
                      <ListItemText
                        primary={`${index + 1}. ${stop.name}`}
                        secondary={stop.time}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveStop(stop.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
              )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSchedule} 
              variant="contained" 
              startIcon={editingSchedule ? <EditIcon /> : <AddIcon />}
              disabled={stops.length < 2 || (!editingSchedule && !selectedBus)}
            >
              {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ManageSchedules; 