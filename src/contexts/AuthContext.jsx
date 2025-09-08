import React, { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { AuthContext } from '../hooks/useAuth'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Clear local storage on logout
  const clearLocalData = () => {
    localStorage.removeItem('timetableData')
    localStorage.removeItem('onboardingMode')
    localStorage.removeItem('syncStatus')
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        // Error getting session
      } else {
        setUser(session?.user || null)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear local storage when user signs out
        clearLocalData()
      }

      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    // Clear local storage before signing out
    clearLocalData()

    const { error } = await supabase.auth.signOut()
    if (error) {
      // Error signing out
    }
    return { error }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
