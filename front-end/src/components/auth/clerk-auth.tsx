'use client';

import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import Image from 'next/image';

export function ClerkSocialLogin() {
    const { signIn, isLoaded } = useSignIn();

    if (!isLoaded) return null;

    const signInWith = (strategy: OAuthStrategy) => {
        signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: '/auth/callback',
            redirectUrlComplete: '/dashboard',
        });
    };
    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => signInWith('oauth_google')}
                className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
                <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
                Google
            </button>
            <button
                onClick={() => signInWith('oauth_facebook')}
                className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
            </button>
        </div>
    );
}
