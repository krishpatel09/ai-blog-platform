import { Twitter, Linkedin, X } from "lucide-react";
import { useState } from "react";

interface HighlightMenuProps {
  position: { top: number; left: number } | null;
  onHighlight: () => void;
  onRespond?: () => void;
  onShare?: () => void;
}

const HighlightMenu: React.FC<HighlightMenuProps> = ({
  position,
  onHighlight,
  onRespond,
  onShare,
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  if (!position) return null;

  const handleTwitterShare = () => {
    const text = window.getSelection()?.toString();
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text || "",
      )}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const handleLinkedinShare = () => {
    const url = window.location.href;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
      "_blank",
    );
  };

  return (
    <div
      className="absolute z-50 flex items-center bg-gray-900 text-white rounded shadow-lg transform -translate-x-1/2 -translate-y-full px-1 py-1"
      style={{
        top: position.top - 10,
        left: position.left,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {showShareOptions ? (
        <div className="flex items-center gap-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleTwitterShare();
            }}
            className="p-2 hover:text-gray-300 transition-colors"
          >
            <Twitter size={18} fill="currentColor" className="text-white" />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-1"></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleLinkedinShare();
            }}
            className="p-2 hover:text-gray-300 transition-colors"
          >
            <Linkedin size={18} fill="currentColor" className="text-white" />
          </button>
        </div>
      ) : (
        <>
          <button
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent focus loss
              onHighlight();
            }}
            className="px-3 py-1 hover:text-gray-300 text-sm font-medium border-r border-gray-700"
          >
            Highlight
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRespond && onRespond();
            }}
            className="px-3 py-1 hover:text-gray-300 text-sm font-medium border-r border-gray-700"
          >
            Respond
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setShowShareOptions(true);
            }}
            className="px-3 py-1 hover:text-gray-300 text-sm font-medium"
          >
            Share
          </button>
        </>
      )}

      {/* Down arrow */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
    </div>
  );
};

export default HighlightMenu;
