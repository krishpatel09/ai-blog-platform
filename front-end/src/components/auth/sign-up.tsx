'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signupSchema, type SignupInput } from '@/lib/zod/auth/auth.Schema'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import AuthLayout from './Layout'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import axiosInstance from '@/services/api/axiosInstance'
import { API_PATH } from '@/services/api/Apipath'

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupInput, string>>>({})
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    // 1. Client-side Validation
    const result = signupSchema.safeParse(formData)

    if (!result.success) {
      const errors: Partial<Record<keyof SignupInput, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignupInput
        errors[field] = err.message
      })
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    // 2. Submit to API
    try {
      const response = await axiosInstance.post(API_PATH.AUTH.SIGNUP, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      console.log(response.data);

      if (response.data.success) {
        showSuccess('Account created! Redirecting...')
        router.push('/verify-email')
      } else {
        showError(response.data.message || 'Failed to create account');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong during sign up'
      showError(errorMessage);
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 mb-3">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create Account
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
              Ai
            </div>
            <span className="text-xl font-bold tracking-tight">Genwrite</span>
          </Link>
        </h2>

      </div>

      <form className="space-y-6" onSubmit={handleSignUp}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value })
                if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: undefined })
              }}
              className={`h-12 rounded-lg border-gray-300 px-2 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s] ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              placeholder="Enter your username"
            />
            {fieldErrors.username && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
            )}
          </div>

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
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined })
              }}
              className={`h-12 rounded-lg border-gray-300 px-2 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s] ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              placeholder="Enter your email"
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined })
                }}
                className={`h-12 rounded-lg border-gray-300 px-2 pr-10 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s] ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">Or continue with</span>
          </div>
        </div>
      </form>

      {/* auth buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          // onClick={handleGoogleSignUp}
          className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
          Login
        </Link>
      </div>
    </AuthLayout>
  )
}

