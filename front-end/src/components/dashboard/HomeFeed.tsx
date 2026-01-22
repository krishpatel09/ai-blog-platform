"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import BlogCard from "../shared/BlogCard";
import { Blog } from "@/types/blog.types";
import BlogService from "@/services/blog.service";

export default function HomeFeed() {
  const [activeTab, setActiveTab] = useState<"foryou" | "featured">("foryou");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const data = await BlogService.getLiveBlogs();
        setBlogs(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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
          {isLoading ? (
            // Simple loading skeleton
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : (
            blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
