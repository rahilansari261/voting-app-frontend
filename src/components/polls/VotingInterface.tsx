'use client';

import { useState } from 'react';
import { Poll } from '@/types';
import { useVote } from '@/hooks/usePolls';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface VotingInterfaceProps {
  poll: Poll;
  onViewResults?: () => void;
}

export default function VotingInterface({ poll, onViewResults }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string>(poll.userVote || '');
  const voteMutation = useVote();

  const canVote = poll.published && !poll.userVote;

  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selectedOption) {
      return;
    }

    try {
      await voteMutation.mutateAsync(selectedOption);
      // Success handling is done in the useVote hook
    } catch (error: any) {
      // Error handling is done in the useVote hook
      console.error('Vote failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{poll.question}</CardTitle>
        <CardDescription>
          {poll.published ? 'Published' : 'Draft'} • Created {format(new Date(poll.createdAt), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Poll Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{poll.totalVotes} votes</span>
            <span>{poll.options.length} options</span>
          </div>
        </div>

        {/* Voting Interface */}
        {canVote ? (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSubmitVote}
              disabled={!selectedOption || voteMutation.isPending}
              className="w-full"
            >
              {voteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Vote'
              )}
            </Button>
          </div>
        ) : poll.userVote ? (
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">You have voted!</h3>
            <p className="text-green-700">
              Thank you for participating in this poll.
            </p>
          </div>
        ) : !poll.published ? (
          <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Poll Not Published</h3>
            <p className="text-yellow-700">
              This poll is not yet published and cannot be voted on.
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Poll Closed</h3>
            <p className="text-gray-700">
              This poll is no longer accepting votes.
            </p>
          </div>
        )}

        {/* Results Preview */}
        {poll.totalVotes > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Results</h3>
              {onViewResults && (
                <Button variant="outline" onClick={onViewResults}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Results
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span>{option.voteCount} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(option.voteCount / poll.totalVotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
