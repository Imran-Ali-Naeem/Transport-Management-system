import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import { PersonAdd, ArrowBack, VerifiedUser } from '@mui/icons-material';
import { deepPurple } from '@mui/material/colors';
import api from '../../services/api';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setOtpError('');
  };

  const validateEmail = (email) => {
    return email.endsWith('@cfd.nu.edu.pk');
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.name) {
      setError('Please enter your name and email address');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please use a valid @cfd.nu.edu.pk email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Sending OTP to:', formData.email);
      
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name
      });

      if (response.data?.success) {
        console.log('OTP sent successfully:', response.data);
        setSuccess('OTP sent successfully! Please check your email.');
        setShowOtpDialog(true);
      } else {
        throw new Error(response.data?.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send OTP');
      setShowOtpDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.otp) {
      setOtpError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setOtpError('');
      console.log('Attempting registration with OTP');
      
      const response = await api.post('/auth/register', formData);

      if (response.data?.success) {
        console.log('Registration successful:', response.data);
        setSuccess('Registration successful! Redirecting to login...');
        setShowOtpDialog(false);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error(response.data?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setOtpError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDialogClose = () => {
    if (!loading) {
      setShowOtpDialog(false);
      setFormData({ ...formData, otp: '' });
      setOtpError('');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5">
              Student Registration
            </Typography>
          </Box>

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

          <form onSubmit={(e) => e.preventDefault()}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              helperText="Must be a valid @cfd.nu.edu.pk email address"
              error={formData.email && !validateEmail(formData.email)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOTP}
              disabled={loading || !formData.email || !validateEmail(formData.email) || !formData.name || !formData.password}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              onClick={() => navigate('/login')}
              startIcon={<ArrowBack />}
              sx={{ color: deepPurple[600] }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={showOtpDialog}
        onClose={handleOtpDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          color: deepPurple[700]
        }}>
          <VerifiedUser />
          Verify Your Email
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We've sent a verification code to <strong>{formData.email}</strong>. 
            Please check your inbox and enter the code below.
          </Typography>
          <TextField
            fullWidth
            label="Enter OTP"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            error={Boolean(otpError)}
            helperText={otpError}
            disabled={loading}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleOtpDialogClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.otp}
            sx={{ bgcolor: deepPurple[700] }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify & Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentRegister; 