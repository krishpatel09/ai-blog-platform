'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import AuthLayout from './Layout'
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import axiosInstance from '@/services/api/axiosInstance'
import { API_PATH } from '@/services/api/Apipath'
import TokenService from '@/services/api/Tokenservice'
import { useToast } from '@/hooks/use-toast'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')

    useEffect(() => {
        if (token && status === 'idle') {
            verifyEmail(token)
        }
    }, [token, status])

    const verifyEmail = async (token: string) => {
        setStatus('verifying')
        try {
            const response = await axiosInstance.get(`${API_PATH.AUTH.VerifyEmail}?token=${token}`)

            const { accessToken, refreshToken, user } = response.data

            TokenService.setUser({
                ...user,
                accessToken,
                refreshToken
            })
            TokenService.updateLocalAccessToken(accessToken)

            setStatus('success')
            showSuccess("Your email has been successfully verified. Redirecting...")

            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)

        } catch (error: any) {
            console.error(error)
            setStatus('error')
            showError(error.response?.data?.message);
        }
    }

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-(--color-blogane-yellow)" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Verifying your email...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Please wait while we verify your email address.</p>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Email Verified!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Thank you for verifying your email.</p>
                <p className="text-sm text-gray-400 animate-pulse">Redirecting to dashboard...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <XCircle className="h-16 w-16 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Verification Failed</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    The verification link is invalid or has expired.
                </p>
                <div className="flex gap-4 mt-4">
                    <Link
                        href="/sign-in"
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col space-y-2 mb-3">
                <Link href="/" className="flex items-center gap-2 w-fit mb-4">
                    <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
                        Ai
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Genwrite</span>
                </Link>
            </div>

            <div className="w-full p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h3 className="text-emerald-500 font-medium text-lg mb-1">
                    Check your email
                </h3>
                <p className="text-emerald-500/90 text-sm">
                    We have sent a verification link to <span className="font-medium">{email}</span>.
                </p>
            </div>

            <div className="flex justify-center mt-8">
                <Link
                    href="/sign-in"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to log in
                </Link>
            </div>
        </>
    )
}

export default function VerifyEmail() {
    return (
        <AuthLayout>
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
                <VerifyEmailContent />
            </Suspense>
        </AuthLayout>
    )
}
