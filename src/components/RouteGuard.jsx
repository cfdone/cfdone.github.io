import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useTimetableSync from '../hooks/useTimetableSync'

// Component to protect routes that require authentication
export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-white font-product-sans">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Component to protect routes based on localStorage data or synced data
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { hasTimetable, loading: timetableLoading, syncStatus, timetableData, onboardingMode } = useTimetableSync()

  console.log('ProtectedRoute - Debug:', {
    user: !!user,
    loading,
    timetableLoading,
    syncStatus,
    hasTimetableResult: hasTimetable(),
    hasTimetableData: !!timetableData,
    hasOnboardingMode: !!onboardingMode
  })

  if (loading) {
    console.log('ProtectedRoute - Auth loading')
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-white font-product-sans">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
    console.log('ProtectedRoute - Timetable loading or syncing')
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-white font-product-sans">Syncing data...</p>
        </div>
      </div>
    )
  }

  // Also check localStorage as fallback for immediate check
  const hasLocalData = localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')
  
  // If no data exists in either localStorage or synced data, redirect to stepone
  if (!hasTimetable() && !hasLocalData) {
    console.log('ProtectedRoute - No timetable data anywhere, redirecting to stepone')
    return <Navigate to="/stepone" replace />
  }

  console.log('ProtectedRoute - All checks passed, rendering children')
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
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-white font-product-sans">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('OnboardingGuard - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
    console.log('OnboardingGuard - Timetable loading or syncing')
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-white font-product-sans">Syncing data...</p>
        </div>
      </div>
    )
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
