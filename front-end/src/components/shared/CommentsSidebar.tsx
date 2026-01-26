"use client";

import * as React from "react";
import { MoreHorizontal, ChevronDown, Bold, Italic } from "lucide-react";
import { PiHandsClappingLight } from "react-icons/pi";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { CommentService, Comment } from "@/services/api/comment.service";

interface CommentsSidebarProps {
  blogId: string;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
}

export function CommentsSidebar({
  blogId,
  isOpen,
  onClose,
  commentCount,
}: CommentsSidebarProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [comment, setComment] = React.useState("");
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch comments when sidebar opens
  React.useEffect(() => {
    if (isOpen && blogId) {
      fetchComments();
    }
  }, [isOpen, blogId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await CommentService.getPostComments(blogId);
      // Ensure we have an array
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
      });
      // Append new comment to the top of the list
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

      // Refresh comments to show the new reply (and potentially nested structure)
      await fetchComments();

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:w-[400px] p-0 flex flex-col gap-0 border-l bg-white"
        side="right"
      >
        <SheetHeader className="p-6 border-b flex-row items-center justify-between space-y-0 relative">
          <SheetTitle className="text-xl font-bold">
            Responses ({comments.length > 0 ? comments.length : commentCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-10 w-10 bg-pink-600 text-white flex items-center justify-center font-medium"
                name="You"
              />
              <span className="text-sm font-medium">You</span>
            </div>

            <div className="bg-card/50 rounded-lg shadow-sm p-4 space-y-4 border border-border/50">
              <Textarea
                placeholder="What are your thoughts?"
                className="resize-none border-none focus-visible:ring-0 p-0 shadow-none min-h-[80px] text-base bg-transparent placeholder:text-muted-foreground/60"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-transparent hover:text-foreground"
                  >
                    <Bold className="h-5 w-5 font-serif" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-transparent hover:text-foreground"
                  >
                    <Italic className="h-5 w-5 font-serif" />
                  </Button>
                </div>

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

          <div className="border-b border-border/40"></div>

          {/* Sort / Divider */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1 text-sm font-bold text-foreground/90 uppercase tracking-wide">
              Most Relevant
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
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
                        src={comment.user?.profileImage}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground -mr-2"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-[15px] text-foreground/90 leading-relaxed font-serif">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-6 text-muted-foreground pt-1">
                    <button className="flex items-center gap-2 text-sm hover:text-foreground transition-colors group">
                      <PiHandsClappingLight className="h-5 w-5 group-hover:fill-current" />
                      <span>{comment._count?.likes || 0}</span>
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
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 hover:text-foreground"
                            >
                              <Bold className="h-4 w-4 font-serif" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 hover:text-foreground"
                            >
                              <Italic className="h-4 w-4 font-serif" />
                            </Button>
                          </div>
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
                              {isSubmitting ? "..." : "Respond"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies Display */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar
                              className="h-6 w-6"
                              name={reply.user?.name || "User"}
                              src={reply.user?.profileImage}
                            />
                            <span className="text-xs font-medium">
                              {reply.user?.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80">
                            {reply.content}
                          </p>
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
