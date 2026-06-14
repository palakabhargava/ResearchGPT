'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (plan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on startup
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      ApiClient.request('/auth/profile')
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token expired or server down
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const upgradeSubscription = async (plan: string) => {
    try {
      const data = await ApiClient.request('/auth/subscribe', {
        method: 'POST',
        body: JSON.stringify({ plan })
      });
      setUser(data.user);
    } catch (error: any) {
      alert(`Subscription upgrade failed: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, upgradeSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
