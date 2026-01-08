'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from "@clerk/nextjs";

export default function AuthCallback() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        try {
            if (!isLoaded) return;

            if (isSignedIn) {
                router.replace('/dashboard')
            } else {
                router.replace("/auth/error")
            }
        } catch (error) {
            console.error('Unexpected error:', error)
            router.replace('/auth/error')
        }
    }, [isLoaded, isSignedIn, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Completing sign in...
                </p>
            </div>
        </div>
    )
}

