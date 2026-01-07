'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import AuthLayout from './Layout'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function VerifyEmail() {
    const [otp, setOtp] = useState(['', '', '', ''])
    const [loading, setLoading] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const { showSuccess, showError } = useToast()

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        // Move to next input if value is entered
        if (value && index < 3 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 4).split('')
        if (pastedData.every(char => /^\d+$/.test(char))) {
            const newOtp = [...otp]
            pastedData.forEach((char, index) => {
                if (index < 4) newOtp[index] = char
            })
            setOtp(newOtp)
            // Focus the last filled input or the first empty one
            const nextEmptyIndex = newOtp.findIndex(val => val === '')
            const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex]?.focus()
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const code = otp.join('')
        console.log('Verifying code:', code)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setLoading(false)
        showSuccess('Email verified successfully!')
        // Handle success (redirect, toast, etc.)
    }

    const isComplete = otp.every(digit => digit !== '')

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
                    Verify your email
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Enter the 4-digit code sent to your email address.
                </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex justify-center gap-4 sm:gap-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="text"
                            name={`otp-${index}`}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || !isComplete}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Didn't receive the code? </span>
                    <button type="button" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                        Click to resend
                    </button>
                </div>

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
        </AuthLayout>
    )
}
