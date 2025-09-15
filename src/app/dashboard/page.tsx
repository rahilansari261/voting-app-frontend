"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PollCard from "@/components/polls/PollCard";
import { Plus, BarChart3, Users, Clock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Poll } from "@/types";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";

export default function DashboardPage() {
  const { isChecking } = useRouteGuard({ requireAuth: true });
  const { user } = useUserStore();
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    data: polls = [], 
    isLoading: pollsLoading, 
    error, 
    refetch,
    isError 
  } = useQuery({
    queryKey: ["polls", retryCount],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/polls");
        return response.data.data || response.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching polls:", err);
        throw new Error(err.response?.data?.message || "Failed to fetch polls");
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 30000, // 30 seconds
  });

  // Separate polls by user's polls vs all polls
  console.log("polls", polls);
  const userPolls = polls?.data?.filter((p: Poll) => p.createdBy === user?.id) || [];
  const recentPolls = polls?.data?.slice(0, 5) || [];
  const publishedPolls = polls?.data?.filter((p: Poll) => p.published) || [];
  const draftPolls = polls?.data?.filter((p: Poll) => !p.published) || [];
  const userPublishedPolls = userPolls?.filter((p: Poll) => p.published) || [];
  const userDraftPolls = userPolls?.filter((p: Poll) => !p.published) || [];

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const isNetworkError = error?.message?.includes('Network Error') || 
                         error?.code === 'ERR_NETWORK' ||
                         error?.response?.status >= 500;

  const isAuthError = error?.response?.status === 401;

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (pollsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isError && !isNetworkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error?.message || "An error occurred while loading your data."}</p>
          <div className="space-x-2">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isNetworkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your internet connection or try again later.
          </p>
          <div className="space-x-2">
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" asChild>
              <Link href="/polls/create">Create Poll Offline</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your polls</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Polls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userPolls.length}</div>
              <p className="text-xs text-muted-foreground">
                {userPublishedPolls.length} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {polls?.data?.reduce((sum: number, poll: Poll) => sum + (poll.totalVotes || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all polls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {publishedPolls.filter((p: Poll) => 
                  !p.endDate || new Date(p.endDate) > new Date()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Drafts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userDraftPolls.length}</div>
              <p className="text-xs text-muted-foreground">Unpublished polls</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Poll
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/polls">
                <BarChart3 className="h-4 w-4 mr-2" />
                View All Polls
              </Link>
            </Button>
            {userPolls.length > 0 && (
              <Button variant="outline" asChild>
                <Link href="/polls?filter=my-polls">
                  <Users className="h-4 w-4 mr-2" />
                  My Polls
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Recent Polls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Polls</h2>
            <div className="space-y-4">
              {recentPolls.length > 0 ? (
                recentPolls.map((poll: Poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No polls found</p>
                    <Button asChild className="mt-2">
                      <Link href="/polls/create">Create your first poll</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Poll Status</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    My Published Polls
                    <Badge variant="secondary">{userPublishedPolls.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your polls that are live and accepting votes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    My Draft Polls
                    <Badge variant="outline">{userDraftPolls.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your polls that are not yet published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    All Published Polls
                    <Badge variant="secondary">{publishedPolls.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All polls that are live across the platform
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
