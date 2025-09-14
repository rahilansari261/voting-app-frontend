export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'voter';
  isVerified?: boolean;
  createdAt: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  published: boolean;
  allowMultiple?: boolean;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  totalVotes: number;
  userVote?: string;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface Vote {
  id: string;
  userId: string;
  pollOptionId: string;
  createdAt: string;
}

export interface CreatePollData {
  question: string;
  description?: string;
  options: { text: string }[];
  allowMultiple?: boolean;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  published: boolean;
}

export interface PollResults {
  pollId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface UserVote {
  hasVoted: boolean;
  vote?: Vote;
}

// Updated to match actual API response structure
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
