"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ArrowLeft, Users, CheckCircle, BarChart3, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { PollOption } from "@/types";
import { useAuth } from "@/hooks/useAuth";
// import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function PollDetailPage() {
  // const { isChecking } = useRouteGuard({ requireAuth: false });
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const pollId = params.id as string;
  const {
    data: poll,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => axiosInstance.get(`/polls/${pollId}`).then((res) => res.data.data),
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WebSocket connection for real-time updates
  const { joinPoll, leavePoll, isConnected } = useWebSocket();

  // Check if user has already voted
  useEffect(() => {
    if (poll) {
      setHasVoted(!!poll.userVote);
      if (poll.userVote) {
        setSelectedOptions([poll.userVote]);
      }
    }
  }, [poll]);

  // Join/leave poll room for real-time updates
  useEffect(() => {
    if (pollId) {
      joinPoll(pollId);
      
      return () => {
        leavePoll(pollId);
      };
    }
  }, [pollId, joinPoll, leavePoll]);

  const voteMutation = useMutation({
    mutationFn: async (optionIds: string[]) => {
      const response = await axiosInstance.post(`/votes`, {
        optionIds,
      });
      return response.data;
    },
    onSuccess: () => {
      setHasVoted(true);
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Vote failed:", error);
    },
  });

  const handleOptionSelect = (optionId: string) => {
    if (!isAuthenticated) return;
    if (hasVoted) return;

    if (poll?.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || hasVoted) return;

    setIsSubmitting(true);
    try {
      await voteMutation.mutateAsync(selectedOptions);
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (isChecking) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-2 text-gray-600">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Poll not found or error loading poll</p>
          <Button asChild>
            <Link href="/polls">Back to Polls</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPollActive = poll.isPublished && (!poll.endDate || new Date(poll.endDate) > new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/polls">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Polls
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
              {poll.description && (
                <p className="text-gray-600 mt-2">{poll.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-500">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Poll Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {poll.allowMultiple ? "Multiple choice" : "Single choice"}
              </span>
            </div>
            {poll.endDate && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Ends {new Date(poll.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Voting Interface */}
        {isPollActive && !hasVoted ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                {isAuthenticated 
                  ? (poll.allowMultiple
                      ? "Select one or more options"
                      : "Select one option")
                  : "Please login to vote in this poll"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {poll.options.map((option: PollOption) => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !isAuthenticated 
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : selectedOptions.includes(option.id)
                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                  }`}
                  onClick={() => isAuthenticated && handleOptionSelect(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {poll.allowMultiple ? (
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => isAuthenticated && handleOptionSelect(option.id)}
                        disabled={!isAuthenticated}
                        className="h-4 w-4 text-blue-600 disabled:opacity-50"
                      />
                    ) : (
                      <input
                        type="radio"
                        name="poll-option"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => isAuthenticated && handleOptionSelect(option.id)}
                        disabled={!isAuthenticated}
                        className="h-4 w-4 text-blue-600 disabled:opacity-50"
                      />
                    )}
                  </div>
                </div>
              ))}

              {isAuthenticated ? (
                <Button
                  onClick={handleVote}
                  disabled={selectedOptions.length === 0 || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Vote"}
                </Button>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-gray-600">
                    You need to be logged in to cast your vote
                  </p>
                  <div className="space-x-3">
                    <Button asChild>
                      <Link href={`/login?redirect=/polls/${pollId}`}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/register?redirect=/polls/${pollId}`}>
                        Register
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : hasVoted ? (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vote Submitted!
              </h3>
              <p className="text-gray-600">
                Thank you for participating in this poll.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                This poll is not currently active or has ended.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Results</CardTitle>
            <CardDescription>
              {hasVoted || !isPollActive
                ? "Live results"
                : "Results will be shown after you vote"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {poll.options.map((option: PollOption) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-gray-600">
                    {option.voteCount} votes ({option.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
