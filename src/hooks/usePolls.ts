import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { CreatePollData, Poll, PollResults, UserVote } from '@/types';
import { toast } from 'sonner';

// Query Keys
export const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; published?: boolean }) =>
    [...pollKeys.lists(), { filters }] as const,
  details: () => [...pollKeys.all, 'detail'] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  results: (id: string) => [...pollKeys.all, 'results', id] as const,
  userVote: (id: string) => [...pollKeys.all, 'user-vote', id] as const,
};

// Fetch all polls
export const usePolls = (filters: { page?: number; limit?: number; published?: boolean } = {}) => {
  return useQuery({
    queryKey: pollKeys.list(filters),
    queryFn: async () => {
      const response = await apiService.getPolls(filters.page, filters.limit, filters.published);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch polls');
      }
      return response.data;
    },
  });
};

// Fetch a single poll
export const usePoll = (id: string) => {
  return useQuery<Poll, Error>({
    queryKey: pollKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getPoll(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch poll');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// Create a poll
export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation<Poll, Error, CreatePollData>({
    mutationFn: async (data) => {
      const response = await apiService.createPoll(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create poll');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      toast.success('Poll created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create poll.');
    },
  });
};

// Update a poll
export const useUpdatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation<Poll, Error, { id: string; data: Partial<CreatePollData> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.updatePoll(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update poll');
      }
      return response.data;
    },
    onSuccess: (updatedPoll) => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(updatedPoll.id) });
      toast.success('Poll updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update poll.');
    },
  });
};

// Delete a poll
export const useDeletePoll = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await apiService.deletePoll(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete poll');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      toast.success('Poll deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete poll.');
    },
  });
};

// Submit a vote
export const useVote = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (pollOptionId) => {
      const response = await apiService.vote(pollOptionId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit vote');
      }
      return response.data;
    },
    onSuccess: (data, pollOptionId) => {
      // Invalidate all poll-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: pollKeys.all });
      toast.success('Vote submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit vote.');
    },
  });
};

// Get poll results
export const usePollResults = (pollId: string) => {
  return useQuery<PollResults, Error>({
    queryKey: pollKeys.results(pollId),
    queryFn: async () => {
      const response = await apiService.getPollResults(pollId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch poll results');
      }
      return response.data;
    },
    enabled: !!pollId,
  });
};

// Get user's vote for a poll
export const useUserVote = (pollId: string) => {
  return useQuery<UserVote, Error>({
    queryKey: pollKeys.userVote(pollId),
    queryFn: async () => {
      const response = await apiService.getUserVote(pollId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user vote');
      }
      return response.data;
    },
    enabled: !!pollId,
  });
};
