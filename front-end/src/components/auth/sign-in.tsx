'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/zod/auth/auth.Schema'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import AuthLayout from './Layout'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Check } from 'lucide-react'
import { ClerkSocialLogin } from './clerk-auth'
import axiosInstance from '@/services/api/axiosInstance'
import { API_PATH } from '@/services/api/Apipath'
import TokenService from '@/services/api/Tokenservice'
import { useAuth } from '@/context/AuthContext'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { login } = useAuth()

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

    try {
      const response = await axiosInstance.post(`${API_PATH.AUTH.LOGIN}`, {
        email,
        password,
        rememberMe
      });

      const { success, message, data } = response.data;

      if (success) {
        const userData = {
          ...data.user,
          accessToken: data.accessToken
        };
        login(userData, rememberMe)
        showSuccess(message)
        router.replace('/dashboard')
      } else {
        showError(message)
      }
    } catch (error: any) {
      console.error(error)
      const errorMessage = error.response?.data?.message || error.message
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }



  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome Back to
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
              Ai
            </div>
            <span className="text-xl font-bold tracking-tight">Genwrite</span>
          </Link>
        </h2>
      </div>
      <form className="space-y-6" onSubmit={handleSignIn}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined })
              }}
              className={`h-12 rounded-lg border-gray-300 px-4 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s] ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined })
                }}
                className={`h-12 rounded-lg border-gray-300 px-4 pr-10 text-white focus:ring-black dark:bg-gray-900 dark:border-gray-700 dark:text-white [&:-webkit-autofill]:text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[500000s] ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${rememberMe ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'
                }`}
            >
              {rememberMe && <Check size={14} />}
            </button>
            <label onClick={() => setRememberMe(!rememberMe)} className="ml-2 block text-sm text-gray-700 cursor-pointer dark:text-gray-300">
              Remember Me
            </label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
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

      <ClerkSocialLogin />

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-500">Don't have any account? </span>
        <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
          Register
        </Link>
      </div>

    </AuthLayout>
  )
}

