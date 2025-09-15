'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login } = useUserStore();

  useEffect(() => {
    // Initialize user state from localStorage on app load
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        login(user, token);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [login]);

  return <>{children}</>;
}
