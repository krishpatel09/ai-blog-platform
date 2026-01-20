import { useRef } from "react";
import { Loader2, Video, FileImage } from "lucide-react";
import { IKContext, IKUpload } from "imagekitio-react";

import { imageKitAuthenticator } from "@/services/imgekit/imageKitAuth";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

interface BlogCoverMediaProps {
  coverImage: string | null;
  coverVideo: { url: string; thumbnail: string } | null;
  isPreviewMode: boolean;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadSuccess: (res: any) => void;
  onUploadError: (err: any) => void;
  onRemoveMedia: () => void;
  onVideoModalOpen: () => void;
}

export default function BlogCoverMedia({
  coverImage,
  coverVideo,
  isPreviewMode,
  isUploading,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onRemoveMedia,
  onVideoModalOpen,
}: BlogCoverMediaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuccess = (res: any) => {
    onUploadSuccess(res);
  };

  const handleError = (err: any) => {
    onUploadError(err);
  };

  const handleUploadStart = () => {
    onUploadStart();
  };

  const handleRemove = () => {
    onRemoveMedia();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  console.log("Frontend: BlogCoverMedia Config:", {
    urlEndpoint,
    publicKey,
    hasAuthenticator: !!imageKitAuthenticator,
  });

  return (
    <IKContext
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={imageKitAuthenticator}
    >
      <div
        className={`flex gap-3 mb-8 transition-all duration-300 ${
          isPreviewMode && !coverImage && !coverVideo ? "hidden" : ""
        }`}
      >
        <IKUpload
          fileName="blog-cover.jpg"
          useUniqueFileName={true}
          validateFile={(file: any) => file.size < 500000000000}
          onSuccess={handleSuccess}
          onError={handleError}
          onUploadStart={handleUploadStart}
          style={{ display: "none" }}
          ref={fileInputRef}
        />

        {isUploading ? (
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-gray-50">
            <Loader2 size={16} className="animate-spin" />
            Uploading...
          </div>
        ) : coverImage || coverVideo ? (
          isPreviewMode ? (
            // PREVIEW MODE: Full Width Display
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-black relative">
              {coverVideo &&
              (coverVideo.url.endsWith(".mp4") ||
                coverVideo.url.endsWith(".webm") ||
                coverVideo.url.includes("imagekit")) ? (
                <video
                  src={coverVideo.url}
                  className="w-full h-full object-contain"
                  controls
                  poster={coverVideo.thumbnail}
                />
              ) : (
                <img
                  src={coverImage || coverVideo?.thumbnail}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}

              {coverVideo &&
                !coverVideo.url.endsWith(".mp4") &&
                !coverVideo.url.endsWith(".webm") &&
                !coverVideo.url.includes("imagekit") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Video size={32} className="text-gray-900 ml-1" />
                    </div>
                  </div>
                )}
            </div>
          ) : (
            // EDIT MODE: Thumbnail + Actions
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
                    coverVideo ? onVideoModalOpen() : triggerFileUpload()
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        ) : (
          // Empty State (Edit Mode Only)
          <>
            <button
              onClick={triggerFileUpload}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FileImage size={16} />
              Upload Image
            </button>

            <button
              onClick={onVideoModalOpen}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Video size={16} />
              Cover Video Link
            </button>
          </>
        )}
      </div>
    </IKContext>
  );
}
