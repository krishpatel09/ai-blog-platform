"use client";

import Link from "next/link";

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="max-w-md text-center">
                <h1 className="mb-4 text-2xl font-semibold text-red-600">
                    Sign-in failed
                </h1>

                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    We couldn’t sign you in. This may be due to a cancelled login,
                    network issue, or permission problem.
                </p>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/sign-in"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        Try again
                    </Link>

                    <Link
                        href="/"
                        className="rounded-md border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
