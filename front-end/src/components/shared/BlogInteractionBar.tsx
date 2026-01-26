"use client";

import { useState } from "react";
import {
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  PlayCircle,
  Heart,
} from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CommentsSidebar } from "@/components/shared/CommentsSidebar";

interface BlogInteractionBarProps {
  blog: any;
}

export default function BlogInteractionBar({ blog }: BlogInteractionBarProps) {
  const [likes, setLikes] = useState(blog.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleAuthAction = (action: () => void) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    action();
  };

  const handleLike = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Optimistic update
    setLikes((prev: number) => prev + 1);
    setIsLiked(true);

    try {
      // Ensure we use the correct API prefix
      await axiosInstance.patch(`/api/blog/${blog.id}/like`);
    } catch (error) {
      console.error("Failed to like:", error);
      toast.error("Failed to like post");
      setLikes((prev: number) => prev - 1);
      setIsLiked(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-y border-gray-100 py-3 my-8">
        {/* Left Side: Likes & Comments */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLike}
          >
            <span className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
              <Heart
                size={20}
                className={isLiked ? "fill-red-500 text-red-500" : ""}
              />
              <span className="text-sm font-medium">{likes}</span>
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-gray-200"></div>

          {/* Comments */}
          <div
            className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
            onClick={() => handleAuthAction(() => setIsCommentsOpen(true))}
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">
              {blog.commentCount || 0}
            </span>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-5 text-gray-400">
          <button
            className="hover:text-gray-800 transition-colors"
            onClick={() =>
              handleAuthAction(() => {
                // Future bookmark logic here
                console.log("Bookmark post");
                toast("Bookmarking coming soon!", { icon: "🔖" });
              })
            }
          >
            <Bookmark size={20} />
          </button>
          <button className="hover:text-gray-800 transition-colors">
            <PlayCircle size={20} />
          </button>
          <button className="hover:text-gray-800 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="hover:text-gray-800 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <CommentsSidebar
        blogId={blog.id}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        commentCount={blog.commentCount || 0}
      />
    </>
  );
}
