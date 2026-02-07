import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { Role } from '../data/constants.js';

import Index from '../pages/Index.jsx';
import NotFound from '../pages/NotFound.jsx';

import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminProductsNew from '../pages/admin/ProductsNew.jsx';
import AdminProductPlans from '../pages/admin/ProductPlans.jsx';
import AdminPlanSubscribers from '../pages/admin/PlanSubscribers.jsx';

import InternalDashboard from '../pages/internal/Dashboard.jsx';
import InternalSubscriptions from '../pages/internal/Subscriptions.jsx';
import InternalInvoices from '../pages/internal/Invoices.jsx';

import PortalLogin from '../pages/portal/Login.jsx';
import PortalSignup from '../pages/portal/Signup.jsx';
import PortalDashboard from '../pages/portal/Dashboard.jsx';
import PortalProducts from '../pages/portal/Products.jsx';
import PortalSubscriptions from '../pages/portal/Subscriptions.jsx';
import PortalInvoices from '../pages/portal/Invoices.jsx';
import PortalProfile from '../pages/portal/Profile.jsx';

import ResetPassword from '../pages/auth/ResetPassword.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      {/* Unified Login/Signup */}
      <Route path="/login" element={<PortalLogin />} />
      <Route path="/signup" element={<PortalSignup />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Redirect old login routes to unified login */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/internal/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/reset-password" element={<Navigate to="/reset-password" replace />} />
      <Route path="/internal/reset-password" element={<Navigate to="/reset-password" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminProductsNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:productId/plans"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminProductPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:productId/plans/:planId/subscribers"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminPlanSubscribers />
          </ProtectedRoute>
        }
      />

      {/* Internal Routes */}
      <Route
        path="/internal/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.INTERNAL]}>
            <InternalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/internal/subscriptions"
        element={
          <ProtectedRoute allowedRoles={[Role.INTERNAL]}>
            <InternalSubscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/internal/invoices"
        element={
          <ProtectedRoute allowedRoles={[Role.INTERNAL]}>
            <InternalInvoices />
          </ProtectedRoute>
        }
      />

      {/* Customer Portal Routes */}
      <Route
        path="/portal/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
            <PortalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/products"
        element={
          <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
            <PortalProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/subscriptions"
        element={
          <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
            <PortalSubscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/invoices"
        element={
          <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
            <PortalInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/profile"
        element={
          <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
            <PortalProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
