'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    requireAuth = true,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const [isChecking, setIsChecking] = useState(true);
    const { isAuthenticated } = useUserStore();
    const router = useRouter();

    useEffect(() => {
      const checkAuth = () => {
        if (requireAuth && !isAuthenticated) {
          // Get current path for redirect
          const currentPath = window.location.pathname;
          const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
          router.push(redirectUrl);
          return;
        }
        
        if (!requireAuth && isAuthenticated) {
          // User is authenticated but shouldn't be on this page
          router.push('/dashboard');
          return;
        }
        
        setIsChecking(false);
      };

      checkAuth();
    }, [isAuthenticated, router, requireAuth, redirectTo]);

    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
