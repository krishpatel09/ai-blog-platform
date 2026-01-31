"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BlogEditor from "@/components/editor/BlogEditor";
import BlogHeader from "@/components/blog-publish/BlogHeader";
import BlogSidebar from "@/components/blog-publish/BlogSidebar";
import BlogFooter from "@/components/blog-publish/BlogFooter";
import BlogExitModal from "@/components/blog-publish/BlogExitModal";
import BlogVideoModal from "@/components/blog-publish/BlogVideoModal";
import BlogCoverMedia from "@/components/blog-publish/BlogCoverMedia";
import BlogMetaInput from "@/components/blog-publish/BlogMetaInput";
import BlogPublishView from "@/components/blog-publish/BlogPublishView";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import { blogSchema } from "@/lib/zod/blog/blog.schema";
import { ZodError } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function NewBlogPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }

    // Check for imported story
    const importDraft = localStorage.getItem("import_draft");
    if (importDraft) {
      try {
        const parsed = JSON.parse(importDraft);
        setTitle(parsed.title || "");
        setContent(parsed.content || {});
        if (parsed.image) {
          setCoverImage(parsed.image);
        }
        localStorage.removeItem("import_draft");
      } catch (e) {
        console.error("Failed to parse imported draft", e);
      }
    }
  }, [user, authLoading, router]);

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
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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

  const handleBlogSubmit = async (
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED",
    publishedAt: string | null = null,
  ) => {
    if (status === "DRAFT" && !title) {
      showError("Please enter a title to save draft");
      return;
    }

    if (isPublishingRef.current) return;

    try {
      isPublishingRef.current = true;
      if (status === "DRAFT") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }

      const blogData = {
        title,
        tags,
        content,
        coverImage,
        publishedAt,
        status,
      };

      console.log(
        `🚀 ${status === "DRAFT" ? "Saving Draft" : "Publishing"} Blog Data:`,
        blogData,
      );

      const response = await axiosInstance.post(API_PATH.BLOG.CREATE, blogData);

      if (response.data && response.data.slug) {
        const responseStatus = response.data.status;
        console.log(`${responseStatus} success!`, response.data);

        if (responseStatus === "DRAFT") {
          showSuccess("Draft saved successfully");
          router.push("/");
        } else if (responseStatus === "SCHEDULED") {
          showSuccess("Blog scheduled successfully");
          router.push("/");
        } else {
          showSuccess("Blog published successfully");
          router.push(`/${response.data.user.username}/${response.data.slug}`);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error(`Failed to ${status.toLowerCase()}:`, error);
      showError(`Failed to ${status.toLowerCase()}`);
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
      isPublishingRef.current = false;
      if (status === "PUBLISHED" && !publishedAt) {
        setShowPublishView(false);
      }
    }
  };

  const handleSaveDraft = () => handleBlogSubmit("DRAFT");

  const handleFinalPublish = (
    publishedAt: string | null,
    status: "PUBLISHED" | "SCHEDULED" = "PUBLISHED",
  ) => handleBlogSubmit(status, publishedAt);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

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
              initialContent={content}
              coverImage={coverImage}
            />
          </div>

          {/* Bottom Actions - Hidden in Preview */}
          {!isPreviewMode && (
            <BlogFooter
              onPublish={handlePublishClick}
              onSave={handleSaveDraft}
              onRevert={() => console.log("Revert changes")}
              isSaving={isSavingDraft}
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
          onPublish={(publishedAt, status) => {
            handleFinalPublish(publishedAt, status);
          }}
          isPublishing={isPublishing}
        />
      )}
    </div>
  );
}
