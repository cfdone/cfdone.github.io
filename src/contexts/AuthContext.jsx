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

      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        ueryParams: {
          access_type: 'offline', // enables refresh token
          prompt: 'consent', // ensures Google issues a refresh token
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    clearLocalData()
    const { error } = await supabase.auth.signOut()
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
