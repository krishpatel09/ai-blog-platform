"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import BlogEditor from "@/components/editor/BlogEditor";
import { Blog } from "@/types/blog.types";
import { Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BloganeNavbar } from "@/components/blogane/BloganeNavbar";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // Using GET_BY_SLUG as base path + /slug
        const response = await axiosInstance.get(
          `${API_PATH.BLOG.GET_BY_SLUG}/${slug}`,
        );

        // Transform backend data to Blog type
        const data = response.data;
        const mappedBlog: Blog = {
          id: data.id,
          title: data.title,
          excerpt: data.excerpt || "", // Backend might not have excerpt
          content: data.content,
          coverImage: data.coverImage,
          author: {
            id: data.user.id,
            name: data.user.name,
            username: data.user.username,
            avatar: data.user.avatar,
          },
          tags: data.tags.map((t: any) => t.tag),
          publishedAt: data.publishedAt,
          readTime: 5, // Placeholder or calculate
          views: 0,
          isPublished: data.status === "PUBLISHED",
          isDraft: data.status === "DRAFT",
        };

        setBlog(mappedBlog);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
        <p className="text-gray-600">
          {error || "The blog post you are looking for does not exist."}
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BloganeNavbar />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="mb-8 md:mb-12 text-center">
          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
            {blog.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center justify-center gap-6 text-gray-600 text-sm md:text-base">
            <div className="flex items-center gap-2">
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-bold text-gray-500">
                    {blog.author.name?.[0]}
                  </span>
                </div>
              )}
              <span className="font-medium text-gray-900">
                {blog.author.name}
              </span>
            </div>
            <span>·</span>
            <span>
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {blog.readTime} min read
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-sm">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
          <BlogEditor initialContent={blog.content} isReadOnly={true} />
        </div>
      </main>
    </div>
  );
}
