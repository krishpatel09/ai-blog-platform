"use client";

import { useState } from "react";
import {
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  PlayCircle,
  Heart,
  Link as LinkIcon,
  Send,
} from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CommentsSidebar } from "@/components/shared/CommentsSidebar";
import BookmarkService from "@/services/bookmark.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BlogInteractionBarProps {
  blog: any;
}

export default function BlogInteractionBar({ blog }: BlogInteractionBarProps) {
  const [likes, setLikes] = useState(blog.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Bookmark State
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [bookmarkLists, setBookmarkLists] = useState<any[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);

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

  /* Bookmark Logic */
  const fetchBookmarkLists = async () => {
    setIsLoadingBookmarks(true);
    try {
      const lists = await BookmarkService.getLists();
      setBookmarkLists(lists);
    } catch (error) {
      console.error("Failed to fetch bookmark lists", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleBookmarkOpenChange = (open: boolean) => {
    if (open) {
      if (!user) {
        router.push("/sign-in");
        return;
      }
      if (bookmarkLists.length === 0) {
        fetchBookmarkLists();
      }
    }
    setIsBookmarkOpen(open);
  };

  const toggleBookmarkItem = async (listId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await BookmarkService.removeItem(listId, blog.id);
        toast.success("Removed from list");
      } else {
        await BookmarkService.addItem(listId, blog.id);
        toast.success("Saved to list");
      }

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
      const newList = await BookmarkService.createList(newListName);
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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleShareFriend = () => {
    toast("Sharing coming soon!", { icon: "🚀" });
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
          <DropdownMenu
            open={isBookmarkOpen}
            onOpenChange={handleBookmarkOpenChange}
          >
            <DropdownMenuTrigger asChild>
              <button className="hover:text-gray-800 transition-colors">
                <Bookmark size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-2 bg-white rounded-lg shadow-xl border border-gray-100/50"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoadingBookmarks ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {bookmarkLists.map((list) => {
                    const isBookmarked = list.items?.some(
                      (item: any) => item.postId === blog.id,
                    );
                    return (
                      <div
                        key={list.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmarkItem(list.id, isBookmarked);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isBookmarked || false}
                          readOnly
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                        />
                        <span className="text-sm text-gray-700 flex-1 truncate">
                          {list.name}
                        </span>
                      </div>
                    );
                  })}

                  <DropdownMenuSeparator className="my-1 border-t border-gray-100" />

                  {showCreateInput ? (
                    <div className="p-2 space-y-2">
                      <input
                        type="text"
                        placeholder="List Name"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-black transition-colors"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateList();
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="w-full text-xs h-8 bg-black hover:bg-gray-800 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateList();
                          }}
                          disabled={isCreatingList || !newListName.trim()}
                        >
                          {isCreatingList ? "Creating..." : "Create"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-auto text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateInput(false);
                            setNewListName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center text-sm p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateInput(true);
                      }}
                    >
                      <span className="mr-2 text-lg">+</span> Create new list
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:text-gray-800 transition-colors">
                <Share2 size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white p-1">
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="cursor-pointer"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShareFriend}
                className="cursor-pointer"
              >
                <Send className="mr-2 h-4 w-4" />
                <span>Share to friend</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
