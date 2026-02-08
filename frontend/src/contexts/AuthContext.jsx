import { createContext, useContext, useState, useCallback } from 'react';
import authService from '../lib/services/authService.js';
import { Role } from '../data/constants.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      // If localStorage is corrupted, clear it to avoid blank screen on load.
      localStorage.removeItem('currentUser');
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    
    if (result.success) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    
    return { success: false, message: result.message, isPending: false };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const isAdmin = (user) => user?.role === Role.ADMIN;
export const isInternal = (user) => user?.role === Role.INTERNAL;
export const isPortal = (user) => user?.role === Role.PORTAL;
