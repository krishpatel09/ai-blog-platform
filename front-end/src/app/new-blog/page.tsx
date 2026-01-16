"use client";

/* import useRef */
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BlogEditor from "@/components/editor/BlogEditor";
/* ... imports ... */
import { X, Video, FileImage, Save, RotateCcw, Loader2 } from "lucide-react";

export default function NewBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  /* const [content, setContent] = useState(""); // Removed in favor of Tiptap */
  const [tags, setTags] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverVideo, setCoverVideo] = useState<{
    url: string;
    thumbnail: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoInput, setVideoInput] = useState("");

  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setCoverVideo(null);
      // Simulate upload delay
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        setCoverImage(imageUrl);
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleRemoveMedia = () => {
    setCoverImage(null);
    setCoverVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddVideo = () => {
    const videoId = getYouTubeId(videoInput);
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setCoverVideo({ url: videoInput, thumbnail: thumbnailUrl });
      setCoverImage(null);
      setShowVideoModal(false);
      setVideoInput("");
    } else {
      console.error("Invalid YouTube URL");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              Edit
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              Preview
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setShowExitModal(true)}
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Main Editor */}
        <div className="flex-1 max-w-3xl">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />

          {/* Cover Image Section */}
          <div className="flex gap-3 mb-6">
            {isUploading ? (
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-gray-50">
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </div>
            ) : coverImage || coverVideo ? (
              <div className="flex items-center gap-4 w-full">
                <div className="relative h-32 w-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                  <img
                    src={coverImage || coverVideo?.thumbnail}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  {coverVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Video size={20} className="text-gray-900 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      coverVideo
                        ? setShowVideoModal(true)
                        : fileInputRef.current?.click()
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleRemoveMedia}
                    className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FileImage size={16} />
                  Upload Image
                </button>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Video size={16} />
                  Cover Video Link
                </button>
              </>
            )}
          </div>

          {/* Title Input */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New post title here..."
            className="w-full text-5xl font-bold text-gray-900 placeholder-gray-400 outline-none resize-none mb-4"
            rows={2}
            style={{ lineHeight: "1.2" }}
          />

          {/* Tags Input */}
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add up to 4 tags..."
            className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none mb-6 pb-2"
          />

          {/* Main Editor Component */}
          <BlogEditor />

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">
              Publish
            </Button>
            <Button
              variant="outline"
              className="rounded-lg px-6 flex items-center gap-2"
            >
              <Save size={16} />
              Save draft
            </Button>
            <Button
              variant="ghost"
              className="rounded-lg px-4 flex items-center gap-2 text-gray-600"
            >
              <RotateCcw size={16} />
              Revert new changes
            </Button>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block w-px bg-gray-200 shrink-0 mx-6 h-[calc(100vh-8rem)]" />

        {/* Publishing Tips Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Publishing Tips</h3>
            <ul className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Ensure your post has a cover image set to make the most of the
                  home feed and social media platforms.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Share your post on social media platforms or with your
                  co-workers or local communities.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Ask people to leave questions for you in the comments. It's a
                  great way to spark additional discussion describing personally
                  why you wrote it or why people might find it helpful.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowExitModal(false)}
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
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Yes, leave the page
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                No, keep editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Add Cover Video Link
              </h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              Enter a YouTube, Mux, or Twitch video URL to use as the cover
              video for your article.
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
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
