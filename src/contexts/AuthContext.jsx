import React, { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { AuthContext } from '../hooks/useAuth'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearLocalData = () => {
    localStorage.removeItem('timetableData')
    localStorage.removeItem('onboardingMode')
    localStorage.removeItem('syncStatus')
  }

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (!error) {
        setUser(session?.user || null)
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearLocalData()
      }
      
      if (event === 'SIGNED_IN') {
        // Keep loading state for a moment to allow data sync
        setUser(session?.user || null)
        setTimeout(() => setLoading(false), 100)
      } else {
        setUser(session?.user || null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setLoading(true) // Set loading state during sign-in process
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline', // enables refresh token
          prompt: 'consent', // ensures Google issues a refresh token
        },
      },
    })
    
    // Note: loading will be set to false by the auth state change listener
    return { data, error }
  }

  const signOut = async () => {
    try {
      clearLocalData()
      setUser(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}