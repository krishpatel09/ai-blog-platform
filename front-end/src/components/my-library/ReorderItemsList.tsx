import { useState, useEffect } from "react";
import Image from "next/image";
import { BookmarkList, BookmarkItem } from "@/services/bookmark.service";
import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";

interface ReorderItemsListProps {
  list: BookmarkList;
  onReorder: (newItems: BookmarkItem[]) => void;
}

export function ReorderItemsList({ list, onReorder }: ReorderItemsListProps) {
  const [items, setItems] = useState(list.items || []);

  useEffect(() => {
    setItems(list.items || []);
  }, [list.items]);

  const handleReorder = (newOrder: BookmarkItem[]) => {
    setItems(newOrder);
    onReorder(newOrder);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No items to reorder.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-0"
      >
        {items.map((item) => {
          if (!item.post) return null;

          return (
            <Reorder.Item
              key={item.postId}
              value={item}
              className="bg-white border-b border-gray-100 last:border-0 p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50/50"
            >
              <div className="text-gray-300 hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                  {item.post.title || "Untitled Story"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    {item.post.readTime
                      ? `${item.post.readTime} min read`
                      : "5 min read"}
                  </span>
                </div>
              </div>

              {item.post.coverImage && (
                <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-sm overflow-hidden opacity-80 pointer-events-none">
                  <Image
                    src={item.post.coverImage}
                    alt={item.post.title || ""}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
