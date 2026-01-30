"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Blog } from "@/types/blog.types";
import { Bookmark, Clock, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import bookmarkService from "@/services/bookmark.service";
import LibraryLists from "@/components/my-library/LibraryLists";

// Mock saved blogs
const savedBlogs: Blog[] = [
  {
    id: "1",
    title: "Understanding React Server Components",
    slug: "understanding-react-server-components",
    excerpt:
      "A comprehensive guide to React Server Components and how they change the way we build React applications.",
    coverImage: "https://picsum.photos/seed/10/400/300",
    author: {
      id: "1",
      name: "Sarah Wilson",
      username: "sarahw",
      avatar: "",
    },
    tags: [{ id: "1", name: "React", slug: "react" }],
    publishedAt: "2026-01-10",
    readTime: 15,
    isPublished: true,
    isDraft: false,
    coverVideo: undefined,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<
    | "your-lists"
    | "saved-lists"
    | "highlights"
    | "reading-history"
    | "responses"
  >("your-lists");
  const [showDescription, setShowDescription] = useState(false);
  const [listName, setListName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateList = async () => {
    if (!listName.trim()) return;

    try {
      setIsCreating(true);
      await bookmarkService.createList(listName);

      // Dispatch event to update lists
      window.dispatchEvent(new Event("bookmark-list-updated"));

      // Reset and close
      setListName("");
      setShowDescription(false);
      setIsPrivate(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsCreating(false);
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
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
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
                    onChange={(e) => setListName(e.target.value.slice(0, 60))}
                  />
                  <div className="absolute right-2 top-2 text-xs text-gray-500">
                    {listName.length}/60
                  </div>
                </div>

                {!showDescription ? (
                  <button
                    onClick={() => setShowDescription(true)}
                    className="text-green-600 text-sm hover:text-green-700 font-medium"
                  >
                    Add a description
                  </button>
                ) : (
                  <textarea
                    placeholder="Description"
                    className="w-full bg-gray-50 border-b border-gray-300 px-3 py-2 outline-none focus:border-gray-900 transition-colors resize-none placeholder:text-gray-500 min-h-[80px]"
                  />
                )}

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
              {savedBlogs.length > 0 ? (
                savedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex gap-6 p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    {/* Image */}
                    {blog.coverImage && (
                      <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                        <Image
                          src={blog.coverImage}
                          alt={blog.title}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/blog/${blog.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 hover:text-black line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 line-clamp-2 mt-2 text-sm">
                          {blog.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {blog.readTime} min read
                          </span>
                          <span>{blog.author.name}</span>
                        </div>

                        <button className="text-gray-400 hover:text-red-500 transition-colors">
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
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">
                {activeTab === "highlights" &&
                  "Your highlights will appear here."}
                {activeTab === "reading-history" &&
                  "Stories you have read recently."}
                {activeTab === "responses" &&
                  "Your responses to other stories."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
