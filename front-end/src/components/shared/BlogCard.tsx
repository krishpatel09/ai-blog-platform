"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BlogCardProps } from "@/types/blog.types";
import {
  Calendar,
  ThumbsUp,
  MessageSquareText,
  Minus,
  Bookmark,
  Ellipsis,
  Flag,
  VolumeX,
  Trash2,
} from "lucide-react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import BookmarkService from "@/services/bookmark.service";

const extractTextFromContent = (content: any): string => {
  if (!content) return "";

  if (typeof content === "string") {
    if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(content);
        return extractTextFromNode(parsed);
      } catch {
        return content;
      }
    }
    return content;
  }

  return extractTextFromNode(content);
};

const extractTextFromNode = (node: any): string => {
  if (!node) return "";
  if (node.type === "text" && node.text) {
    return node.text;
  }
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child: any) => extractTextFromNode(child))
      .join(" ");
  }
  return "";
};

export default function BlogCard({ blog, onRemove }: BlogCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [bookmarkLists, setBookmarkLists] = useState<any[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const previewText =
    extractTextFromContent(blog.content) || blog.excerpt || "";

  const handleInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    handleInteraction(e);
    setIsDismissed(true);
  };

  if (isDismissed) {
    return (
      <div className="py-8 border-b border-gray-200">
        <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[200px] animate-in fade-in zoom-in-95 duration-200">
          <p className="text-gray-900 font-medium text-lg">
            Got it, we'll recommend fewer like this.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                handleInteraction(e);
                setIsDismissed(false);
              }}
              className="px-6"
            >
              Undo
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => handleInteraction(e)}
              className="px-6"
            >
              Done
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInteraction}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs"
            >
              <VolumeX size={14} className="mr-2" /> Mute this author
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInteraction}
              className="text-gray-500 hover:text-gray-900 text-xs"
            >
              <Flag size={14} className="mr-2" /> Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fetchBookmarkLists = async () => {
    setIsLoadingBookmarks(true);
    try {
      const lists = await BookmarkService.getLists();
      if (Array.isArray(lists)) {
        setBookmarkLists(lists);
      } else {
        console.error("Bookmark API returned non-array:", lists);
        setBookmarkLists([]); // Fallback
      }
    } catch (error) {
      console.error("Failed to fetch bookmark lists", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleBookmarkClick = () => {
    setIsBookmarkOpen(!isBookmarkOpen);
    if (!isBookmarkOpen) {
      fetchBookmarkLists();
    }
  };

  const toggleBookmarkItem = async (listId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await BookmarkService.removeItem(listId, blog.id);
        toast.success("Removed from list");
        setIsBookmarkOpen(false); // Close dropdown on success
      } else {
        await BookmarkService.addItem(listId, blog.id);
        toast.success("Saved to list");
        setIsBookmarkOpen(false); // Close dropdown on success
      }
      // Refresh lists to update UI (specifically isBookmarked status)
      // Optimistic update could be better, but this ensures consistency
      setBookmarkLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === listId) {
            const isItemInList = list.items.some(
              (item: any) => item.postId === blog.id,
            );
            return {
              ...list,
              items: isItemInList
                ? list.items.filter((item: any) => item.postId !== blog.id)
                : [...list.items, { postId: blog.id }],
            };
          }
          return list;
        }),
      );
    } catch (error) {
      console.error("Failed to update bookmark", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreatingList(true);
    try {
      const newList = await BookmarkService.createList(newListName, false);
      setBookmarkLists([...bookmarkLists, newList]);
      setNewListName("");
      setShowCreateInput(false);

      // Optionally add the item to the new list immediately
      await BookmarkService.addItem(newList.id, blog.id);
      toast.success(`List "${newList.name}" created and saved`);

      // Refresh to ensure everything is synced
      fetchBookmarkLists();
    } catch (error) {
      console.error("Failed to create list", error);
      toast.error("Failed to create list");
    } finally {
      setIsCreatingList(false);
    }
  };

  return (
    <div className="group border-b border-gray-200 last:border-0 pl-1">
      <div className="flex flex-col md:flex-row gap-8 py-8">
        {/* Content Section - Left */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/@${blog.author.username}`}
              className="flex items-center gap-2 group/author z-10 relative w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shadow-sm">
                {blog.author.avatar ? (
                  <Image
                    src={blog.author.avatar!}
                    alt={blog.author.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  blog.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover/author:underline">
                {blog.author.name}
              </span>
            </Link>
          </div>

          {/* Title & Excerpt - Main Link */}
          <Link
            href={`/@${blog.author.username}/${blog.slug}`}
            className="cursor-pointer block group/post"
          >
            {/* Title */}
            <h2 className="text-xl md:text-[22px] font-bold text-gray-900 group-hover/post:text-gray-600 line-clamp-2 mb-2 leading-tight tracking-tight transition-colors text-left">
              {blog.title}
            </h2>
            {/* Excerpt */}
            <p className="text-gray-600 line-clamp-2 mb-4 text-sm md:text-base leading-relaxed font-serif text-left">
              {previewText}
            </p>
          </Link>

          {/* Meta Info */}
          <div className="flex items-center justify-between mt-auto">
            {/* Left Side: Date, Likes, Comments */}
            <Link
              href={`/@${blog.author.username}/${blog.slug}`}
              className="flex items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium hover:text-gray-900 transition-colors">
                <Calendar
                  size={16}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                />
                <span>
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <ActionTooltip content={`${blog.likeCount || 0} Likes`}>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  <ThumbsUp
                    size={16}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  />
                  <span>{blog.likeCount || 0}</span>
                </div>
              </ActionTooltip>

              <ActionTooltip content={`${blog.commentCount || 0} responses`}>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  <MessageSquareText
                    size={16}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  />
                  <span>{blog.commentCount || 0}</span>
                </div>
              </ActionTooltip>
            </Link>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-2">
              {onRemove && (
                <ActionTooltip content="Remove from history">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </ActionTooltip>
              )}

              <ActionTooltip content="Save">
                <Link
                  href={`/@${blog.author.username}/${blog.slug}`}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Bookmark size={20} />
                </Link>
              </ActionTooltip>

              {/* more */}
              <DropdownMenu>
                <ActionTooltip content="More">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-transparent"
                      onClick={handleInteraction}
                    >
                      <Ellipsis size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                </ActionTooltip>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleInteraction}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <VolumeX className="mr-2 h-4 w-4" />
                    <span>Mute this author</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleInteraction}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report story</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Image Section - Right */}
        {blog.coverImage && (
          <Link
            href={`/@${blog.author.username}/${blog.slug}`}
            className="w-full md:w-40 lg:w-48 h-40 md:h-40 shrink-0 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer block"
          >
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={200}
              height={160}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        )}
      </div>
    </div>
  );
}
