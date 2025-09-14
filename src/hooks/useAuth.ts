import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { LoginCredentials, RegisterData, User } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Query Keys
export const authKeys = {
  profile: ['userProfile'] as const,
};

// Fetch user profile
export const useProfile = () => {
  return useQuery<User | null, Error>({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      
      try {
        // For now, we'll decode the token to get user info
        // In a real app, you'd have a /users/me endpoint
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;
        
        const response = await apiService.getProfile(userId);
        if (!response.success) {
          localStorage.removeItem('token');
          return null;
        }
        return response.data;
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    },
    staleTime: 1000 * 60 * 15, // Profile data can be stale for 15 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour (renamed from cacheTime)
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<
    { user: User; token: string },
    Error,
    LoginCredentials
  >({
    mutationFn: async (credentials) => {
      const response = await apiService.login(credentials);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      if (!response.data?.token) {
        throw new Error('No token received from server');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed.');
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<
    { user: User; token: string },
    Error,
    RegisterData
  >({
    mutationFn: async (data) => {
      const response = await apiService.register(data);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      if (!response.data?.token) {
        throw new Error('No token received from server');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed.');
    },
  });
};

// Logout function
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(authKeys.profile, null);
    queryClient.removeQueries({ queryKey: authKeys.profile });
    toast.info('Logged out successfully.');
    router.push('/');
  };
};
