"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import bookmarkService, { BookmarkList } from "@/services/bookmark.service";
import BlogCard from "@/components/shared/BlogCard";
import {
  Loader2,
  Lock,
  MoreHorizontal,
  MessageCircle,
  Hand,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

import { EditListDialog } from "@/components/my-library/EditListDialog";
import { DeleteListDialog } from "@/components/my-library/DeleteListDialog";
import { RemoveItemsList } from "@/components/my-library/RemoveItemsList";
import { ReorderItemsList } from "@/components/my-library/ReorderItemsList";
import { BookmarkItem } from "@/services/bookmark.service";

export default function LibraryListDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [list, setList] = useState<BookmarkList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View states
  const [viewMode, setViewMode] = useState<"view" | "remove" | "reorder">(
    "view",
  );
  const [selectedRemoveIds, setSelectedRemoveIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [initialOrderIds, setInitialOrderIds] = useState<string[]>([]);

  // Dialog states (only keeping Edit and Delete list as dialogs)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchListDetails = async () => {
    if (!id) return;
    try {
      // setIsLoading(true); // Don't show full loader on re-fetch to keep UI stable
      const data = await bookmarkService.getListDetails(id);
      setList(data);
    } catch (error) {
      console.error("Failed to fetch list details:", error);
      toast.error("Failed to load list details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchListDetails();
  }, [id]);

  const handlePrivacyToggle = async () => {
    if (!list) return;
    try {
      const newPrivacy = !list.isPrivate;
      await bookmarkService.updateList(list.id, { isPrivate: newPrivacy });
      setList({ ...list, isPrivate: newPrivacy });
      toast.success(`${list.name} is now ${newPrivacy ? "private" : "public"}`);
    } catch (error) {
      console.error("Failed to update privacy", error);
      toast.error("Failed to update privacy");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied successfully");
  };

  const handleRemoveSelected = async () => {
    if (!list || selectedRemoveIds.length === 0) return;

    // User removed confirm dialog, proceeding directly with loading state
    setIsRemoving(true);

    try {
      // Execute all removals
      await Promise.all(
        selectedRemoveIds.map((postId) =>
          bookmarkService.removeItem(list.id, postId),
        ),
      );

      toast.success(`${selectedRemoveIds.length} stories removed`);
      setViewMode("view");
      setSelectedRemoveIds([]);
      fetchListDetails();
    } catch (error) {
      console.error("Failed to remove items", error);
      toast.error("Failed to remove items");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSaveReorder = async (newOrder: BookmarkItem[]) => {
    if (!list) return;
    setIsSavingOrder(true);
    try {
      const postIds = newOrder.map((item) => item.postId);
      // Optimistic update
      setList({ ...list, items: newOrder });

      await bookmarkService.reorderItems(list.id, postIds);
      toast.success("Order saved");
      setViewMode("view");
    } catch (error) {
      console.error("Failed to reorder", error);
      toast.error("Failed to save order");
      fetchListDetails(); // Revert on error
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Check if order has changed
  const hasOrderChanged = list?.items
    ? JSON.stringify(list.items.map((i) => i.postId)) !==
      JSON.stringify(initialOrderIds)
    : false;

  const handleEnterReorderMode = () => {
    if (!list?.items) return;
    setInitialOrderIds(list.items.map((item) => item.postId));
    setViewMode("reorder");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">List not found</h2>
        <Link
          href="/me/library"
          className="text-green-600 hover:text-green-700 mt-4 inline-block"
        >
          Go back to library
        </Link>
      </div>
    );
  }

  const formattedDate = list.createdAt
    ? new Date(list.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="max-w-[680px] mx-auto pb-20 pt-8 px-4 sm:px-0">
      {/* Header Section */}
      <div className="mb-12">
        {/* User Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {user?.image || user?.avatar ? (
                <Image
                  src={user.image || user.avatar || ""}
                  alt={user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white text-lg font-medium">
                  {(user?.name || "U")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 leading-tight">
                {user?.name || "User"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{list.items?.length || 0} stories</span>
                {list.isPrivate && <Lock size={12} className="text-gray-400" />}
              </div>
            </div>
          </div>

          {/* Action Buttons for Remove/Reorder modes */}
          {viewMode !== "view" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setViewMode("view");
                  setSelectedRemoveIds([]);
                }}
                disabled={isRemoving || isSavingOrder}
                className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
              >
                Cancel
              </Button>
              {viewMode === "remove" ? (
                <Button
                  onClick={handleRemoveSelected}
                  disabled={selectedRemoveIds.length === 0 || isRemoving}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    `Remove selected ${selectedRemoveIds.length > 0 ? `(${selectedRemoveIds.length})` : ""}`
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleSaveReorder(list.items);
                  }}
                  disabled={isSavingOrder || !hasOrderChanged}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white min-w-[100px] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Done"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Title & Actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl sm:text-[42px] font-bold text-gray-900 tracking-tight leading-tight">
            {list.name}
          </h1>

          {/* Only show dropdown in view mode */}
          {viewMode === "view" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-500 hover:text-black transition-colors p-2">
                  <MoreHorizontal size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-56 bg-white p-2 shadow-xl border-gray-100 rounded-lg"
              >
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600 hover:text-black hover:bg-transparent focus:text-black focus:bg-transparent py-2.5 px-4 text-[15px]"
                  onClick={handleCopyLink}
                >
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600 hover:text-black hover:bg-transparent focus:text-black focus:bg-transparent py-2.5 px-4 text-[15px]"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit list info
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600 hover:text-black hover:bg-transparent focus:text-black focus:bg-transparent py-2.5 px-4 text-[15px]"
                  onClick={() => setViewMode("remove")}
                >
                  Remove items
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600 hover:text-black hover:bg-transparent focus:text-black focus:bg-transparent py-2.5 px-4 text-[15px]"
                  onClick={handlePrivacyToggle}
                >
                  {list.isPrivate ? "Make Public" : "Make Private"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600 hover:text-black hover:bg-transparent focus:text-black focus:bg-transparent py-2.5 px-4 text-[15px]"
                  onClick={handleEnterReorderMode}
                >
                  Reorder items
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 py-2.5 px-4 text-[15px]"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* List Items Content */}
      <div className="space-y-0">
        {viewMode === "remove" && (
          <RemoveItemsList
            list={list}
            selectedIds={selectedRemoveIds}
            onToggleSelect={(id) => {
              setSelectedRemoveIds((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id],
              );
            }}
          />
        )}

        {viewMode === "reorder" && (
          <ReorderItemsList
            list={list}
            onReorder={(newItems) => {
              setList({ ...list, items: newItems });
            }}
          />
        )}

        {viewMode === "view" &&
          (list.items && list.items.length > 0 ? (
            list.items.map((item: any) => {
              if (!item.post) return null;

              // Transform to exact BlogCard props structure
              const blog = {
                id: item.post.id,
                title: item.post.title,
                slug: item.post.slug,
                excerpt: item.post.excerpt,
                coverImage: item.post.coverImage,
                publishedAt: item.post.publishedAt,
                readTime: item.post.readTime,
                author: {
                  id: item.post.user?.id || "unknown",
                  name: item.post.user?.name || "Unknown",
                  username: item.post.user?.username || "unknown",
                  avatar: item.post.user?.avatar,
                },
                tags: [],
                isPublished: true,
                isDraft: false,
                likeCount: item.post.likeCount || 0,
                commentCount: item.post.commentCount || 0,
                content: "",
              };

              return <BlogCard key={item.postId} blog={blog} />;
            })
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Empty list
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                This list has no stories yet.
              </p>
              <Link href="/">
                <Button variant="outline" className="rounded-full">
                  Start reading
                </Button>
              </Link>
            </div>
          ))}
      </div>

      {/* Dialogs */}
      <EditListDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        listId={list.id}
        currentName={list.name}
        onSuccess={(newName) => setList({ ...list, name: newName })}
      />
      <DeleteListDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        listId={list.id}
        listName={list.name}
      />
    </div>
  );
}
