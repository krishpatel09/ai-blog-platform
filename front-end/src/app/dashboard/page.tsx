
'use client';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import { API_PATH } from '@/services/api/Apipath';
import TokenService from '@/services/api/Tokenservice';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await axiosInstance.post(API_PATH.AUTH.LOGOUT);
            showSuccess('Logged out successfully');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Logout failed';
            showError(errorMessage as string);
            console.error("Logout failed:", error);
        } finally {
            TokenService.removeUser();
            setLoading(false);
            // Sign out from Clerk and redirect
            try {
                await signOut({ redirectUrl: '/sign-in' });
            } catch {
                // If Clerk signOut fails, manually redirect
                router.push('/sign-in');
            }
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging out...' : 'Logout'}
                </button>
            </div>
            <div>Welcome to your dashboard!</div>
        </div>
    )
}

