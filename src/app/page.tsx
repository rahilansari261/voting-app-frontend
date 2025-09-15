'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PollCard from '@/components/polls/PollCard';
import { BarChart3, Users, Shield, Clock, Plus, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Poll } from '@/types';


export default function HomePage() {
  const { data: user, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => axiosInstance.get("/users/me").then((res) => res.data.data),
  });
  const isAuthenticated = !!user;
  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: () => axiosInstance.get("/polls").then((res) => res.data.data),
  });

  const recentPolls = polls || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Modern Voting Made Simple
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Create, participate, and manage polls with our intuitive platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Link href="/polls/create">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Poll
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Link href="/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VoteApp?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides everything you need to run successful polls and gather valuable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">Real-time Results</CardTitle>
                <CardDescription>
                  See live voting results and analytics as votes come in
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">Easy Participation</CardTitle>
                <CardDescription>
                  Simple, intuitive interface for voters to participate quickly
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">Secure & Private</CardTitle>
                <CardDescription>
                  Advanced security with optional anonymous voting
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">Flexible Timing</CardTitle>
                <CardDescription>
                  Schedule polls with custom start and end times
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Polls Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Polls
              </h2>
              <p className="text-xl text-gray-600">
                See what the community is voting on
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/polls">View All Polls</Link>
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
              {recentPolls.map((poll: Poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <CardContent>
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No polls yet</CardTitle>
                <CardDescription className="mb-6">
                  Be the first to create a poll and start engaging with the community
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Voting?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust VoteApp for their voting needs
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/register">Get Started Free</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
