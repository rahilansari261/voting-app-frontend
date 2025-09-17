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
  isPublished: boolean;
  allowMultiple?: boolean;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
  };
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
  id?: string;
  question: string;
  description?: string;
  options: { text: string }[];
  allowMultiple?: boolean;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
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

// Dashboard stats interfaces
export interface MyPollsStats {
  total: number;
  published: number;
  drafts: number;
}

export interface DashboardStats {
  myPolls: MyPollsStats;
  totalVotes: number;
  activePolls: number;
  recentPolls: Poll[];
  allPublishedPolls: number;
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
