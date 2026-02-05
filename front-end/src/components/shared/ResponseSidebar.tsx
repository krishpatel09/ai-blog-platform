import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentService } from "@/services/comment.service";

interface ResponseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  postId: string;
  onCommentSuccess?: () => void;
}

export function ResponseSidebar({
  isOpen,
  onClose,
  selectedText,
  postId,
  onCommentSuccess,
}: ResponseSidebarProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      await CommentService.createComment({
        postId,
        content: comment,
        selectedText,
      });
      setComment("");
      onClose();
      if (onCommentSuccess) onCommentSuccess();
    } catch (error) {
      console.error("Failed to submit response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-6 bg-white">
        <SheetHeader>
          <SheetTitle>Respond to selected text</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Quoted Text */}
          <div className="pl-4 border-l-4 border-green-500 bg-gray-50 p-4 rounded-r-lg italic text-gray-700">
            "{selectedText}"
          </div>

          {/* Comment Input */}
          <Textarea
            placeholder="What are your thoughts?"
            className="min-h-[150px] resize-none focus-visible:ring-green-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <SheetFooter className="flex-row gap-2 sm:gap-0 justify-end mt-auto">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? "Publishing..." : "Respond"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
