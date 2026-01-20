import { useState } from "react";
import { X } from "lucide-react";

interface BlogVideoModalProps {
  onClose: () => void;
  onAddVideo: (videoData: { url: string; thumbnail: string }) => void;
}

export default function BlogVideoModal({
  onClose,
  onAddVideo,
}: BlogVideoModalProps) {
  const [videoInput, setVideoInput] = useState("");

  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddVideo = () => {
    const videoId = getYouTubeId(videoInput);
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      onAddVideo({ url: videoInput, thumbnail: thumbnailUrl });
      reset();
    } else if (isValidUrl(videoInput)) {
      // Generic URL handling
      onAddVideo({
        url: videoInput,
        thumbnail: "", // No default thumbnail for generic links, consumer must handle
      });
      reset();
    } else {
      console.error("Invalid URL");
    }
  };

  const reset = () => {
    setVideoInput("");
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Add Cover Video Link
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Enter a YouTube, Mux, or Twitch video URL to use as the cover video
          for your article.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Video URL
          </label>
          <input
            type="text"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-900 block mb-1">
              YouTube
            </span>
            <span className="text-[10px] text-gray-500 block truncate">
              youtube.com/watch?v=...
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-900 block mb-1">
              Mux
            </span>
            <span className="text-[10px] text-gray-500 block truncate">
              stream.mux.com/...
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-900 block mb-1">
              Twitch
            </span>
            <span className="text-[10px] text-gray-500 block truncate">
              twitch.tv/videos/...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddVideo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Link
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
