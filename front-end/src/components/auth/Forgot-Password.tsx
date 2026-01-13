'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthLayout from './Layout'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { API_PATH } from '@/services/api/Apipath'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { showSuccess, showError } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios.post(API_PATH.USERS.FORGOT_PASSWORD, { email })

            if (response.data.success) {
                setSubmitted(true)
                showSuccess(response.data.message || 'Reset email sent successfully')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.'
            showError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setLoading(true)
        try {
            const response = await axios.post(API_PATH.USERS.FORGOT_PASSWORD, { email })

            if (response.data.success) {
                showSuccess('Reset email sent again')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to resend email. Please try again.'
            showError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-2 mb-3">
                <Link href="/" className="flex items-center gap-2 w-fit mb-4">
                    <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
                        Ai
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Genwrite</span>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Forgot Password?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            {!submitted ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-lg border-gray-300 px-2 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s]"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Sending email...' : 'Reset Password'}
                    </button>

                    <div className="flex justify-center">
                        <Link
                            href="/sign-in"
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to log in
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Check your email
                                </h3>
                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    <p>
                                        We have sent a password reset link to <strong>{email}</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleResend}
                        disabled={loading}
                        type="button"
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Sending...' : 'Resend email'}
                    </button>

                    <div className="flex justify-center">
                        <Link
                            href="/sign-in"
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to log in
                        </Link>
                    </div>
                </div>
            )}
        </AuthLayout>
    )
}
