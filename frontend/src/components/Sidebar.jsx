import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { cn } from '../lib/utils.js';
import { ThemeToggle } from './ThemeToggle.jsx';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  FileText,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Percent,
} from 'lucide-react';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Discounts', path: '/admin/discounts', icon: Percent },
  { label: 'Users', path: '/admin/users', icon: Users },
];

const internalNavItems = [
  { label: 'Dashboard', path: '/internal/dashboard', icon: LayoutDashboard },
  { label: 'Subscriptions', path: '/internal/subscriptions', icon: Users },
  { label: 'Invoices', path: '/internal/invoices', icon: FileText },
];

const portalNavItems = [
  { label: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/portal/products', icon: Package },
  { label: 'My Subscriptions', path: '/portal/subscriptions', icon: Users },
  { label: 'My Invoices', path: '/portal/invoices', icon: FileText },
  { label: 'Profile', path: '/portal/profile', icon: User },
];

export function Sidebar({ type = 'admin' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        return { main: 'SubsManager', sub: null };
    }
  };

  const handleLogout = () => {
    logout();
    navigate(getLogoutPath());
  };

  const navItems = getNavItems();
  const title = getTitle();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="SubsManager" className="w-8 h-8" />
            <div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                {title.main}
              </span>
              {title.sub && (
                <span className="ml-2 text-xs text-sidebar-muted">{title.sub}</span>
              )}
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <img src="/logo.svg" alt="SubsManager" className="w-8 h-8" />
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('sidebar-nav-item', isActive && 'active')}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {sidebarOpen && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
          </div>
        )}
        <div className="mb-2">
          {sidebarOpen ? (
            <ThemeToggle variant="sidebar" />
          ) : (
            <div className="flex justify-center">
              <ThemeToggle variant="sidebar" />
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full justify-center"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
