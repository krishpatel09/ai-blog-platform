"use client";

import { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import BlogCard from "../shared/BlogCard";
import { Blog } from "@/types/blog.types";

// Mock data for demonstration
const mockBlogs: Blog[] = [
  {
    id: "1",
    title: "The Future of Web Development: What to Expect in 2026",
    excerpt:
      "Exploring the latest trends in web development, from AI-powered tools to the evolution of frameworks like Next.js and React.",
    coverImage: "https://picsum.photos/seed/1/400/300",
    author: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "",
    },
    tags: [
      { id: "1", name: "Web Dev", slug: "web-dev" },
      { id: "2", name: "Tech", slug: "tech" },
    ],
    publishedAt: "2026-01-14",
    readTime: 8,
    views: 1234,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "2",
    title: "Mastering TypeScript: Advanced Patterns and Best Practices",
    excerpt:
      "Deep dive into TypeScript's advanced features, including generics, utility types, and how to write type-safe code that scales.",
    coverImage: "https://picsum.photos/seed/2/400/300",
    author: {
      id: "2",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "",
    },
    tags: [
      { id: "3", name: "TypeScript", slug: "typescript" },
      { id: "4", name: "Programming", slug: "programming" },
    ],
    publishedAt: "2026-01-13",
    readTime: 12,
    views: 2456,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "3",
    title: "Building Scalable Applications with Next.js 16",
    excerpt:
      "Learn how to leverage Next.js 16's new features to build performant, scalable web applications with the App Router.",
    coverImage: "https://picsum.photos/seed/3/400/300",
    author: {
      id: "3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "",
    },
    tags: [
      { id: "5", name: "Next.js", slug: "nextjs" },
      { id: "6", name: "React", slug: "react" },
    ],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 3421,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "4",
    title: "Building Scalable Applications with Next.js 16",
    excerpt:
      "Learn how to leverage Next.js 16's new features to build performant, scalable web applications with the App Router.",
    coverImage: "https://picsum.photos/seed/3/400/300",
    author: {
      id: "3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "",
    },
    tags: [
      { id: "5", name: "Next.js", slug: "nextjs" },
      { id: "6", name: "React", slug: "react" },
    ],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 3421,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "5",
    title: "Building Scalable Applications with Next.js 16",
    excerpt:
      "Learn how to leverage Next.js 16's new features to build performant, scalable web applications with the App Router.",
    coverImage: "https://picsum.photos/seed/3/400/300",
    author: {
      id: "3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "",
    },
    tags: [
      { id: "5", name: "Next.js", slug: "nextjs" },
      { id: "6", name: "React", slug: "react" },
    ],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 3421,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "6",
    title: "Building Scalable Applications with Next.js 16",
    excerpt:
      "Learn how to leverage Next.js 16's new features to build performant, scalable web applications with the App Router.",
    coverImage: "https://picsum.photos/seed/3/400/300",
    author: {
      id: "3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "",
    },
    tags: [
      { id: "5", name: "Next.js", slug: "nextjs" },
      { id: "6", name: "React", slug: "react" },
    ],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 3421,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "7",
    title: "Building Scalable Applications with Next.js 16",
    excerpt:
      "Learn how to leverage Next.js 16's new features to build performant, scalable web applications with the App Router.",
    coverImage: "https://picsum.photos/seed/3/400/300",
    author: {
      id: "3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "",
    },
    tags: [
      { id: "5", name: "Next.js", slug: "nextjs" },
      { id: "6", name: "React", slug: "react" },
    ],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 3421,
    isPublished: true,
    isDraft: false,
  },
];

export default function HomeFeed() {
  const [activeTab, setActiveTab] = useState<"foryou" | "featured">("foryou");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Tabs Header */}
        <div className="flex items-center gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "foryou"
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab("featured")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "featured"
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Featured
          </button>
        </div>

        {/* Blog Cards */}
        <div className="space-y-6">
          {mockBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
