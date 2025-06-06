'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null, data?: { user: User | null } }>
  signOut: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Current session:', session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized - sign in skipped')
        return { error: { message: 'Authentication service not available' } as AuthError }
      }

      console.log('Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('Sign in error:', error)
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Invalid email or password' } as AuthError }
        }
        if (error.message.includes('Email not confirmed')) {
          // Store email for resend functionality
          localStorage.setItem('pendingVerificationEmail', email)
          router.push('/auth/verify-email')
          return { error: { ...error, message: 'Please verify your email before signing in' } as AuthError }
        }
        if (error.message.includes('rate limit')) {
          return { error: { ...error, message: 'Too many attempts. Please try again in a few minutes.' } as AuthError }
        }
        return { error }
      }

      console.log('Sign in successful:', data)
      if (data?.user) {
        // Check if user has completed profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role) {
          // Redirect based on role
          const redirectPath = profile.role === 'client' ? '/client' : '/freelancer'
          localStorage.setItem('lastUsedInterface', redirectPath)
          router.push(redirectPath)
        } else {
          // If no role is set, redirect to complete profile page instead of signup
          router.push('/auth/complete-profile')
        }
      }
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'An unexpected error occurred during sign in' } as AuthError }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized - sign up skipped')
        return { 
          error: { message: 'Registration service not available' } as AuthError,
          data: { user: null }
        }
      }

      console.log('Attempting sign up for:', email)
      
      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false
          }
        }
      })
      
      if (error) {
        console.error('Signup error details:', error)
        if (error.message.includes('already registered')) {
          return { error: { ...error, message: 'This email is already registered. Please sign in instead.' } as AuthError }
        }
        if (error.message.includes('rate limit')) {
          return { error: { ...error, message: 'Too many attempts. Please try again in a few minutes.' } as AuthError }
        }
        return { error }
      }

      console.log('Sign up successful:', data)
      
      // Check if email verification is required
      if (data?.user?.identities?.length === 0) {
        return { error: { message: 'This email is already registered. Please sign in instead.' } as AuthError }
      }

      if (data?.user) {
        // Store the email in localStorage for resend functionality
        localStorage.setItem('pendingVerificationEmail', email)
        
        // Show verification message
        console.log('Verification email sent to:', email)
        
        router.push('/auth/verify-email')
      }
      return { error: null, data: { user: data.user } }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'An unexpected error occurred during sign up' } as AuthError }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized - verification email not sent')
        return { error: { message: 'Email service not available' } as AuthError }
      }

      console.log('Resending verification email to:', email)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Resend verification error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { error: { message: 'Failed to resend verification email' } as AuthError }
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized - sign out skipped')
        return
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 