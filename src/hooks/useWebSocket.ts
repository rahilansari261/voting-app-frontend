import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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

    // Listen for poll updates
    socket.on('poll-updated', (data) => {
      console.log('Poll updated:', data);
      // You can add custom logic here to update local state
      // or trigger a page refresh if needed
    });

    // Listen for new votes
    socket.on('vote-cast', (data) => {
      console.log('New vote cast:', data);
      // You can add custom logic here to update local state
      // or trigger a page refresh if needed
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

  return {
    joinPoll,
    leavePoll,
    isConnected,
  };
}
