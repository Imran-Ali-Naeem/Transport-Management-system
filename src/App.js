import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentRegister from './pages/auth/StudentRegister';
import StudentLayout from './pages/student/StudentLayout';
import StudentBookings from './pages/student/bookings/StudentBookings';
import BusSchedule from './pages/student/BusSchedule';
import LiveTracking from './pages/student/LiveTracking';
import Complaints from './pages/student/Complaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBuses from './pages/admin/ManageBuses';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageUsers from './pages/admin/ManageUsers';
import BookingSettings from './pages/admin/BookingSettings';
import DriverDashboard from './pages/driver/DriverDashboard';
import NotFound from './pages/shared/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Root component to handle base path redirect
const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  const validRoles = ['admin', 'student', 'driver'];
  const role = user?.role?.toLowerCase();
  
  if (!role || !validRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/${role}`} replace />;
};

// Public route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return children;
};

// App Routes component to prevent circular dependency with useAuth
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <StudentRegister />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<ManageBuses />} />
          <Route path="buses" element={<ManageBuses />} />
          <Route path="schedules" element={<ManageSchedules />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<BookingSettings />} />
        </Route>
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentBookings />} />
          <Route path="bookings" element={<StudentBookings />} />
          <Route path="schedule" element={<BusSchedule />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="complaints" element={<Complaints />} />
        </Route>
      </Route>

      {/* Protected Driver Routes */}
      <Route element={<ProtectedRoute requiredRole="driver" />}>
        <Route path="/driver" element={<DriverDashboard />} />
      </Route>

      {/* Root Route - Redirect based on auth status */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 