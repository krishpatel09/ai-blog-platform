"use client";

import React from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import axiosInstance from "../api/axiosInstance";
import { API_PATH } from "../api/Apipath";

interface ImageUploadProps {
  onSuccess: (res: any) => void;
  onError: (err: any) => void;
}

import { imageKitAuthenticator } from "./imageKitAuth";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

const ImageUpload: React.FC<ImageUploadProps> = ({ onSuccess, onError }) => {
  // CHECK: These values must match your ImageKit Dashboard exactly.
  console.log("Frontend: ImageUpload Config:", {
    urlEndpoint,
    publicKey,
    hasAuthenticator: !!imageKitAuthenticator,
  });

  return (
    <div className="image-upload-container">
      <IKContext
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={imageKitAuthenticator}
      >
        <IKUpload
          fileName="blog-image.jpg"
          useUniqueFileName={true}
          onSuccess={onSuccess}
          onError={onError}
          className="file-input file-input-bordered w-full max-w-xs" // Tailwind classes
        />
      </IKContext>
    </div>
  );
};

export default ImageUpload;
