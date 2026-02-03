import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import bookmarkService from "@/services/bookmark.service";
import { toast } from "react-hot-toast";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  currentName: string;
  onSuccess: (newName: string) => void;
}

export function EditListDialog({
  open,
  onOpenChange,
  listId,
  currentName,
  onSuccess,
}: EditListDialogProps) {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await bookmarkService.updateList(listId, { name });
      toast.success("List updated");
      onSuccess(name);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update list", error);
      toast.error("Failed to update list");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit list info</DialogTitle>
          <DialogDescription>
            Change the name of your list here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List name"
              disabled={isSubmitting}
              maxLength={60}
              className="col-span-3"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {name.length}/60
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-none text-green-600 hover:text-green-700 hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting || name === currentName}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6"
            >
              {isSubmitting ? "Saving..." : "Done"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
