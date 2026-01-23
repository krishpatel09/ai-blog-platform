import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";

interface BlogPublishViewProps {
  title: string;
  onClose: () => void;
  onPublish: (publishedAt: string | null) => void;
  isPublishing: boolean;
  coverImage: string | null;
}

export default function BlogPublishView({
  title,
  onClose,
  onPublish,
  isPublishing,
  coverImage,
}: BlogPublishViewProps) {
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePublishNow = () => {
    // Current time like 2026-01-20T13:00:00.000Z
    onPublish(new Date().toISOString());
  };

  const handleSchedule = () => {
    if (scheduledDate && scheduledTime) {
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      onPublish(dateTime.toISOString());
    }
  };

  const isScheduleValid = scheduledDate && scheduledTime;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>

      {/* Left Column - Preview */}
      <div className="w-full md:w-1/2 p-10 bg-gray-50 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 relative">
        <div className="max-w-md w-full">
          <h2 className="text-gray-500 font-medium mb-4 uppercase tracking-wider text-sm">
            Blog Preview
          </h2>
          {coverImage && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-sm aspect-video relative bg-gray-200">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {title || "Untitled Blog Post"}
          </h1>
          <p className="mt-4 text-gray-500">
            This is how your blog title will appear to readers.
          </p>
        </div>
      </div>

      {/* Right Column - Settings */}
      <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-start bg-white">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Publishing Settings
          </h2>

          {/* Publishing Option */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Check Date & Time
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Leave blank to publish immediately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {!scheduledDate && !scheduledTime ? (
              <button
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish Now"}
              </button>
            ) : (
              <button
                onClick={handleSchedule}
                disabled={!isScheduleValid || isPublishing}
                className="w-full px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Scheduling..." : "Schedule Publish"}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
