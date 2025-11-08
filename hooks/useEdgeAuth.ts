// 使用 Vercel Edge Functions 的 OAuth Hook
import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, TokenResponse, UserInfoResponse } from '../services/edgeAuthApi';

export function useEdgeAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // 发送消息给弹窗
  const postMessageToPopup = (message: any) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.postMessage(message, '*');
    }
  };

  // 监听来自弹窗的消息
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'oauth_success') {
        const tokenData = event.data.data as TokenResponse;

        // 保存认证信息到 localStorage
        localStorage.setItem('access_token', tokenData.access_token);
        localStorage.setItem('token_expires_at',
          String(Date.now() + tokenData.expires_in * 1000));

        setIsAuthenticated(true);
        setIsLoading(false);

        // 关闭弹窗
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }

        // 获取用户信息
        fetchUserInfo(tokenData.access_token);
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  // 获取用户信息
  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_INFO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // 开始 OAuth 流程
  const login = async () => {
    setIsLoading(true);

    try {
      // 获取授权 URL
      const response = await fetch(API_ENDPOINTS.AUTHORIZE);
      const { authUrl } = await response.json();

      // 打开弹窗
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      popupRef.current = window.open(
        authUrl,
        'oauth_login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // 检查现有认证状态
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    const savedUser = localStorage.getItem('user');

    if (token && expiresAt && Date.now() < Number(expiresAt)) {
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else if (expiresAt && Date.now() >= Number(expiresAt)) {
      // Token 已过期
      logout();
    }
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}