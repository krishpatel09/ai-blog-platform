import { X } from "lucide-react";

interface BlogExitModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function BlogExitModal({
  onClose,
  onConfirm,
}: BlogExitModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          You have unsaved changes
        </h2>
        <p className="text-gray-600 mb-6">
          You've made changes to your post. Do you want to navigate to leave
          this page?
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Yes, leave the page
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            No, keep editing
          </button>
        </div>
      </div>
    </div>
  );
}
