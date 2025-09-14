import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const response = await apiService.getHealth();
      return response;
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: false, // Don't retry health checks aggressively
  });
};
