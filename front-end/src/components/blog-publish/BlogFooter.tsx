import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

interface BlogFooterProps {
  onPublish: () => void;
  onSave?: () => void;
  onRevert?: () => void;
  isSaving?: boolean;
}

export default function BlogFooter({
  onPublish,
  onSave,
  onRevert,
  isSaving = false,
}: BlogFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 py-4 px-6 flex items-center justify-center gap-3 shadow-lg">
      <Button
        onClick={onPublish}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2.5 shadow-sm"
        disabled={isSaving}
      >
        Publish
      </Button>
      <Button
        variant="outline"
        className="rounded-lg px-6 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Save draft
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        className="rounded-lg px-4 flex items-center gap-2 text-gray-500 hover:text-gray-900"
        onClick={onRevert}
      >
        <RotateCcw size={16} />
        Revert new changes
      </Button>
    </div>
  );
}
