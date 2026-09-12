import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getDeviceId } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);
  const [deviceWarning, setDeviceWarning] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (err) {
          console.error('Session validation error:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();

    // Listen for single-device mismatch event (Feature 26)
    const handleDeviceMismatch = (e) => {
      setDeviceWarning(e.detail);
      logout();
    };

    window.addEventListener('skillswap:device_mismatch', handleDeviceMismatch);
    return () => window.removeEventListener('skillswap:device_mismatch', handleDeviceMismatch);
  }, [token]);

  const login = async (email, password) => {
    const deviceId = getDeviceId();
    const data = await api.post('/auth/login', { email, password, deviceId });
    localStorage.setItem('skillswap_token', data.token);
    setToken(data.token);
    setUser(data);
    setDeviceWarning(null);
    return data;
  };

  const register = async (formData) => {
    const deviceId = getDeviceId();
    const data = await api.post('/auth/register', { ...formData, deviceId });
    localStorage.setItem('skillswap_token', data.token);
    setToken(data.token);
    setUser(data);
    setDeviceWarning(null);
    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('skillswap_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    setUser(prev => ({ ...prev, ...res.user }));
    return res;
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const fresh = await api.get('/auth/me');
        setUser(fresh);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      deviceWarning,
      clearDeviceWarning: () => setDeviceWarning(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
