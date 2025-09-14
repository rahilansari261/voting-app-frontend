import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { pollKeys } from './usePolls';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Listen for poll updates
    socket.on('poll-updated', (data) => {
      console.log('Poll updated:', data);
      
      // Invalidate poll queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: pollKeys.all });
      
      // Update specific poll in cache if we have the data
      if (data.pollId && data.results) {
        queryClient.setQueryData(pollKeys.detail(data.pollId), (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              options: data.results.options,
              totalVotes: data.results.totalVotes,
            };
          }
          return oldData;
        });
      }
    });

    // Listen for new votes
    socket.on('vote-cast', (data) => {
      console.log('New vote cast:', data);
      
      // Invalidate poll queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: pollKeys.all });
    });

    // Listen for errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [queryClient]);

  const joinPoll = (pollId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-poll', { pollId });
    }
  };

  const leavePoll = (pollId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-poll', { pollId });
    }
  };

  return {
    joinPoll,
    leavePoll,
    isConnected: socketRef.current?.connected || false,
  };
}
