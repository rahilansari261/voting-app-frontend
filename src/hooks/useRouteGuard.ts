'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

interface UseRouteGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function useRouteGuard(options: UseRouteGuardOptions = {}) {
  const { requireAuth = true, redirectTo = '/login' } = options;
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Check localStorage for authentication data
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const hasAuthData = !!(token && user);

      if (requireAuth && !hasAuthData) {
        // Need authentication but don't have it
        const currentPath = pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectUrl);
        return;
      }

      if (!requireAuth && hasAuthData) {
        // Have authentication but shouldn't be on this page (e.g., login/register)
        router.push('/dashboard');
        return;
      }

      setIsChecking(false);
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname, router, requireAuth, redirectTo]);

  return {
    isChecking,
    isAuthenticated: isAuthenticated || !!(localStorage.getItem('token') && localStorage.getItem('user')),
  };
}
