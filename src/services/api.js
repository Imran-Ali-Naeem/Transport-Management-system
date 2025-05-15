import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or the request was for refreshing token, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If token expired and this is not a retry
    if (error.response?.data?.error === 'Token expired' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.get('/auth/me');
        
        if (response.data?.success) {
          // If successful, update token and retry original request
          return api(originalRequest);
        } else {
          // If refresh failed, clear auth and redirect
          clearAuthAndRedirect();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh request fails, clear auth and redirect
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors, clear auth and redirect
    if (error.response?.status === 401) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  }
);

// Helper function to clear auth and handle redirect
const clearAuthAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];

  const currentPath = window.location.pathname;
  const isAuthRoute = currentPath.includes('/login') || 
                     currentPath.includes('/register') ||
                     currentPath === '/';
  
  if (!isAuthRoute) {
    console.log('Redirecting to login page');
    window.location.href = '/login';
  }
};

// Initialize token from localStorage if exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api; 