import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginCredentials, RegisterData, CreatePollData, Poll, Vote, PollResults, UserVote, User } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4007/api',
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async getHealth(): Promise<ApiResponse<{ status: string }>> {
    const response: AxiosResponse<ApiResponse<{ status: string }>> = await this.api.get('/health');
    return response.data;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/users/login', credentials);
    console.log(response.data);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> =
      await this.api.post('/users', data);
    return response.data;
  }

  async getProfile(id: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  // Poll endpoints
  async getPolls(page: number = 1, limit: number = 10, published?: boolean): Promise<ApiResponse<Poll[]>> {
    const params = { page, limit, ...(published !== undefined && { published }) };
    const response: AxiosResponse<ApiResponse<Poll[]>> = await this.api.get('/polls', { params });
    return response.data;
  }

  async getPoll(id: string): Promise<ApiResponse<Poll>> {
    const response: AxiosResponse<ApiResponse<Poll>> = await this.api.get(`/polls/${id}`);
    return response.data;
  }

  async createPoll(data: CreatePollData): Promise<ApiResponse<Poll>> {
    const response: AxiosResponse<ApiResponse<Poll>> = await this.api.post('/polls', data);
    return response.data;
  }

  async updatePoll(id: string, data: Partial<CreatePollData>): Promise<ApiResponse<Poll>> {
    const response: AxiosResponse<ApiResponse<Poll>> = await this.api.put(`/polls/${id}`, data);
    return response.data;
  }

  async deletePoll(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/polls/${id}`);
    return response.data;
  }

  // Voting endpoints
  async vote(pollOptionId: string): Promise<ApiResponse<Vote>> {
    const response: AxiosResponse<ApiResponse<Vote>> = await this.api.post('/votes', {
      pollOptionId
    });
    return response.data;
  }

  async getPollResults(pollId: string): Promise<ApiResponse<PollResults>> {
    const response: AxiosResponse<ApiResponse<PollResults>> = await this.api.get(`/votes/poll/${pollId}/results`);
    return response.data;
  }

  async getUserVote(pollId: string): Promise<ApiResponse<UserVote>> {
    const response: AxiosResponse<ApiResponse<UserVote>> = await this.api.get(`/votes/poll/${pollId}/user`);
    return response.data;
  }
}

export const apiService = new ApiService();
