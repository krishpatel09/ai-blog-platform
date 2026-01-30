"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Blog } from "@/types/blog.types";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import StoriesService, { StoryStats } from "@/services/stories.service";
import { useAuth } from "@/context/AuthContext";

export default function StoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("drafts");
  const [allStories, setAllStories] = useState<any[]>([]); // Store all fetched stories
  const [displayedStories, setDisplayedStories] = useState<any[]>([]); // Store filtered stories
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch All Data on Mount
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, storiesResponse] = await Promise.all([
          StoriesService.getStats(),
          StoriesService.getStories("", 1, 100), // Fetch all (limit 100 for now)
        ]);
        setStats(statsData);
        setAllStories(storiesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Client-Side Filtering
  useEffect(() => {
    if (!allStories.length) {
      setDisplayedStories([]);
      return;
    }

    const now = new Date();
    const filtered = allStories.filter((story) => {
      const status = story.status;
      const pubDate = story.publishedAt ? new Date(story.publishedAt) : null;

      switch (activeTab) {
        case "drafts":
          return status === "DRAFT";
        case "published":
          return status === "PUBLISHED" && (!pubDate || pubDate <= now);
        case "scheduled":
          return (
            status === "SCHEDULED" ||
            (status === "PUBLISHED" && pubDate && pubDate > now)
          );
        default:
          return true;
      }
    });
    setDisplayedStories(filtered);
  }, [activeTab, allStories]);

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10 pt-4">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          Stories
        </h1>
        <div className="flex gap-4">
          <Link href="/import">
            <Button
              variant="outline"
              className="rounded-full border-black text-black hover:bg-gray-50 px-6"
            >
              Import a story
            </Button>
          </Link>
          <Link href="/new-blog">
            <Button className="rounded-full bg-green-700 hover:bg-green-800 px-6 text-white hidden">
              Write Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
        {[
          { id: "drafts", label: `Drafts ${stats?.drafts || ""}` },
          { id: "scheduled", label: `Scheduled ${stats?.scheduled || ""}` },
          { id: "published", label: `Published ${stats?.published || ""}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? 'text-black font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="space-y-0">
        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : displayedStories.length > 0 ? (
          displayedStories.map((story) => (
            <StoryItem key={story.id} story={story} />
          ))
        ) : (
          <div className="py-10 text-gray-500 text-sm">No stories found.</div>
        )}
      </div>
    </div>
  );
}

function StoryItem({ story }: { story: any }) {
  // Safe accessor for optional fields
  const isDraft = story.status === "DRAFT";
  const dateStr = story.publishedAt || story.updatedAt;
  const dateFormatted = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="group py-5 border-b border-gray-100 last:border-0 flex items-start justify-between">
      <Link
        href={`/new-blog?id=${story.id}`}
        className="flex items-start gap-4 max-w-[70%] w-full"
      >
        <div className="w-14 h-10 bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 overflow-hidden rounded-sm">
          {story.coverImage ? (
            <Image
              src={story.coverImage}
              alt=""
              width={56}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:underline">
            {story.title || "Untitled Story"}
          </h3>
          <p className="text-xs text-gray-500">
            {isDraft
              ? "Draft"
              : story.status === "SCHEDULED"
                ? "Scheduled"
                : "Published"}{" "}
            · {story.readTime || 1} min read · {dateFormatted}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 relative">
        <button className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
