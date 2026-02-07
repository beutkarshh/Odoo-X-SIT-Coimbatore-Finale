import { createContext, useContext, useState, useCallback } from 'react';
import { getAllUsers, getPendingInternalRequests } from '../data/mockData.js';
import { Role, InternalRequestStatus } from '../data/constants.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    // Check if this is a pending internal user request
    const pendingRequests = getPendingInternalRequests();
    const pendingRequest = pendingRequests.find(
      r => r.email.toLowerCase() === email.toLowerCase() && r.status === InternalRequestStatus.PENDING
    );
    
    if (pendingRequest) {
      // Return special status for pending internal user
      return { success: false, isPending: true };
    }

    // Check all users (including approved internal users)
    const allUsers = getAllUsers();
    const foundUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, isPending: false };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
export const isCustomer = (user) => user?.role === Role.CUSTOMER;
