import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  Avatar,
  Grid,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  LockOutlined, 
  EmailOutlined, 
  Visibility, 
  VisibilityOff,
  ArrowForward,
  VpnKey,
  PersonAdd
} from '@mui/icons-material';
import { deepPurple } from '@mui/material/colors';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error: authError, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashboardPath = `/${user.role}`;
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', { email });
      const role = await login(email.toLowerCase(), password);
      
      if (role) {
        // Check if there's a stored redirect path
        const redirectPath = sessionStorage.getItem('redirectPath');
        sessionStorage.removeItem('redirectPath'); // Clear stored path
        
        // Navigate to stored path or default dashboard
        if (redirectPath && redirectPath !== '/login') {
          navigate(redirectPath, { replace: true });
        } else {
          navigate(`/${role}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={6} sx={{ 
        p: 4, 
        width: '100%',
        borderRadius: 3,
        background: 'linear-gradient(to bottom right, #f9f9f9, #ffffff)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ 
            m: 1, 
            bgcolor: deepPurple[500],
            width: 60,
            height: 60
          }}>
            <LockOutlined sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ 
            mt: 2,
            fontWeight: 'bold',
            background: `linear-gradient(to right, ${deepPurple[700]}, #5e35b1)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please enter your credentials to continue
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Link 
                component={RouterLink}
                to="/forgot-password"
                variant="body2" 
                sx={{ color: deepPurple[600] }}
              >
                Forgot Password?
              </Link>
            </Box>
            
            {authError && (
              <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                {authError}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: deepPurple[700],
                '&:hover': {
                  bgcolor: deepPurple[800],
                }
              }}
              endIcon={!isSubmitting && <ArrowForward />}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>OR</Divider>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Button 
                  onClick={() => navigate('/register')}
                  startIcon={<PersonAdd />}
                  sx={{ color: deepPurple[600] }}
                  disabled={isSubmitting}
                >
                  Create New Account
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 