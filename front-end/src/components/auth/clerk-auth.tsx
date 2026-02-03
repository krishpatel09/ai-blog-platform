"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";

export function ClerkSocialLogin() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

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
        disabled
        // onClick={() => signInWith("oauth_google")}
        className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed transition-colors"
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
        disabled
        // onClick={() => signInWith("oauth_facebook")}
        className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed transition-colors"
      >
        <Image
          src="/facebook-logo.svg"
          alt="Facebook"
          width={20}
          height={20}
          className="mr-2"
        />
        Facebook
      </button>
    </div>
  );
}
