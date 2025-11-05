


import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { User } from '../types';
import { exchangeCodeForToken, fetchUserInfo } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'crypto-sim-user';
const ACCESS_TOKEN_KEY = 'crypto-sim-access-token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async () => {
    try {
      // 调用我们的后端来获取安全的授权 URL
      const response = await fetch('/api/auth/login');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "无法获取登录 URL。");
      }

      // 重定向到从服务器获取的 URL
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("登录失败:", error);
      alert("登录过程中发生错误。请检查服务器日志并重试。");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    // Redirect to home page to clear any state
    window.location.href = '/';
  }, []);
  
  const handleAuthCallback = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      console.error("Authorization code not found in callback URL.");
      alert("Authentication failed: Authorization code not found.");
      window.location.href = '/';
      return;
    }

    try {
      // Step 1: Exchange authorization code for an access token
      const tokenData = await exchangeCodeForToken(code);
      const accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error("Access token not found in the response.");
      }
      
      // Store the access token securely (localStorage for this demo)
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      // Step 2: Use the access token to fetch user information
      const userInfo = await fetchUserInfo(accessToken);

      // Step 3: Create user object and update state
      const authenticatedUser: User = {
        name: userInfo.name,
        avatarUrl: userInfo.picture,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));

    } catch (error) {
      console.error("Authentication failed during token exchange or user info fetch:", error);
      alert("An error occurred during login. Please try again.");
      localStorage.removeItem(ACCESS_TOKEN_KEY); // Clean up on failure
    } finally {
      setIsLoading(false);
      // Redirect back to the main application, cleaning the URL
      window.location.href = '/';
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    handleAuthCallback
  }), [user, isLoading, login, logout, handleAuthCallback]);

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};