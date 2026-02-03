import { useState } from "react";
import Image from "next/image";
import { BookmarkList, BookmarkItem } from "@/services/bookmark.service";
import { Checkbox } from "@/components/ui/checkbox";

interface RemoveItemsListProps {
  list: BookmarkList;
  selectedIds: string[];
  onToggleSelect: (postId: string) => void;
}

export function RemoveItemsList({
  list,
  selectedIds,
  onToggleSelect,
}: RemoveItemsListProps) {
  const items = list.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">No items to remove.</div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        if (!item.post) return null;
        const isSelected = selectedIds.includes(item.postId);

        return (
          <div
            key={item.postId}
            className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(item.postId)}
                aria-label={`Select ${item.post.title}`}
                className="w-5 h-5 border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-bold text-gray-900 leading-snug mb-1 cursor-pointer"
                onClick={() => onToggleSelect(item.postId)}
              >
                {item.post.title || "Untitled Story"}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>
                  {
                    // Removed reading history logic for now, using basic metadata
                    item.post.readTime
                      ? `${item.post.readTime} min read`
                      : "5 min read"
                  }
                </span>
                {item.post.publishedAt && (
                  <>
                    <span>·</span>
                    <span>
                      {new Date(item.post.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            {item.post.coverImage && (
              <div className="relative w-20 h-20 sm:w-28 sm:h-20 shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                <Image
                  src={item.post.coverImage}
                  alt={item.post.title || ""}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
