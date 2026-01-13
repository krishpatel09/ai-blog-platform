
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import { API_PATH } from '@/services/api/Apipath';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useClerk } from '@clerk/nextjs';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();
    const { user, logout } = useAuth();
    const { signOut } = useClerk();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await signOut();
            await axiosInstance.post(API_PATH.AUTH.LOGOUT);
            showSuccess('Logged out successfully');

            logout();

            router.replace('/sign-in');
        } catch (error: any) {
            console.error("Logout error:", error);
            logout();
            showError('Logged out (with errors)');
            router.replace('/sign-in');
        } finally {
            setLoading(false);
        }
    }

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
            <div>
                <p>Welcome to your dashboard, {user?.username || user?.email}!</p>
                {user?.emailVerified && (
                    <p className="text-green-600 mt-2">✓ Email verified</p>
                )}
            </div>
        </div>
    )
}

