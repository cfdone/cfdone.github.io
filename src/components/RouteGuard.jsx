import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useTimetableSync from '../hooks/useTimetableSync'
import {LoadingOverlay } from './Loading'

// Component to protect routes that require authentication
export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingOverlay/>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Component to protect routes based on localStorage data or synced data
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { hasTimetable, loading: timetableLoading, syncStatus } = useTimetableSync()

  if (loading) {
    return <LoadingOverlay />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
    return <LoadingOverlay  />
  }

  // Also check localStorage as fallback for immediate check
  const hasLocalData = localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')
  
  // If no data exists in either localStorage or synced data, redirect to stepone
  if (!hasTimetable() && !hasLocalData) {
    return <Navigate to="/stepone" replace />
  }

  return children
}

// Component to prevent access to onboarding when data exists
export function OnboardingGuard({ children }) {
  const { user, loading } = useAuth()
  const { hasTimetable, loading: timetableLoading, syncStatus, timetableData, onboardingMode } = useTimetableSync()

  console.log('OnboardingGuard - Debug:', {
    user: !!user,
    loading,
    timetableLoading,
    syncStatus,
    hasTimetableResult: hasTimetable(),
    hasTimetableData: !!timetableData,
    hasOnboardingMode: !!onboardingMode
  })

  if (loading) {
    console.log('OnboardingGuard - Auth loading')
    return <LoadingOverlay />
  }

  if (!user) {
    console.log('OnboardingGuard - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
    console.log('OnboardingGuard - Timetable loading or syncing')
    return <LoadingOverlay/>
  }

  // Also check localStorage as fallback for immediate check
  const hasLocalData = localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')

  // If data exists (either in localStorage or synced), redirect to home
  if (hasTimetable() || hasLocalData) {
    console.log('OnboardingGuard - Has timetable data, redirecting to home')
    return <Navigate to="/home" replace />
  }

  console.log('OnboardingGuard - No timetable data, allowing access to onboarding')
  return children
}
