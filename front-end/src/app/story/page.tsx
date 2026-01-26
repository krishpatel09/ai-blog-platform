"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Blog } from "@/types/blog.types";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock drafts and published stories
const drafts: Blog[] = [
  {
    id: "d1",
    title: "hello world",
    slug: "hello-world",
    excerpt: "1 min read (2 words) · Updated 1h ago", // Temporarily using excerpt for meta to match exact look easily
    author: { id: "1", name: "You", username: "you", avatar: "" },
    tags: [],
    publishedAt: "2026-01-14",
    readTime: 1,
    isPublished: false,
    isDraft: true,
  },
  {
    id: "d2",
    title:
      "How Artificial Intelligence Is Making Content Creation Easy for Everyone",
    slug: "artificial-intelligence-content-creation",
    excerpt: "1 min read (171 words) · Updated 6d ago",
    author: { id: "1", name: "You", username: "you", avatar: "" },
    tags: [],
    publishedAt: "2026-01-14",
    readTime: 1,
    isPublished: false,
    isDraft: true,
  },
];

const published: Blog[] = [
  {
    id: "p1",
    title: "My Journey into Web Development",
    slug: "my-journey-into-web-development",
    excerpt: "7 min read (1500 words) · Published 5d ago",
    coverImage: "https://picsum.photos/seed/20/400/300", // Example with image
    author: { id: "1", name: "You", username: "you", avatar: "" },
    tags: [],
    publishedAt: "2026-01-10",
    readTime: 7,
    views: 542,
    isPublished: true,
    isDraft: false,
  },
];

export default function StoryPage() {
  const [activeTab, setActiveTab] = useState("drafts");

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10 pt-4">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          Stories
        </h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-full border-black text-black hover:bg-gray-50 px-6"
          >
            Import a story
          </Button>
          <Link href="/write">
            <Button className="rounded-full bg-green-700 hover:bg-green-800 px-6 text-white hidden">
              {" "}
              {/* Hidden as per image, but kept code for ref */}
              Write Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
        {[
          { id: "drafts", label: `Drafts ${drafts.length}` },
          { id: "scheduled", label: "Scheduled" },
          { id: "published", label: `Published ${published.length}` },
          { id: "unlisted", label: "Unlisted" },
          { id: "submissions", label: "Submissions" },
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

      {/* Filters Header (Visual only mainly) */}
      {/* Only check if we have items to show headers? Image shows them. */}
      <div className="hidden md:flex items-center text-xs font-medium text-gray-500 border-b border-gray-100 pb-2 mb-4">
        {/* Using grid to align somewhat with the list items roughly */}
        <div className="w-[60%]">Latest</div>
        <div className="w-[20%]">Publication</div>
        <div className="w-[20%]">Status</div>
      </div>

      {/* List Content */}
      <div className="space-y-0">
        {activeTab === "drafts" &&
          drafts.map((story) => <StoryItem key={story.id} story={story} />)}
        {activeTab === "published" &&
          published.map((story) => <StoryItem key={story.id} story={story} />)}
        {/* Empty states for others */}
        {activeTab !== "drafts" && activeTab !== "published" && (
          <div className="py-10 text-gray-500 text-sm">No stories found.</div>
        )}
      </div>
    </div>
  );
}

function StoryItem({ story }: { story: Blog }) {
  return (
    <div className="group py-5 border-b border-gray-100 last:border-0 flex items-start justify-between">
      <div className="flex items-start gap-4 max-w-[70%]">
        {/* Placeholder/Thumbnail */}
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
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">
            {story.title}
          </h3>
          <p className="text-xs text-gray-500">{story.excerpt}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <button className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
