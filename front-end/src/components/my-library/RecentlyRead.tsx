"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Trash2, Bookmark } from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import { Blog } from "@/types/blog.types";
import BlogCard from "@/components/shared/BlogCard";

interface ReadingHistoryItem {
  progress: number;
  viewCount: number;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    excerpt: string;
    readTime: number;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    user: {
      name: string;
      username: string;
      avatar: string;
    };
  };
}

export default function RecentlyRead() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATH.HISTORY.GET_ALL);
      setHistory(response.data.data);
    } catch (error) {
      console.error("Failed to fetch reading history", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      setClearing(true);
      await axiosInstance.delete(API_PATH.HISTORY.DELETE);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history", error);
    } finally {
      setClearing(false);
    }
  };

  const removeHistoryItem = async (postId: string) => {
    try {
      await axiosInstance.delete(`${API_PATH.HISTORY.DELETE}/${postId}`);
      setHistory((prev) => prev.filter((item) => item.post.id !== postId));
    } catch (error) {
      console.error("Failed to remove history item", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No reading history
        </h3>
        <p className="text-gray-600">Stories you read will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={clearHistory}
          disabled={clearing}
          className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {clearing ? "Clearing..." : "Clear History"}
        </button>
      </div>
      {history.map((item) => {
        // Map history item to Blog type
        const blogData: Blog = {
          id: item.post.id,
          title: item.post.title,
          slug: item.post.slug,
          excerpt: item.post.excerpt,
          coverImage: item.post.coverImage,
          author: {
            id: "", // Not available in history item, but required by type. Hopefully not used for linking if username is present?
            // Actually BlogCard uses author.username and author.name and author.avatar.
            // history item has user with name, username, avatar.
            name: item.post.user.name,
            username: item.post.user.username,
            avatar: item.post.user.avatar,
          },
          tags: [], // Not available
          publishedAt: item.post.createdAt,
          readTime: item.post.readTime,
          isPublished: true, // Assumed
          isDraft: false,
          views: item.viewCount,
          likeCount: item.post.likeCount,
          commentCount: item.post.commentCount,
        };

        return (
          <BlogCard
            key={item.post.id}
            blog={blogData}
            onRemove={() => removeHistoryItem(item.post.id)}
          />
        );
      })}
    </div>
  );
}
