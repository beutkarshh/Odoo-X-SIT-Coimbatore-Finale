import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import PillNav from '../PillNav.jsx';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  User,
} from 'lucide-react';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
];

const internalNavItems = [
  { label: 'Dashboard', path: '/internal/dashboard', icon: LayoutDashboard },
  { label: 'Subscriptions', path: '/internal/subscriptions', icon: Users },
  { label: 'Invoices', path: '/internal/invoices', icon: FileText },
];

const portalNavItems = [
  { label: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/portal/products', icon: Package },
  { label: 'Subscriptions', path: '/portal/subscriptions', icon: Users },
  { label: 'Invoices', path: '/portal/invoices', icon: FileText },
  { label: 'Profile', path: '/portal/profile', icon: User },
];

export function Layout({ children, type = 'admin' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const getNavItems = () => {
    switch (type) {
      case 'internal':
        return internalNavItems;
      case 'portal':
        return portalNavItems;
      default:
        return adminNavItems;
    }
  };

  const getLogoutPath = () => {
    switch (type) {
      case 'internal':
        return '/internal/login';
      case 'portal':
        return '/login';
      default:
        return '/admin/login';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'internal':
        return { main: 'SubsManager', sub: 'Internal' };
      case 'portal':
        return { main: 'SubsManager', sub: 'Portal' };
      default:
        return { main: 'SubsManager', sub: 'Admin' };
    }
  };

  const handleLogout = () => {
    logout();
    navigate(getLogoutPath());
  };

  return (
    <div className="min-h-screen w-full bg-muted/30">
      <PillNav
        logo="/logo.svg"
        logoAlt="SubsManager"
        items={getNavItems()}
        title={getTitle()}
        onLogout={handleLogout}
        baseColor="#714B67"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#714B67"
        initialLoadAnimation={false}
      />
      <main className="pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-6">{children}</div>
      </main>
    </div>
  );
}
