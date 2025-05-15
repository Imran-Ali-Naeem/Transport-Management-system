import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clear auth state
  const clearAuth = (reason = '') => {
    console.log('Clearing auth state. Reason:', reason);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  // Set auth state
  const setAuth = (token, userData) => {
    console.log('Setting auth state:', { token: token?.slice(0, 10), userData });
    if (!token || !userData) {
      console.error('Invalid auth data provided:', { token: !!token, userData: !!userData });
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Verify token and get user data
  const verifyToken = async (token) => {
    console.log('Verifying token:', token?.slice(0, 10));
    if (!token) {
      console.log('No token provided for verification');
      return null;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      console.log('Token verification response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    
      console.warn('Invalid response format from /auth/me:', response.data);
      return null;
    } catch (err) {
      console.error('Token verification failed:', {
        status: err.response?.status,
        error: err.response?.data?.error || err.message
      });
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('Stored auth state:', {
          hasToken: !!token,
          hasStoredUser: !!storedUser,
          tokenPreview: token?.slice(0, 10)
        });

        if (!token || !storedUser) {
          console.log('No stored credentials found');
          clearAuth('No token or stored user found');
          setLoading(false);
          return;
        }

        // First set the stored user data to prevent flicker
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Set up authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token in background
        console.log('Verifying token with backend...');
        const userData = await verifyToken(token);
        
        if (userData) {
          console.log('Token verified successfully:', userData);
          // Update user data if it has changed
          if (JSON.stringify(userData) !== JSON.stringify(parsedUser)) {
            setAuth(token, userData);
          }
        } else {
          console.log('Token verification failed, clearing auth state');
          clearAuth('Token verification failed');
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        clearAuth('Initialization error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting login for:', email);
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', {
        success: res.data?.success,
        hasToken: !!res.data?.token,
        hasUserData: !!res.data?.id
      });
      
      if (!res.data?.success || !res.data?.token || !res.data?.id) {
        throw new Error('Invalid response from server');
      }

      const userData = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role.toLowerCase()
      };

      setAuth(res.data.token, userData);
      return userData.role;
    } catch (err) {
      console.error('Login error:', {
        status: err.response?.status,
        error: err.response?.data?.error || err.message
      });
      setError(err.response?.data?.error || 'Login failed');
      clearAuth('Login error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth('User logout');
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 