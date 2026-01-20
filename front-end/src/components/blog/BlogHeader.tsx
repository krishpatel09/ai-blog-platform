import Link from "next/link";
import { X } from "lucide-react";

interface BlogHeaderProps {
  isPreviewMode: boolean;
  setIsPreviewMode: (mode: boolean) => void;
  onExitClick: () => void;
}

export default function BlogHeader({
  isPreviewMode,
  setIsPreviewMode,
  onExitClick,
}: BlogHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
              Ai
            </div>
            <span className="text-xl font-bold tracking-tight">Genwrite</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`text-sm px-3 py-1.5 rounded-md transition-all ${
              !isPreviewMode
                ? "bg-white text-black shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`text-sm px-3 py-1.5 rounded-md transition-all ${
              isPreviewMode
                ? "bg-white text-black shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            onClick={onExitClick}
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
