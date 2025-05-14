import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Start with loading true
  const [error, setError] = useState('');

  // Initialize from localStorage
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        // Set the user immediately from localStorage
        setUser(JSON.parse(storedUser));
        
        try {
          // Verify token in background
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Token verification failed:', err);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('2. AuthContext login function called with:', {
        email,
        passwordLength: password.length
      });

      console.log('3. Making API call to /auth/login');
      const res = await api.post('/auth/login', { email, password });
      console.log('3a. API Response:', {
        status: res.status,
        data: res.data
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        ...res.data,
        role: res.data.role
      }));
      setUser({
        ...res.data,
        role: res.data.role
      });
      setError('');
      return res.data.role;
    } catch (err) {
      console.error('3b. API Error Details:', {
        message: err.message,
        response: {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        },
        request: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      setError(err.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {!loading ? children : null}
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