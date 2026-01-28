"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs"; // useSignUp ઉમેર્યું
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";

export function ClerkSocialLogin() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp(); // SignUp હૂક

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/auth/callback",
      redirectUrlComplete: "/auth/callback",
    });
  };

  const signUpWith = (strategy: OAuthStrategy) => {
    return signUp?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/auth/callback",
      redirectUrlComplete: "/auth/callback",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => signInWith("oauth_google")}
        className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <Image
          src="/google-logo.svg"
          alt="Google"
          width={20}
          height={20}
          className="mr-2"
        />
        Google
      </button>

      <button
        onClick={() => signInWith("oauth_facebook")}
        className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        Facebook
      </button>
    </div>
  );
}
