"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Poll } from "@/types";
import PollCard from "./PollCard";
import PaginationControls from "../ui/pagination-controls";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

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
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const { data: pollsData, isLoading: pollsLoading } = useQuery({
    queryKey: ["polls", page, limit],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/polls?page=${page}&limit=${limit}`);
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
  
  const polls = pollsData?.data || [];
  const pagination = pollsData?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <section className="bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Polls</h2>
            <p className="text-xl text-gray-600">See what the community is voting on</p>
            {pagination && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} polls
              </p>
            )}
          </div>
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
        ) : polls.length > 0 ? (
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
              <CardTitle className="text-xl mb-2">No polls yet</CardTitle>
              <CardDescription className="mb-6">Be the first to create a poll and start engaging with the community</CardDescription>
              {true && (
                <Button asChild>
                  <Link href="/polls/create">Create Your First Poll</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
