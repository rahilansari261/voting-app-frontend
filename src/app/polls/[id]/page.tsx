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

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;
  const {
    data: poll,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => axiosInstance.get(`/polls/${pollId}`).then((res) => res.data.data),
  });
  const { data: userVote } = useQuery({
    queryKey: ["userVote", pollId],
    queryFn: () => axiosInstance.get(`/polls/${pollId}/user-vote`).then((res) => res.data.data),
  });
  const voteMutation = useMutation({
    mutationFn: (optionId: string) => axiosInstance.post(`/polls/${pollId}/vote`, { optionId }).then((res) => res.data.data),
  });
  const { joinPoll, leavePoll, isConnected } = useWebSocket();
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    if (userVote?.hasVoted && userVote.vote) {
      setSelectedOption(userVote.vote.pollOptionId);
    }
  }, [userVote]);

  // Join poll room for real-time updates
  useEffect(() => {
    if (pollId) {
      joinPoll(pollId);
      return () => leavePoll(pollId);
    }
  }, [pollId, joinPoll, leavePoll]);

  const handleVote = async () => {
    if (!selectedOption) return;

    try {
      await voteMutation.mutateAsync(selectedOption);
      setSelectedOption("");
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Poll not found</h2>
            <p className="text-gray-600 mb-6">{error?.message || "The poll you are looking for does not exist."}</p>
            <Button asChild>
              <Link href="/polls">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Polls
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/polls">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Polls
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{poll.question}</CardTitle>
                <CardDescription className="text-base">
                  {poll.published ? "Published" : "Draft"} • Created {new Date(poll.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    Live
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Offline
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {poll.totalVotes} votes
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                {poll.options.length} options
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {poll.options.map((option: PollOption) => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === option.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {selectedOption === option.id && <CheckCircle className="h-5 w-5 text-blue-600" />}
                  </div>
                  {option.voteCount > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{option.voteCount} votes</span>
                        <span>{Math.round((option.voteCount / poll.totalVotes) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(option.voteCount / poll.totalVotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedOption && !userVote?.hasVoted && (
              <Button onClick={handleVote} disabled={voteMutation.isPending} className="w-full">
                {voteMutation.isPending ? "Voting..." : "Submit Vote"}
              </Button>
            )}

            {userVote?.hasVoted && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">You have already voted on this poll!</p>
              </div>
            )}

            {voteMutation.isError && <div className="text-red-600 text-sm text-center">{voteMutation.error?.message || "Failed to submit vote"}</div>}

            {voteMutation.isSuccess && <div className="text-green-600 text-sm text-center">Vote submitted successfully!</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
