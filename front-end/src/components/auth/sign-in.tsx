'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/zod/auth/auth.Schema'
import { signInUser, googleSignIn } from '@/lib/api/auth.api'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    const result = loginSchema.safeParse({ email, password })
    
    if (!result.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginInput
        errors[field] = err.message
      })
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    const authResult = await signInUser(result.data)

    if (!authResult.success) {
      toast.error(authResult.error || 'Failed to sign in')
      setLoading(false)
      return
    }

    if (authResult.data && typeof authResult.data === 'object' && 'user' in authResult.data) {
      toast.success('Signed in successfully')
      router.push('/')
      router.refresh()
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)

    const authResult = await googleSignIn()

    if (!authResult.success) {
      toast.error(authResult.error || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: undefined })
                  }
                }}
                className={`relative block w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                placeholder="Email address"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined })
                  }
                }}
                className={`relative block w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 ${
                  fieldErrors.password
                    ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                placeholder="Password"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
              {loading ? 'Signing in with Google...' : 'Sign in with Google'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
            </span>
            <a
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

