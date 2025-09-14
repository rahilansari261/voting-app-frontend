'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PollCard from '@/components/polls/PollCard';
import { BarChart3, Plus } from 'lucide-react';
import { usePolls } from '@/hooks/usePolls';
import { useProfile } from '@/hooks/useAuth';

export default function PollsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const { data: polls, isLoading, isError, error } = usePolls({ page, limit, published: true });
  const { data: user } = useProfile();
  const isAuthenticated = !!user;

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
          <h1 className="text-3xl font-bold text-gray-900">All Polls</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <Card className="text-center p-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No polls available</CardTitle>
              <CardDescription className="mb-6">
                There are no polls to display at the moment.
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
