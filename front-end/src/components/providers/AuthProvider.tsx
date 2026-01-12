'use client'

import { useEffect } from 'react';
import TokenService from '@/services/api/Tokenservice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Check for existing session on mount
        const user = TokenService.getUser();

        if (user) {
            console.log('Session restored for:', user.email);
            // Session is automatically available through TokenService
            // No need to validate token here - axios interceptor handles that
        } else {
            console.log('No existing session found');
        }
    }, []);

    return <>{children}</>;
}
