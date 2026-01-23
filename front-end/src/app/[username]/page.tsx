"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/hearder";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Blog } from "@/types/blog.types";
import {
  Edit,
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  Bookmark,
  Lock as LockIcon,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock user data - in real app, fetch based on username
const getUserData = (username: string) => ({
  name: "krish sangani",
  username: username,
  bio: "Full-stack developer passionate about web technologies, UI/UX design, and sharing knowledge through writing.",
  avatar: "",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  joinedDate: "January 2024",
  followers: 1234,
  following: 567,
});

// Mock user's posts
const userPosts: Blog[] = [
  {
    id: "1",
    title: "My Journey into Web Development",
    excerpt:
      "How I transitioned from a different career into web development and what I learned along the way.",
    coverImage: "https://picsum.photos/seed/30/400/300",
    slug: "my-journey-into-web-development",
    author: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "",
    },
    tags: [{ id: "1", name: "Career", slug: "career" }],
    publishedAt: "2026-01-10",
    readTime: 7,
    views: 542,
    isPublished: true,
    isDraft: false,
  },
  {
    id: "2",
    title: "Understanding React Server Components",
    excerpt:
      "A deep dive into how React Server Components work and why they are a game changer for web performance.",
    coverImage: "https://picsum.photos/seed/31/400/300",
    slug: "understanding-react-server-components",
    author: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "",
    },
    tags: [{ id: "2", name: "React", slug: "react" }],
    publishedAt: "2026-01-12",
    readTime: 10,
    views: 120,
    isPublished: true,
    isDraft: false,
  },
];

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const user = getUserData(username);
  const [activeTab, setActiveTab] = useState<"home" | "lists" | "about">(
    "home",
  );
  const { user: authUser } = useAuth();

  const content = (
    <div className="flex justify-center max-w-[1000px] mx-auto">
      {/* Left Column - Main Content */}
      <div className="flex-1 min-w-0 pr-12 flex flex-col">
        {/* Header Name */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            {user.name}
          </h1>
          <button className="text-gray-500 hover:text-gray-900">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
          {[
            { id: "home", label: "Home" },
            { id: "lists", label: "Lists" },
            { id: "about", label: "About" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "home" && (
            <div className="space-y-10">
              {userPosts.map((post) => (
                <Link
                  href={`/@${user.username}/${post.slug}-${post.id}`}
                  key={post.id}
                  className="group cursor-pointer block"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:underline decoration-2 underline-offset-4 decoration-gray-900 leading-tight">
                        {post.title}
                      </h3>
                      <div className="relative">
                        <p className="text-gray-600 mb-4 text-md line-clamp-3 leading-relaxed font-serif">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {post.readTime} min read
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                          <button className="hover:text-gray-900 transition-colors">
                            <Bookmark size={20} />
                          </button>
                          <button className="hover:text-gray-900 transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {post.coverImage && (
                      <div className="w-40 h-28 shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-gray-100 mt-10" />
                </Link>
              ))}
            </div>
          )}
          {activeTab === "lists" && (
            <div className="py-10 text-center text-gray-500">
              No public lists yet.
            </div>
          )}
          {activeTab === "about" && (
            <div className="py-4">
              <p className="text-gray-700 leading-relaxed font-serif text-lg">
                {user.bio}
              </p>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {user.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  Joined {user.joinedDate}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Line Separator */}
      <div className="hidden lg:block w-px bg-gray-200 shrink-0 mx-6 h-[calc(100vh-8rem)] sticky top-32" />

      {/* Right Column - Sidebar */}
      <div className="hidden lg:block w-[300px] shrink-0 pl-6 relative">
        <div className="sticky top-32 flex flex-col gap-6">
          {/* Avatar */}
          {user.avatar ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-pink-700 flex items-center justify-center text-white text-4xl font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name & Edit */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {user.name}
            </h2>
            <Link
              href="/settings"
              className="text-green-600 text-sm hover:text-green-700 font-medium"
            >
              Edit profile
            </Link>
          </div>

          {/* Lists Preview */}
          <div className="mt-4">
            <h3 className="font-bold text-gray-900 mb-4">Lists</h3>
            <div className="cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative">
                  {/* Mock List Image */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 opacity-80">
                    <div className="bg-gray-300"></div>
                    <div className="bg-gray-400"></div>
                    <div className="bg-gray-500"></div>
                    <div className="bg-gray-600"></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:underline">
                    I like it
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>1 story</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400"></span>
                    <span className="flex items-center gap-1">
                      <LockIcon size={10} />
                      Private
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-green-600 text-sm hover:text-green-700 mt-6 font-medium">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (authUser) {
    return (
      <DashboardLayout
        showRightSidebar={false}
        contentClassName="max-w-[1000px]"
      >
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isCollapsed={false} onToggleCollapse={() => {}} />
      <div className="flex w-full max-w-[1500px] mx-auto pt-24">
        <main className="grow min-w-0 pb-10">
          <div className="max-w-[1000px] mx-auto">{content}</div>
        </main>
      </div>
    </div>
  );
}
