"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/services/api/axiosInstance";
import { useToast } from "@/hooks/use-toast";
import { API_PATH } from "@/services/api/Apipath";

export default function AuthCallback() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { session, signOut } = useClerk();
  const { login } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const isSyncing = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && session) {
      const syncUser = async () => {
        if (isSyncing.current) return;
        isSyncing.current = true;

        try {
          console.log("Syncing Clerk user with backend...", session.id);
          const response = await axiosInstance.post(
            API_PATH.AUTH.CLERK_VERIFY,
            {
              sessionId: session.id,
            },
          );

          const { success, message, data } = response.data;

          if (success) {
            login(data.user, data.accessToken);
            showSuccess(message || "Authenticated successfully!");
            router.replace("/");
          }
        } catch (error: any) {
          console.error("Sync Error:", error);
          showError(error.response?.data?.message || "Authentication failed");
          router.replace("/sign-in");
          await signOut();
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, session, router, login, showSuccess, showError]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium text-foreground">
            Finalizing authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <AuthenticateWithRedirectCallback />
      <div className="mt-4 flex flex-col items-center space-y-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm font-medium text-muted-foreground">
          Verifying credentials...
        </p>
      </div>
    </div>
  );
}
