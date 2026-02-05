"use client";

import { useRouter, useParams } from "next/navigation";
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
import StoriesService from "@/services/stories.service";
import { blogSchema } from "@/lib/zod/blog/blog.schema";
import { ZodError } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  const [coverImage, setCoverImage] = useState<string | null>(null);
  // Video support if needed, keeping consistent with new-blog
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

  // Fetch Story Data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!id) {
      showError("Invalid story ID");
      router.push("/me/stories");
      return;
    }

    const fetchStory = async () => {
      try {
        setIsLoading(true);
        const story = await StoriesService.getStoryById(id);

        setTitle(story.title || "");
        // Only set content if it exists to avoid wiping editor with null
        if (story.content) {
          setContent(story.content);
        }
        setTags(story.tags || []);
        setCoverImage(story.coverImage || null);
        // Note: Assuming coverVideo is not yet fully standard in DB response or handled same way
        // If story has status handling, we might want to know it, but we update based on user action
      } catch (error) {
        console.error("Failed to fetch story", error);
        showError("Failed to load story");
        router.push("/me/stories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [id, user, authLoading, router]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleBlogUpdate = async (
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
        // Include video if supported by backend schema, else generic cover
      };

      console.log(`🚀 Updating Blog Data (${status}):`, blogData);

      const response = await StoriesService.updateStory(id, blogData);

      if (response && response.id) {
        showSuccess("Story updated successfully");
        if (status === "DRAFT" || status === "SCHEDULED") {
          // Maybe stay on page or go to dashboard?
          // Usually staying is fine, or go to stories.
          // Let's go to stories to match "Finish" feel, or stay if user just wants save?
          // User request: "In all dropdowns, clicking Edit story should navigate to this new route."
          // Implicitly, this is the editing interface.
          // On save draft, usually we just notify. on Publish we redirect.
          // For consistency with new-blog which redirects to home/dashboard:
          router.push("/me/stories");
        } else {
          router.push(`/${response.user.username}/${response.slug}`);
        }
      }
    } catch (error: any) {
      console.error(`Failed to update story:`, error);
      showError(`Failed to update story`);
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
      isPublishingRef.current = false;
      if (status === "PUBLISHED" && !publishedAt) {
        setShowPublishView(false);
      }
    }
  };

  const handleSaveDraft = () => handleBlogUpdate("DRAFT");

  const handleFinalPublish = (
    publishedAt: string | null,
    status: "PUBLISHED" | "SCHEDULED" = "PUBLISHED",
  ) => handleBlogUpdate(status, publishedAt);

  if (authLoading || isLoading) {
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
                setCoverVideo({
                  url: res.url,
                  thumbnail: res.thumbnailUrl || res.url,
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
              onRevert={() => {
                // Revert logic could reload story
                window.location.reload();
              }}
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
          onConfirm={() => router.push("/me/stories")}
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
