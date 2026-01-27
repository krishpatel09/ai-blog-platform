import { BookmarkList } from "@/services/bookmark.service";
import { Lock, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { cn } from "@/lib/utils";

interface LibraryListCardProps {
  list: BookmarkList;
  author?: {
    name: string;
    avatar?: string | null;
    image?: string | null;
    username?: string;
  };
  className?: string;
}

export default function LibraryListCard({
  list,
  author,
  className,
}: LibraryListCardProps) {
  const { user } = useAuth();

  const displayUser = author || user;
  const userAvatar = displayUser?.avatar || displayUser?.image;
  const userName = displayUser?.name || "User";

  // Get up to 3 cover images from the list items for the preview
  const coverImages = list.items
    .map((item) => item.post?.coverImage)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      className={cn(
        "group flex overflow-hidden border border-gray-200 bg-white transition-all cursor-pointer h-[160px]",
        className,
      )}
    >
      {/* Left Content */}
      <div className="flex-1 p-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-600 text-[10px] text-white font-bold">
                  {(userName || "U")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {userName}
            </span>
          </div>

          <Link href={`/library/list/${list.id}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-black line-clamp-2">
              {list.name}
            </h3>
          </Link>

          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
            <span>{list._count?.items || list.items?.length || 0} stories</span>
          </div>
        </div>
      </div>

      {/* Right Images Collage */}
      <div className="w-[40%] flex h-full ml-auto">
        {coverImages.length > 0 ? (
          <div className="w-full flex h-full">
            {coverImages.map((img, idx) => (
              <div
                key={idx}
                className={`relative h-full border-l-2 border-white first:border-l-0 overflow-hidden bg-gray-100 ${
                  coverImages.length === 1
                    ? "w-full"
                    : coverImages.length === 2
                      ? "w-1/2"
                      : "w-1/3"
                }`}
              >
                <Image
                  src={img}
                  alt={`Cover ${idx}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-300">
              <span className="text-4xl">📚</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
