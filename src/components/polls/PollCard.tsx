'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types';
import { format } from 'date-fns';
import { Calendar, Users, BarChart3, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string) => void;
  onViewResults?: (pollId: string) => void;
  showActions?: boolean;
}

export default function PollCard({ 
  poll, 
  onVote, 
  onViewResults, 
  showActions = true 
}: PollCardProps) {
  const router = useRouter();

  const getStatusColor = (published: boolean) => {
    return published 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const canVote = poll.isPublished && !poll.userVote;

  const handleViewPoll = () => {
    router.push(`/polls/${poll.id}`);
  };

  const handleVote = () => {
    if (onVote) {
      onVote(poll.id);
    } else {
      router.push(`/polls/${poll.id}`);
    }
  };

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults(poll.id);
    } else {
      router.push(`/polls/${poll.id}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {poll.question}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {poll.isPublished ? 'Published' : 'Draft'} • Created {format(new Date(poll.createdAt), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getStatusColor(poll.isPublished)}`}>
            {poll.isPublished ? 'PUBLISHED' : 'DRAFT'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Poll Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Created {format(new Date(poll.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>{poll.options.length} options</span>
            </div>
          </div>

          {/* Poll Options Preview */}
          <div className="space-y-2">
            {poll.options.slice(0, 3).map((option) => (
              <div key={option.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate flex-1">
                  {option.text}
                </span>
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs text-gray-500">
                    {option.voteCount} votes
                  </span>
                  {poll.totalVotes > 0 && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(option.voteCount / poll.totalVotes) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {poll.options.length > 3 && (
              <p className="text-xs text-gray-500">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPoll}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              {canVote && (
                <Button
                  size="sm"
                  onClick={handleVote}
                  className="flex-1"
                >
                  Vote Now
                </Button>
              )}
              
              {poll.isPublished && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewResults}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Results
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
