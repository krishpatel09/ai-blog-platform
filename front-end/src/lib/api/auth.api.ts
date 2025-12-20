import { supabase } from "@/lib/supabase/supabaseClient"
import type { SignupInput, LoginInput } from "@/lib/zod/auth/auth.Schema"

export interface AuthResult {
  success: boolean
  error?: string
  data?: unknown
}

export async function signUpUser(signUpData: SignupInput): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          username: signUpData.username,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, error: message }
  }
}

export async function signInUser(signInData: LoginInput): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInData.email,
      password: signInData.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, error: message }
  }
}

export async function googleSignIn(redirectTo?: string): Promise<AuthResult> {
  try {
    const redirectUrl = redirectTo || (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback")
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, error: message }
  }
}

export async function logoutUser(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, error: message }
  }
}

