"use client";

import { useEffect, useState } from "react";
import bookmarkService, { BookmarkList } from "@/services/bookmark.service";
import LibraryListCard from "./LibraryListCard";
import { Loader2 } from "lucide-react";

export default function LibraryLists() {
  const [lists, setLists] = useState<BookmarkList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const data = await bookmarkService.getLists();
      console.log("Fetched lists:", data);
      setLists(data);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();

    // Listen to custom event for list updates (e.g., when a new list is created)
    const handleListUpdate = () => {
      fetchLists();
    };

    window.addEventListener("bookmark-list-updated", handleListUpdate);

    return () => {
      window.removeEventListener("bookmark-list-updated", handleListUpdate);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No lists yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create a list to start organizing your favorite stories.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {lists.map((list) => (
        <LibraryListCard key={list.id} list={list} />
      ))}
    </div>
  );
}
