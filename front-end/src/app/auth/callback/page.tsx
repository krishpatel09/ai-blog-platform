'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function AuthCallback() {
    return <AuthenticateWithRedirectCallback redirectUrl="/dashboard" />;
}
