"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import BlogEditor from "@/components/editor/BlogEditor";
import { Blog } from "@/types/blog.types";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/hearder";
import BlogInteractionBar from "@/components/shared/BlogInteractionBar";
import { useAuth } from "@/context/AuthContext";
import FollowUserButton from "@/components/shared/FollowUserButton";

export default function BlogDetailPage() {
  const params = useParams();
  const slugParam = params.slug as string;
  const { user } = useAuth(); // Check auth status

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        let slugToQuery = slugParam;
        console.log("slugToQuery", slugToQuery);
        const response = await axiosInstance.get(
          `${API_PATH.BLOG.GET_BY_SLUG}/${slugToQuery}`,
        );

        const data = response.data;
        console.log("data", data);
        const mappedBlog: Blog = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content:
            typeof data.content === "string"
              ? (() => {
                  try {
                    return JSON.parse(data.content);
                  } catch (e) {
                    return data.content;
                  }
                })()
              : data.content,
          coverImage: data.coverImage,
          author: {
            id: data.user.id,
            name: data.user.name,
            username: data.user.username,
            avatar: data.user.avatar,
          },
          tags: data.tags || [],
          publishedAt: data.publishedAt,
          readTime: data.readTime || 5,
          views: data.viewCount || 0,
          isPublished: data.status === "PUBLISHED",
          isDraft: data.status === "DRAFT",
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
        };

        setBlog(mappedBlog);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    if (slugParam) {
      fetchBlog();
    }
  }, [slugParam]);

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

  const BlogContent = () => (
    <>
      <div className="mb-8 md:mb-12 text-left">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
          {blog.title}
        </h1>

        {/* Author & Meta */}
        <div className="flex items-center justify-start gap-6 text-gray-600 text-sm md:text-base">
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
            <FollowUserButton authorId={blog.author.id} />
          </div>

          <span className="flex items-center gap-1 text-gray-500">
            {blog.readTime} min read
          </span>
          <span>·</span>
          <span className="text-gray-500">
            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Interaction Bar */}
      <BlogInteractionBar blog={blog} />

      {/* Cover Image */}
      {blog.coverImage && blog.coverImage.trim() !== "" && (
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
        <BlogEditor
          initialContent={blog.content}
          isReadOnly={true}
          coverImage={blog.coverImage || null}
        />
      </div>
    </>
  );

  // Authenticated Layout
  if (user) {
    return (
      <div className="max-w-none">
        <div className="mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <BlogContent />
        </div>
      </div>
    );
  }

  // Guest Layout (Centered, No Sidebar)
  return (
    <div className="min-h-screen bg-white">
      <Header isCollapsed={isJoined} onToggleCollapse={() => {}} />
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 mt-16">
        <BlogContent />
      </main>
    </div>
  );
}
