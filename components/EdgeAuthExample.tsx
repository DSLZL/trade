import { useState } from 'react';
import { useEdgeAuth } from '../hooks/useEdgeAuth';

export function EdgeAuthExample() {
  const { isAuthenticated, user, isLoading, login, logout } = useEdgeAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <span>欢迎, {user?.username}</span>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">
          登出
        </button>
      </div>
    );
  }

  return (
    <button onClick={login} className="px-4 py-2 bg-blue-500 text-white rounded">
      使用 Linux.do 登录
    </button>
  );
}