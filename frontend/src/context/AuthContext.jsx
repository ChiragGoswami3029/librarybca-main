import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getProfile } from '../services/authApi';

const AuthContext = createContext();

function normalizeProfile(profileData) {
  return {
    ...profileData,
    is_admin: Boolean(profileData?.is_admin),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('academicshare_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('academicshare_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Helper to persist auth data
  const handleAuthSuccess = (newToken, name, id = null) => {
    localStorage.setItem('academicshare_token', newToken);
    const userInfo = { name, id };
    localStorage.setItem('academicshare_user', JSON.stringify(userInfo));
    setToken(newToken);
    setUser(userInfo);
  };

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('academicshare_token');
    localStorage.removeItem('academicshare_user');
    setToken(null);
    setUser(null);
  }, []);

  // Fetch /profile to sync user info (id, name, email, created_at) when token is present
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setIsLoadingProfile(true);
    try {
      const profileData = await getProfile();
      if (profileData) {
        const normalizedProfile = normalizeProfile(profileData);
        setUser(normalizedProfile);
        localStorage.setItem('academicshare_user', JSON.stringify(normalizedProfile));
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token, logout]);

  // Sync profile on mount if token exists
  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsAuthReady(true));
    } else {
      setIsAuthReady(true);
    }
  }, [token, refreshProfile]);

  // Listen for global 401 unauthorized events dispatched by API client
  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };

    window.addEventListener('academicshare:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('academicshare:unauthorized', onUnauthorized);
    };
  }, [logout]);

  // Login action
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res && res.token) {
      handleAuthSuccess(res.token, res.name);
      // Fetch full profile immediately
      try {
        const prof = await getProfile();
        if (prof) {
          const normalizedProfile = normalizeProfile(prof);
          setUser(normalizedProfile);
          localStorage.setItem('academicshare_user', JSON.stringify(normalizedProfile));
        }
      } catch {
        // Fallback with name from login
      }
      return res;
    }
    throw new Error('Invalid login response from server');
  };

  // Register action
  const signup = async (name, email, password) => {
    return registerUser({ name, email, password });
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAuthReady,
        isLoadingProfile,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
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
