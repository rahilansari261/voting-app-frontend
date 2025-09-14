"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PollCard from "@/components/polls/PollCard";
import { Plus, BarChart3, Users, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { usePolls } from "@/hooks/usePolls";

export default function DashboardPage() {
  const { data: polls = [], isLoading: pollsLoading, error } = usePolls({ page: 1, limit: 50, published: true });

  // For now, we'll show all polls since we don't have user authentication yet
  const recentPolls = polls && polls.length > 0 ? polls.slice(0, 6) : [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md text-center p-8">
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Error</CardTitle>
          <CardDescription className="text-gray-700">Failed to load polls: {error.message || "Unknown error"}</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to VoteApp Dashboard</h1>
          <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with polls</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls && polls.length > 0 ? polls.length : 0}</div>
              <p className="text-xs text-muted-foreground">
                {polls && polls.length > 0 ? polls.filter((p) => p.published).length : 0} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls && polls.length > 0 ? polls.reduce((sum, poll) => sum + poll.totalVotes, 0) : 0}</div>
              <p className="text-xs text-muted-foreground">Across all polls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls && polls.length > 0 ? polls.filter((p) => p.published).length : 0}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Participation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {polls.length > 0 ? Math.round(polls.reduce((sum, poll) => sum + poll.totalVotes, 0) / polls.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Votes per poll</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Poll
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/polls">View All Polls</Link>
            </Button>
          </div>
        </div>

        {/* Recent Polls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Polls</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/polls">View All</Link>
            </Button>
          </div>

          {pollsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
          ) : recentPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <CardContent>
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No polls yet</CardTitle>
                <CardDescription className="mb-6">Create your first poll to start engaging with your audience</CardDescription>
                <Button asChild>
                  <Link href="/polls/create">Create Your First Poll</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              {polls && polls.length > 0 ? (
                <div className="space-y-4">
                  {polls?.slice(0, 5).map((poll) => (
                    <div key={poll.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <Link href={`/polls/${poll.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {poll.question}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {poll.totalVotes} votes • {format(new Date(poll.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant={poll.published ? "default" : "secondary"}>{poll.published ? "ACTIVE" : "DRAFT"}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
