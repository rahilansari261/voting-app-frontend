import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Poll } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection status listeners
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
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
  }, []);

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

  const onPollUpdate = useCallback((callback: (pollData: Poll) => void) => {
    if (socketRef.current) {
      socketRef.current.on('poll-updated', callback);
    }
  }, []);

  // const onVoteCast = useCallback((callback: (voteData: any) => void) => {
  //   if (socketRef.current) {
  //     socketRef.current.on('vote-cast', callback);
  //   }
  // }, []);

  const removePollUpdateListener = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('poll-updated');
    }
  }, []);

  // const removeVoteCastListener = useCallback(() => {
  //   if (socketRef.current) {
  //     socketRef.current.off('vote-cast');
  //   }
  // }, []);

  return {
    joinPoll,
    leavePoll,
    onPollUpdate,
    // onVoteCast,
    removePollUpdateListener,
    // removeVoteCastListener,
    isConnected,
  };
}
