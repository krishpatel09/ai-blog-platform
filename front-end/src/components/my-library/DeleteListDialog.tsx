import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import bookmarkService from "@/services/bookmark.service";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DeleteListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
}

export function DeleteListDialog({
  open,
  onOpenChange,
  listId,
  listName,
}: DeleteListDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await bookmarkService.deleteList(listId);
      toast.success("List deleted");
      router.push("/me/library");
      router.refresh(); // Ensure library page updates
    } catch (error) {
      console.error("Failed to delete list", error);
      toast.error("Failed to delete list. Default lists cannot be deleted.");
      setIsSubmitting(false); // Only reset if failed
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Delete list</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{listName}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
