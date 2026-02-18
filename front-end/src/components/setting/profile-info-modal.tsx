"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { IKContext, IKUpload } from "imagekitio-react";
import { imageKitAuthenticator } from "@/services/imgekit/imageKitAuth";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

interface ProfileInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    name: string;
    photoUrl?: string;
    shortBio?: string;
  };
  onSave: (data: {
    name: string;
    photoUrl: string | undefined;
    shortBio: string;
  }) => void;
}

export function ProfileInfoModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: ProfileInfoModalProps) {
  const [name, setName] = useState(initialData.name);
  const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl);
  const [shortBio, setShortBio] = useState(initialData.shortBio || "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialData.name);
      setPhotoUrl(initialData.photoUrl);
      setShortBio(initialData.shortBio || "");
      setUploadError(null);
      setIsUploading(false);
    }
  }, [open, initialData]);

  const onUploadError = (err: any) => {
    console.error("Upload Error:", err);
    setUploadError("Failed to upload image. Please try again.");
    setIsUploading(false);
  };

  const onUploadSuccess = (res: any) => {
    console.log("Upload Success:", res);
    setPhotoUrl(res.url);
    setIsUploading(false);
    setUploadError(null);
  };

  const onUploadStart = () => {
    setIsUploading(true);
    setUploadError(null);
  };

  const handleSave = () => {
    onSave({ name, photoUrl, shortBio });
    onOpenChange(false);
  };

  const nameCharCount = name.length;
  const bioCharCount = shortBio.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-white">
        <div className="flex items-center justify-between p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-center w-full">
            Profile information
          </DialogTitle>
        </div>

        <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Photo Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Photo</label>
            <div className="flex items-center gap-4">
              <Avatar
                src={photoUrl}
                name={name}
                className="h-20 w-20 text-2xl"
              />
              <div className="space-y-1">
                <IKContext
                  urlEndpoint={urlEndpoint}
                  publicKey={publicKey}
                  authenticator={imageKitAuthenticator}
                >
                  <div className="flex gap-4 text-sm items-center">
                    <label
                      className={`text-green-600 hover:text-green-700 font-medium cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {isUploading ? "Uploading..." : "Update"}
                      <IKUpload
                        fileName="profile-avatar.jpg"
                        useUniqueFileName={true}
                        validateFile={(file: any) =>
                          file.size < 5 * 1024 * 1024
                        }
                        onError={onUploadError}
                        onSuccess={onUploadSuccess}
                        onUploadStart={onUploadStart}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    <button
                      className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                      onClick={() => setPhotoUrl(undefined)}
                      disabled={!photoUrl || isUploading}
                    >
                      Remove
                    </button>
                  </div>
                </IKContext>
                <p className="text-gray-500 text-sm">
                  Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels
                  per side.
                </p>
                {uploadError && (
                  <p className="text-red-500 text-sm">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name*</label>
            <div className="relative">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="bg-white border-gray-200 focus:border-gray-400 transition-all font-medium"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-500">
                {nameCharCount}/50
              </span>
            </div>
          </div>

          {/* Short Bio Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Short bio
            </label>
            <div className="relative">
              <Textarea
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                maxLength={160}
                className="bg-white border-gray-200 focus:border-gray-400 transition-all min-h-[100px] resize-none"
              />
              <span className="absolute right-3 bottom-2 text-xs text-gray-500">
                {bioCharCount}/160
              </span>
            </div>
          </div>

          {/* About Page Link */}
          <div className="pt-2">
            <div className="flex justify-between items-start group">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900">
                  About Page
                </h4>
                <p className="text-sm text-gray-500">
                  Personalize with images and more to paint more of a vivid
                  portrait of yourself than your &apos;Short bio.&apos;
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 disabled:opacity-50"
            disabled={!name}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
