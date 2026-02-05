"use client";

import * as React from "react";
import { MoreHorizontal, Heart, MessageCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { CommentService, Comment } from "@/services/comment.service";
import { useAuth } from "@/context/AuthContext";

interface CommentsSidebarProps {
  blogId: string;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
  selectedText?: string;
}

export function CommentsSidebar({
  blogId,
  isOpen,
  onClose,
  commentCount,
  selectedText,
}: CommentsSidebarProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [expandedComments, setExpandedComments] = React.useState<Set<string>>(
    new Set(),
  );
  const [comment, setComment] = React.useState("");
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen && blogId) {
      fetchComments();
    }
  }, [isOpen, blogId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await CommentService.getPostComments(blogId);
      console.log("Comments:", data);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      const newComment = await CommentService.createComment({
        postId: blogId,
        content: comment,
        selectedText: selectedText,
      });
      console.log("New comment:", newComment);
      setComments([newComment, ...comments]);
      setComment("");
      toast.success("Response published");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error("Failed to publish response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await CommentService.createComment({
        postId: blogId,
        content: replyContent,
        parentId: parentId,
      });
      console.log("Reply created:", replyContent);

      // Fetch the updated list of replies for this comment
      const updatedReplies = await CommentService.getReplies(parentId);

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: updatedReplies,
              _count: {
                ...c._count!,
                replies: (c._count?.replies || 0) + 1,
              },
            };
          }
          return c;
        }),
      );

      // Ensure replies are visible
      if (!expandedComments.has(parentId)) {
        setExpandedComments((prev) => new Set(prev).add(parentId));
      }

      setReplyingToId(null);
      setReplyContent("");
      toast.success("Reply published");
    } catch (error) {
      console.error("Failed to reply:", error);
      toast.error("Failed to publish reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    // Optimistic update
    setComments((prevComments) =>
      prevComments.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.likes && c.likes.length > 0;
          return {
            ...c,
            likes: isLiked ? [] : [{ userId: user?.id }], // Toggle local like state
            // Use likeCount if available, else fallback to _count.likes.
            // Note: Backend 'toggleLike' updates 'likeCount'. Initial fetch uses '_count.likes'.
            // We should ideally unify, but for now we adjust based on _count or likeCount presence.
            _count: {
              ...c._count!,
              likes: (c._count?.likes || 0) + (isLiked ? -1 : 1),
            },
            likeCount:
              (c.likeCount || c._count?.likes || 0) + (isLiked ? -1 : 1),
          };
        }
        // Also check replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId) {
                const isLiked = r.likes && r.likes.length > 0;
                return {
                  ...r,
                  likes: isLiked ? [] : [{ userId: user?.id }],
                  _count: {
                    ...r._count!,
                    likes: (r._count?.likes || 0) + (isLiked ? -1 : 1),
                  },
                  likeCount:
                    (r.likeCount || r._count?.likes || 0) + (isLiked ? -1 : 1),
                };
              }
              return r;
            }),
          };
        }
        return c;
      }),
    );

    try {
      await CommentService.toggleLike(commentId);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to update like");
      // Revert verification needed or just fetchComments on error
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    // Optimistic update
    const previousComments = [...comments];
    setComments((prevComments) => {
      // 1. Try to remove from top-level
      if (prevComments.some((c) => c.id === commentId)) {
        return prevComments.filter((c) => c.id !== commentId);
      }

      // 2. Try to remove from replies
      return prevComments.map((c) => {
        if (c.replies && c.replies.some((r) => r.id === commentId)) {
          return {
            ...c,
            replies: c.replies.filter((r) => r.id !== commentId),
          };
        }
        return c;
      });
    });

    try {
      await CommentService.deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
      setComments(previousComments); // Revert on failure
    }
  };

  const toggleReplies = async (commentId: string) => {
    const isExpanding = !expandedComments.has(commentId);

    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (isExpanding) {
        next.add(commentId);
      } else {
        next.delete(commentId);
      }
      return next;
    });

    if (isExpanding) {
      try {
        const replies = await CommentService.getReplies(commentId);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, replies } : c)),
        );
      } catch (error) {
        console.error("Failed to fetch replies:", error);
        toast.error("Failed to load replies");
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:w-[400px] p-0 flex flex-col gap-0 border-l bg-white [&>button]:hidden"
        side="right"
      >
        <SheetHeader className="p-6 border-b flex-row items-center justify-between space-y-0 relative">
          <SheetTitle className="text-xl font-bold">
            Responses ({comments.length > 0 ? comments.length : commentCount})
          </SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 h-8 w-8 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-10 w-10 bg-pink-600 text-white flex items-center justify-center font-medium"
                name={user?.name}
                src={user?.avatar}
              />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>

            <div className="bg-card/50 rounded-lg shadow-sm p-4 space-y-4 border border-border/50">
              {selectedText && (
                <div className="mb-2 pl-4 border-l-4 border-green-600">
                  <p className="font-serif text-[15px] italic text-foreground/80 leading-relaxed">
                    <span className="bg-green-100/50 box-decoration-clone py-0.5 px-1 rounded-sm">
                      {selectedText}
                    </span>
                  </p>
                </div>
              )}
              <Textarea
                placeholder="What are your thoughts?"
                className="resize-none border-none focus-visible:ring-0 p-0 shadow-none min-h-[80px] text-base bg-transparent placeholder:text-muted-foreground/60"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-muted-foreground"></div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setComment("")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-green-600/90 hover:bg-green-700 text-white px-6 py-1 h-8 text-sm font-normal"
                    disabled={!comment.trim() || isSubmitting}
                    onClick={handleCreateComment}
                  >
                    {isSubmitting ? "Publishing..." : "Respond"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-border/20 "></div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p>No more comment</p>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="space-y-3 pb-6 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 flex items-center justify-center bg-gray-200"
                        name={comment.user?.name || "Anonymous"}
                        src={comment.user?.avatar}
                      />
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {comment.user?.name || "Anonymous"}
                          </span>
                          {/* If we had currentUserId, we could show 'You' badge */}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {user?.id === comment.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground -mr-2"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {comment.selectedText && (
                    <div className="mb-3 pl-4 border-l-4 border-green-600">
                      <p className="font-serif text-[15px] italic text-foreground/80 leading-relaxed">
                        <span className="bg-green-100/50 box-decoration-clone py-0.5 px-1 rounded-sm">
                          {comment.selectedText}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className="text-[15px] text-foreground/90 leading-relaxed font-serif">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-6 text-muted-foreground pt-1">
                    <button
                      className="flex items-center gap-2 text-sm hover:text-foreground transition-colors group"
                      onClick={() => handleLike(comment.id)}
                    >
                      <Heart
                        className={`h-5 w-5 ${comment.likes && comment.likes.length > 0 ? "fill-red-500 text-red-500" : "group-hover:fill-current"}`}
                      />
                      <span>
                        {comment.likeCount ?? comment._count?.likes ?? 0}
                      </span>
                    </button>
                    <button
                      className="text-sm hover:text-foreground transition-colors font-medium underline-offset-4 hover:underline"
                      onClick={() => {
                        setReplyingToId(comment.id);
                        setReplyContent("");
                      }}
                    >
                      Reply
                    </button>
                  </div>

                  {/* View Replies Toggle */}
                  {comment._count?.replies && comment._count.replies > 0 ? (
                    <button
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mt-3"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {expandedComments.has(comment.id)
                          ? "Hide replies"
                          : `View ${comment._count.replies} replies`}
                      </span>
                    </button>
                  ) : null}

                  {/* Reply Input Area */}
                  {replyingToId === comment.id && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <div className="bg-gray-50 rounded-md p-4 space-y-4">
                        <Textarea
                          placeholder={`Replying to ${comment.user?.name}`}
                          className="resize-none border-none focus-visible:ring-0 p-0 shadow-none min-h-[60px] text-sm bg-transparent placeholder:text-muted-foreground/60"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          autoFocus
                        />
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-muted-foreground"></div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingToId(null)}
                              className="text-muted-foreground hover:text-foreground hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-900 px-4 py-1 h-7 text-xs font-medium disabled:opacity-50"
                              disabled={!replyContent.trim() || isSubmitting}
                              onClick={() => handleReply(comment.id)}
                            >
                              {isSubmitting ? "Responding..." : "Respond"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies Display */}
                  {expandedComments.has(comment.id) &&
                    comment.replies &&
                    comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  className="h-6 w-6"
                                  name={reply.user?.name || "User"}
                                  src={reply.user?.avatar}
                                />
                                <span className="text-xs font-medium">
                                  {reply.user?.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    reply.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {user?.id === reply.userId && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-red-600 focus:text-red-600 text-xs"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <p className="text-sm text-foreground/80 pl-8">
                              {reply.content}
                            </p>
                            <div className="flex items-center gap-4 text-muted-foreground pl-8">
                              <button
                                className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors group"
                                onClick={() => handleLike(reply.id)}
                              >
                                <Heart
                                  className={`h-3.5 w-3.5 ${reply.likes && reply.likes.length > 0 ? "fill-red-500 text-red-500" : "group-hover:fill-current"}`}
                                />
                                <span>
                                  {reply.likeCount ?? reply._count?.likes ?? 0}
                                </span>
                              </button>
                              <button
                                className="text-xs hover:text-foreground transition-colors font-medium underline-offset-4 hover:underline"
                                onClick={() => {
                                  setReplyingToId(comment.id); // Reply to the parent comment even when clicking on a sub-reply (simpler hierarchy)
                                  setReplyContent(`@${reply.user?.name} `); // Mention user
                                }}
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
