'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AuthProvider from '@/components/auth/AuthProvider';
import { RouteGuardProvider } from '@/contexts/RouteGuardContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouteGuardProvider>
          {children}
        </RouteGuardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
