import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { scheduleSchema } from "@/lib/zod/blog/schedule.schema";
import { ZodError } from "zod";

interface BlogPublishViewProps {
  title: string;
  onClose: () => void;
  onPublish: (
    publishedAt: string | null,
    status: "PUBLISHED" | "SCHEDULED",
  ) => void;
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
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePublishNow = () => {
    onPublish(new Date().toISOString(), "PUBLISHED");
  };

  const handleSchedule = () => {
    try {
      scheduleSchema.parse({ scheduledDate, scheduledTime });
      setError(null);

      if (scheduledDate && scheduledTime) {
        const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        onPublish(dateTime.toISOString(), "SCHEDULED");
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.message);
      }
    }
  };

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
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Check Date & Time
              </label>
              {(scheduledDate || scheduledTime) && (
                <button
                  onClick={() => {
                    setScheduledDate("");
                    setScheduledTime("");
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear schedule"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    min={(() => {
                      const today = new Date();
                      const year = today.getFullYear();
                      const month = String(today.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(today.getDate()).padStart(2, "0");
                      return `${year}-${month}-${day}`;
                    })()}
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      setError(null);
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className="w-full pl-3 pr-10 py-2 text-left border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm relative"
                  >
                    <span
                      className={
                        !scheduledTime ? "text-gray-500" : "text-gray-900"
                      }
                    >
                      {scheduledTime
                        ? (() => {
                            const [h, m] = scheduledTime.split(":");
                            const date = new Date();
                            date.setHours(parseInt(h));
                            date.setMinutes(parseInt(m));
                            return date.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            });
                          })()
                        : "Select time"}
                    </span>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>

                  {isTimeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {Array.from({ length: 96 }).map((_, i) => {
                        const hour = Math.floor(i / 4);
                        const minute = (i % 4) * 15;
                        const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

                        const date = new Date();
                        date.setHours(hour);
                        date.setMinutes(minute);

                        const displayTime = date.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });

                        const isDisabled = (() => {
                          if (!scheduledDate) return false;
                          const today = new Date();
                          const year = today.getFullYear();
                          const month = String(today.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(today.getDate()).padStart(2, "0");
                          const todayString = `${year}-${month}-${day}`;

                          if (scheduledDate === todayString) {
                            const currentHour = today.getHours();
                            const currentMinute = today.getMinutes();
                            if (
                              hour < currentHour ||
                              (hour === currentHour && minute < currentMinute)
                            ) {
                              return true;
                            }
                          }
                          return false;
                        })();

                        if (isDisabled) return null;

                        return (
                          <div
                            key={timeString}
                            onClick={() => {
                              setScheduledTime(timeString);
                              setIsTimeDropdownOpen(false);
                              setError(null);
                            }}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                              scheduledTime === timeString
                                ? "bg-gray-100 font-medium text-black"
                                : "text-gray-900"
                            }`}
                          >
                            <span className="block truncate">
                              {displayTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-sm font-bold text-gray-700">
              Leave blank to publish immediately.
            </p>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={handlePublishNow}
                disabled={isPublishing || !!scheduledDate}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish Now"}
              </button>

              <button
                onClick={handleSchedule}
                disabled={isPublishing || !scheduledDate || !scheduledTime}
                className="flex-1 px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Scheduling..." : "Schedule Post"}
              </button>
            </div>

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
