import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredToken, setStoredToken, getStoredUser, setStoredUser, clearStoredAuth } from '../utils/auth';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync state on load
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const authUser = {
      id: data.userId,
      userId: data.userId,
      name: data.name,
      email: credentials.email,
      role: data.role ? data.role.toUpperCase() : 'USER'
    };

    setStoredToken(data.token);
    setStoredUser(authUser);
    setToken(data.token);
    setUser(authUser);
    return data;
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  };

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    const currentRole = user.role.toUpperCase();
    const targetRole = role.toUpperCase();

    if (targetRole === 'ADMIN') {
      return currentRole === 'ADMIN' || currentRole === 'ROLE_ADMIN';
    }
    if (targetRole === 'OWNER') {
      return currentRole === 'OWNER' || currentRole === 'USER' || currentRole === 'ADMIN';
    }
    if (targetRole === 'RENTER' || targetRole === 'USER') {
      return true; // Any authenticated user can rent
    }
    return currentRole === targetRole;
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
