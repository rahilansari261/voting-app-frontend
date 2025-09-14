# TanStack Query Integration with Backend API

This project uses TanStack Query (React Query) for data fetching and state management, integrated with the Voting App Backend API.

## Backend API Integration

The frontend is configured to work with the backend running on `http://localhost:3000` with the following API structure:

### Base Configuration
- **API Base URL**: `http://localhost:3000/api`
- **WebSocket URL**: `http://localhost:3000`
- **Authentication**: JWT Bearer tokens

### API Endpoints Used

#### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user by ID

#### Polls
- `GET /api/polls` - Get all polls (with pagination)
- `GET /api/polls/:id` - Get specific poll with results
- `POST /api/polls` - Create new poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll

#### Voting
- `POST /api/votes` - Submit vote
- `GET /api/votes/poll/:id/results` - Get poll results
- `GET /api/votes/poll/:id/user` - Get user's vote for a poll

#### Health Check
- `GET /api/health` - Health check endpoint

## Features

- **Automatic caching** - Data is cached and shared across components
- **Background refetching** - Data stays fresh with automatic background updates
- **Optimistic updates** - UI updates immediately for better UX
- **Error handling** - Built-in retry logic and error states
- **Loading states** - Automatic loading indicators
- **Real-time updates** - WebSocket integration for live poll updates
- **DevTools** - Built-in debugging tools (available in development)

## Available Hooks

### Polls
- `usePolls(page, limit, published)` - Fetch polls with pagination
- `usePoll(id)` - Fetch a specific poll
- `usePollResults(id)` - Fetch poll results
- `useUserVote(id)` - Get user's vote for a poll
- `useCreatePoll()` - Create a new poll
- `useUpdatePoll()` - Update an existing poll
- `useDeletePoll()` - Delete a poll
- `useVote()` - Vote on a poll

### Authentication
- `useUser(id)` - Get user by ID
- `useLogin()` - Login user
- `useRegister()` - Register user
- `useLogout()` - Logout user

### System
- `useHealthCheck()` - Check backend health status
- `useWebSocket()` - WebSocket connection for real-time updates

## Usage Examples

### Basic Poll Fetching
```tsx
import { usePolls } from '@/hooks/usePolls';

function PollsList() {
  const { data: polls, isLoading, error } = usePolls(1, 10, true);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {polls?.map(poll => (
        <div key={poll.id}>{poll.question}</div>
      ))}
    </div>
  );
}
```

### Voting with Real-time Updates
```tsx
import { usePoll, useVote, useUserVote } from '@/hooks/usePolls';
import { useWebSocket } from '@/hooks/useWebSocket';

function PollDetail({ pollId }) {
  const { data: poll } = usePoll(pollId);
  const { data: userVote } = useUserVote(pollId);
  const voteMutation = useVote();
  const { joinPoll, leavePoll } = useWebSocket();

  useEffect(() => {
    joinPoll(pollId);
    return () => leavePoll(pollId);
  }, [pollId]);

  const handleVote = async (pollOptionId) => {
    await voteMutation.mutateAsync(pollOptionId);
  };

  return (
    <div>
      <h2>{poll?.question}</h2>
      {poll?.options.map(option => (
        <button key={option.id} onClick={() => handleVote(option.id)}>
          {option.text} ({option.voteCount} votes)
        </button>
      ))}
    </div>
  );
}
```

### Authentication
```tsx
import { useLogin, useRegister } from '@/hooks/useAuth';

function AuthForm() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLogin = async (credentials) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      // Token is automatically stored in localStorage
      console.log('Logged in:', result.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
}
```

## Data Types

The frontend uses TypeScript interfaces that match the backend API:

```typescript
interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  published: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalVotes: number;
  userVote?: string;
}

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage?: number;
}

interface Vote {
  id: string;
  userId: string;
  pollOptionId: string;
  createdAt: string;
}
```

## WebSocket Integration

Real-time updates are handled through WebSocket connections:

### Events
- `join-poll` - Join a poll room for updates
- `leave-poll` - Leave a poll room
- `poll-updated` - Receive poll result updates
- `vote-cast` - Receive new vote notifications

### Usage
```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function PollComponent({ pollId }) {
  const { joinPoll, leavePoll, isConnected } = useWebSocket();

  useEffect(() => {
    joinPoll(pollId);
    return () => leavePoll(pollId);
  }, [pollId]);

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Poll content */}
    </div>
  );
}
```

## Cache Management

- **Automatic invalidation** - Related queries are automatically invalidated when data changes
- **Optimistic updates** - UI updates immediately, then syncs with server
- **Background refetching** - Data is refetched when it becomes stale
- **Real-time updates** - WebSocket events trigger cache updates

## Error Handling

The API service includes automatic error handling:
- **401 Unauthorized** - Automatically redirects to login
- **Retry logic** - Smart retry for network errors
- **Error boundaries** - Graceful error display in components

## Development Tools

In development mode, you can access:
- **TanStack Query DevTools** - Query status, cache inspection, performance metrics
- **WebSocket status** - Real-time connection indicator
- **Console logging** - WebSocket events and API calls

## Environment Configuration

Configure the backend URLs in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Backend Requirements

The frontend expects the backend to be running with:
- **Port**: 3000
- **CORS**: Enabled for cross-origin requests
- **WebSocket**: Socket.IO server running
- **JWT**: Token-based authentication
- **API Structure**: As documented in the API endpoints

## Migration Notes

This integration replaces the previous Zustand-based approach with:
- Better caching and performance
- Real-time updates via WebSocket
- Improved error handling
- Automatic background refetching
- Better developer experience with DevTools
