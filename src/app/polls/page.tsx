'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PollCard from '@/components/polls/PollCard';
import PaginationControls from '@/components/ui/pagination-controls';
import { BarChart3, Plus } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Poll, User } from '@/types';

interface PaginatedPollsResponse {
  data: Poll[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PollsPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const isMyPolls = filter === 'my-polls';
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [user, setUser] = useState<User | null>(null);

  // Get user from localStorage instead of API call
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  const { data: pollsData, isLoading, isError, error } = useQuery({
    queryKey: ["polls", page, limit, filter],
    queryFn: async () => {
      try {
        let apiUrl = `/polls?page=${page}&limit=${limit}`;
        
        // If filtering for user's polls, add the filter parameter
        if (isMyPolls) {
          apiUrl += '&filter=my-polls';
        }
        
        const response = await axiosInstance.get(apiUrl);
        console.log('Polls response:', response.data);
        
        // Handle different response structures
        const data = response.data.data || response.data;
        
        // If the response has pagination info, return it as is
        if (data.pagination) {
          return data;
        }
        
        // If it's just an array, create pagination info
        if (Array.isArray(data)) {
          return {
            data: data,
            pagination: {
              page: 1,
              limit: data.length,
              total: data.length,
              totalPages: 1
            }
          };
        }
        
        // If it's nested, try to extract the array
        const pollsArray = data.data || data;
        if (Array.isArray(pollsArray)) {
          return {
            data: pollsArray,
            pagination: {
              page: 1,
              limit: pollsArray.length,
              total: pollsArray.length,
              totalPages: 1
            }
          };
        }
        
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0
          }
        };
      } catch (error) {
        console.error('Polls API error:', error);
        throw error;
      }
    },
  }); 

  const isAuthenticated = !!user;
  const polls = pollsData?.data || [];
  const pagination = pollsData?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md text-center p-8">
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Error</CardTitle>
          <CardDescription className="text-gray-700">
            Failed to load polls: {error?.message || 'Unknown error'}
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isMyPolls ? 'My Polls' : 'All Polls'}
            </h1>
            {pagination && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} polls
              </p>
            )}
          </div>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Poll
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : polls && polls.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {polls.map((poll: Poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <PaginationControls
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </>
        ) : (
          <Card className="text-center p-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">
                {isMyPolls ? 'No polls created yet' : 'No polls available'}
              </CardTitle>
              <CardDescription className="mb-6">
                {isMyPolls 
                  ? "You haven't created any polls yet. Create your first poll to get started!"
                  : "There are no polls to display at the moment."
                }
              </CardDescription>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/polls/create">Create Your First Poll</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
