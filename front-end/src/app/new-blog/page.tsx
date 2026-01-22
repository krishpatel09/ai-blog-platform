"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import BlogEditor from "@/components/editor/BlogEditor";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BlogFooter from "@/components/blog/BlogFooter";
import BlogExitModal from "@/components/blog/BlogExitModal";
import BlogVideoModal from "@/components/blog/BlogVideoModal";
import BlogCoverMedia from "@/components/blog/BlogCoverMedia";
import BlogMetaInput from "@/components/blog/BlogMetaInput";
import BlogPublishView from "@/components/blog/BlogPublishView";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import { blogSchema } from "@/lib/zod/blog/blog.schema";
import { ZodError } from "zod";

export default function NewBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverVideo, setCoverVideo] = useState<{
    url: string;
    thumbnail: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPublishView, setShowPublishView] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Context-aware helper state
  type HelperState = "default" | "title" | "tags" | "editor";
  const [activeHelper, setActiveHelper] = useState<HelperState>("default");

  // Preview Mode State
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleRemoveMedia = () => {
    setCoverImage(null);
    setCoverVideo(null);
  };

  const handleAddVideo = (videoData: { url: string; thumbnail: string }) => {
    setCoverVideo(videoData);
    setCoverImage(null);
    setShowVideoModal(false);
  };

  const handlePublishClick = () => {
    try {
      blogSchema.parse({
        title,
        content,
        tags,
        coverImage,
      });

      setValidationErrors([]);
      setShowPublishView(true);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => err.message);
        setValidationErrors(errors);
      } else {
        console.error("Validation error:", error);
      }
    }
  };

  const isPublishingRef = useRef(false);

  const handleFinalPublish = async (publishedAt: string | null) => {
    if (isPublishingRef.current) return;

    try {
      isPublishingRef.current = true;
      setIsPublishing(true);
      const blogData = {
        title,
        tags,
        content,
        coverImage,
        publishedAt,
      };

      console.log("🚀 Publishing Blog Data:", blogData);

      const response = await axiosInstance.post(API_PATH.BLOG.CREATE, blogData);

      if (response.data && response.data.slug) {
        console.log("Published!", response.data);
        router.push(`/${response.data.user.username}/${response.data.slug}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Failed to publish:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to publish blog";
    } finally {
      if (!publishedAt) {
        setShowPublishView(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <BlogHeader
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        onExitClick={() => setShowExitModal(true)}
      />

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Main Editor */}
        <div
          className={`flex-1 transition-all duration-300 pb-24 ${
            isPreviewMode ? "max-w-4xl mx-auto" : "max-w-3xl"
          }`}
        >
          {/* Cover Media Section */}
          <BlogCoverMedia
            coverImage={coverImage}
            coverVideo={coverVideo}
            isPreviewMode={isPreviewMode}
            isUploading={isUploading}
            onUploadStart={() => {
              setIsUploading(true);
              setCoverVideo(null);
            }}
            onUploadSuccess={(res) => {
              setIsUploading(false);
              if (res.fileType === "video" || res.fileType === "non-image") {
                // ImageKit sometimes classifies videos as non-image depending on config
                // Better to check mime-type if available, or assume video if not image
                setCoverVideo({
                  url: res.url,
                  thumbnail: res.thumbnailUrl || res.url, // Use url as fallback or generated thumbnail
                });
                setCoverImage(null);
              } else {
                setCoverImage(res.url);
                setCoverVideo(null);
              }
            }}
            onUploadError={(err) => {
              console.error("Upload failed", err);
              setIsUploading(false);
              alert("Image upload failed");
            }}
            onRemoveMedia={handleRemoveMedia}
            onVideoModalOpen={() => setShowVideoModal(true)}
          />

          {/* Title and Tags Section */}
          <BlogMetaInput
            title={title}
            setTitle={setTitle}
            tags={tags}
            setTags={setTags}
            isPreviewMode={isPreviewMode}
            setActiveHelper={(helper) => setActiveHelper(helper)}
          />

          {/* Main Editor Component */}
          <div className={isPreviewMode ? "pointer-events-none" : ""}>
            <BlogEditor
              onFocus={() => setActiveHelper("editor")}
              isReadOnly={isPreviewMode}
              onChange={setContent}
              coverImage={coverImage}
            />
          </div>

          {/* Bottom Actions - Hidden in Preview */}
          {!isPreviewMode && (
            <BlogFooter
              onPublish={handlePublishClick}
              onSave={() => console.log("Save draft")}
              onRevert={() => console.log("Revert changes")}
            />
          )}
        </div>

        {/* Vertical Separator - Hidden in Preview */}
        {!isPreviewMode && (
          <div className="hidden lg:block w-px bg-gray-200 shrink-0 mx-6 self-stretch border-r border-dashed border-gray-300/50" />
        )}

        {/* Publishing Tips Sidebar - Hidden in Preview */}
        {!isPreviewMode && (
          <BlogSidebar
            activeHelper={activeHelper}
            validationErrors={validationErrors}
          />
        )}
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <BlogExitModal
          onClose={() => setShowExitModal(false)}
          onConfirm={() => router.push("/")}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <BlogVideoModal
          onClose={() => setShowVideoModal(false)}
          onAddVideo={handleAddVideo}
        />
      )}

      {/* Publish View Overlay */}
      {showPublishView && (
        <BlogPublishView
          title={title}
          coverImage={coverImage}
          onClose={() => setShowPublishView(false)}
          onPublish={handleFinalPublish}
          isPublishing={isPublishing}
        />
      )}
    </div>
  );
}
