import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Role } from '../data/constants.js';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect all unauthenticated users to unified login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === Role.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === Role.INTERNAL) {
      return <Navigate to="/internal/dashboard" replace />;
    }
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;
}
