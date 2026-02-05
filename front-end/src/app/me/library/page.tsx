"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Blog } from "@/types/blog.types";
import {
  Bookmark,
  Clock,
  Trash2,
  Highlighter,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import bookmarkService, { BookmarkList } from "@/services/bookmark.service";
import highlightService, { Highlight } from "@/services/highlight.service";
import { CommentService, Comment } from "@/services/comment.service";
import LibraryLists from "@/components/my-library/LibraryLists";
import RecentlyRead from "@/components/my-library/RecentlyRead";
import { MessageSquare } from "lucide-react";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<
    | "your-lists"
    | "saved-lists"
    | "highlights"
    | "reading-history"
    | "responses"
  >("your-lists");
  const [listName, setListName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Data states
  const [savedList, setSavedList] = useState<BookmarkList | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [responses, setResponses] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logic
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "saved-lists") {
        setIsLoading(true);
        try {
          // Assuming "Reading List" is the default saved list
          const lists = await bookmarkService.getLists();
          const readingList = lists.find((l) => l.name === "Reading List");
          setSavedList(readingList || null);
        } catch (error) {
          console.error("Failed to fetch saved list:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (activeTab === "highlights") {
        setIsLoading(true);
        try {
          const data = await highlightService.getAll();
          setHighlights(data);
        } catch (error) {
          console.error("Failed to fetch highlights:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (activeTab === "responses") {
        setIsLoading(true);
        try {
          const data = await CommentService.getMyResponses();
          setResponses(data);
        } catch (error) {
          console.error("Failed to fetch responses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab]);

  const handleCreateList = async () => {
    if (!listName.trim()) return;

    try {
      setIsCreating(true);
      await bookmarkService.createList(listName, isPrivate);
      window.dispatchEvent(new Event("bookmark-list-updated"));
      setListName("");
      setIsPrivate(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSavedItem = async (postId: string) => {
    if (!savedList) return;
    try {
      await bookmarkService.removeItem(savedList.id, postId);
      // Optimistic update
      setSavedList({
        ...savedList,
        items: savedList.items.filter((item) => item.postId !== postId),
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      await highlightService.delete(id);
      setHighlights(highlights.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          Your library
        </h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-5 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
              New list
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-white">
            <div className="p-10 flex flex-col items-center text-center">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold">
                  Create new list
                </DialogTitle>
              </DialogHeader>

              <div className="w-full space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Give it a name"
                    className="w-full bg-gray-50 border-b border-gray-300 px-3 py-2 outline-none focus:border-gray-900 transition-colors placeholder:text-gray-500"
                    value={listName}
                    onChange={(e) => setListName(e.target.value.slice(0, 50))}
                  />
                  <div className="absolute right-2 top-2 text-xs text-gray-500">
                    {listName.length}/50
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor="private"
                    className="text-sm text-gray-700 select-none cursor-pointer"
                  >
                    Make it private
                  </label>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-white font-medium transition-all ${
                      listName && !isCreating
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-200 cursor-not-allowed"
                    }`}
                    disabled={!listName || isCreating}
                    onClick={handleCreateList}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Tabs */}
      <div className="flex flex-col">
        <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {[
            { id: "your-lists", label: "Your lists" },
            { id: "saved-lists", label: "Saved lists" },
            { id: "highlights", label: "Highlights" },
            { id: "reading-history", label: "Reading history" },
            { id: "responses", label: "Responses" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${
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
        <div className="mt-8">
          {activeTab === "your-lists" ? (
            <LibraryLists />
          ) : activeTab === "saved-lists" ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : savedList && savedList.items.length > 0 ? (
                savedList.items.map((item) => (
                  <div
                    key={item.post?.id || item.postId}
                    className="flex gap-6 p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    {/* Image */}
                    {item.post?.coverImage && (
                      <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                        <Image
                          src={item.post.coverImage}
                          alt={item.post.slug}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/blog/${item.post?.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 hover:text-black line-clamp-2">
                            {item.post?.slug.replace(/-/g, " ")}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {/* Add more post details if available in item.post */}
                        </div>

                        <button
                          onClick={() => handleDeleteSavedItem(item.postId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No saved stories yet
                  </h3>
                  <p className="text-gray-600">
                    Start saving stories to read them later
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "highlights" ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : highlights.length > 0 ? (
                highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      From{" "}
                      <Link
                        href={`/@${highlight.post.user.username}/${highlight.post.slug}`}
                        className="text-gray-900 hover:underline"
                      >
                        {highlight.post.title}
                      </Link>{" "}
                      by{" "}
                      <Link
                        href={`/@${highlight.post.user.username}`}
                        className="text-gray-900 hover:underline"
                      >
                        {highlight.post.user.name}
                      </Link>
                    </div>

                    <div className="mb-4">
                      <span className="bg-[#e7fcc9] text-gray-900 text-lg leading-relaxed px-1 py-0.5 rounded">
                        {highlight.content}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        {/* Placeholder for future actions like 'Add Note' */}
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleDeleteHighlight(highlight.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Highlighter
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No highlights yet
                  </h3>
                  <p className="text-gray-600">
                    Highlight text in stories to save them here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              {activeTab === "reading-history" && <RecentlyRead />}
              {activeTab === "responses" && (
                <div className="space-y-4 text-left">
                  {isLoading ? (
                    <div className="flex justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    </div>
                  ) : responses.length > 0 ? (
                    responses.map((response) => (
                      <div
                        key={response.id}
                        className="py-6 border-b border-gray-200 last:border-0"
                      >
                        <Link
                          href={`/${(response as any).post.user.username}/${(response as any).post.slug}`} // Assuming comment service returns post with user
                          className="block group"
                        >
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-600 mb-1">
                            {(response as any).post.title}
                          </h3>
                        </Link>

                        <div className="mb-2">
                          <p className="text-gray-600 font-serif leading-relaxed line-clamp-3">
                            {response.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>
                            {new Date(response.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <MessageSquare
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No responses yet
                      </h3>
                      <p className="text-gray-600">
                        Join the discussion on stories you read
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
