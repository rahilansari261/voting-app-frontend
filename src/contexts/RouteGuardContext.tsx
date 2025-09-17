'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

interface RouteGuardContextType {
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
}

const RouteGuardContext = createContext<RouteGuardContextType>({
  isCheckingAuth: true,
  isAuthenticated: false,
});

export const useRouteGuard = () => useContext(RouteGuardContext);

interface RouteGuardProviderProps {
  children: React.ReactNode;
}

export function RouteGuardProvider({ children }: RouteGuardProviderProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/polls/create'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Define dynamic protected routes (like /polls/[id])
  const isDynamicProtectedRoute = false; // Allow access to polls/[id] routes
  
  // Define auth routes (login/register)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        console.log("RouteGuard: User not authenticated, pathname:", pathname, "isProtected:", isProtectedRoute, "isDynamicProtected:", isDynamicProtectedRoute);
        // No authentication data
        if (isProtectedRoute || isDynamicProtectedRoute) {
          // Redirect to login with current path as redirect
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        console.log("RouteGuard: User authenticated, pathname:", pathname, "isAuthRoute:", isAuthRoute);
      } else if (isAuthRoute) {
        // User is authenticated but trying to access auth pages
        router.push('/dashboard');
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated, pathname, router, isProtectedRoute, isDynamicProtectedRoute, isAuthRoute]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuardContext.Provider value={{ isCheckingAuth, isAuthenticated }}>
      {children}
    </RouteGuardContext.Provider>
  );
}
