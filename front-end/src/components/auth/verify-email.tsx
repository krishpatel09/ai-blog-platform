'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import AuthLayout from './Layout'
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import axiosInstance from '@/services/api/axiosInstance'
import { API_PATH } from '@/services/api/Apipath'
import TokenService from '@/services/api/Tokenservice'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const { login } = useAuth()
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'updating'>('idle')
    const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
    const [cooldown, setCooldown] = useState(0)

    // FIX: Infinite loop prevention using useRef guard
    // Without this, the useEffect would trigger verifyEmail() → setStatus('success') → re-render → useEffect runs again → infinite loop
    // useRef persists across re-renders but doesn't trigger re-renders when changed
    const hasVerified = useRef(false)

    // REFACTOR: Email verification effect with infinite loop protection
    useEffect(() => {
        // FIX: Check hasVerified.current BEFORE calling verifyEmail to prevent multiple API calls
        if (token && status === 'idle' && !hasVerified.current) {
            hasVerified.current = true; // Set immediately to prevent race conditions
            verifyEmail(token)
        }
    }, [token, status])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const verifyEmail = async (token: string) => {
        // FIX: Additional safety check - if already successful, don't verify again
        if (status === 'success') return;

        setStatus('verifying')
        try {
            const response = await axiosInstance.get(`${API_PATH.AUTH.VERIFY_EMAIL}?token=${token}`)

            const { success, message, data } = response.data;

            if (success && data?.accessToken && data?.user) {
                setStatus('success')
                showSuccess(message || "Email verified successfully!")

                setTimeout(() => {
                    login(data.user, data.accessToken)
                    setTimeout(() => {
                        router.replace('/dashboard')
                    }, 100)
                }, 2000)
            }
        } catch (error: any) {
            console.error('Email verification error:', error)
            setStatus('error')
            showError(error.response?.data?.message || error.message);
        }
    }

    const resendVerificationEmail = async () => {

        setResendStatus('sending')
        try {
            const response = await axiosInstance.post(API_PATH.AUTH.RESEND_EMAIL_VERIFICATION,
                { email },
                { headers: { 'X-Skip-Interceptor': 'true' } }
            );
            setResendStatus('sent')
            showSuccess(response.data.message || "Verification email sent successfully!")
            setCooldown(60)
            setTimeout(() => setResendStatus('idle'), 3000)
        } catch (error: any) {
            console.error(error)
            setResendStatus('idle')
            showError(error.response?.data?.message || "Failed to resend verification email")
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
                <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
                    {email && (
                        <button
                            onClick={resendVerificationEmail}
                            disabled={resendStatus === 'sending' || cooldown > 0}
                            className="w-full px-4 py-2 bg-(--color-blogane-yellow) text-black font-medium rounded-lg hover:bg-(--color-blogane-yellow)/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {resendStatus === 'sending' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : cooldown > 0 ? (
                                `Resend in ${cooldown}s`
                            ) : resendStatus === 'sent' ? (
                                'Email Sent!'
                            ) : (
                                'Resend Verification Email'
                            )}
                        </button>
                    )}
                    <Link
                        href="/sign-in"
                        className="text-sm font-medium text-blue-600 hover:underline text-center"
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

            {email && (
                <div className="mt-6 flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive the email?
                    </p>
                    <button
                        onClick={resendVerificationEmail}
                        disabled={resendStatus === 'sending' || cooldown > 0}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"

                    >
                        {resendStatus === 'sending' ? (
                            <>

                                Sending...
                            </>
                        ) : cooldown > 0 ? (
                            `Resend in ${cooldown}s`
                        ) : resendStatus === 'sent' ? (
                            'Email Sent!'
                        ) : (
                            'Resend Email'
                        )}
                    </button>
                </div>
            )}

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
