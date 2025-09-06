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
  const { hasTimetable, loading: timetableLoading, syncStatus } = useTimetableSync()

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

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
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
    return <Navigate to="/stepone" replace />
  }

  return children
}

// Component to prevent access to onboarding when data exists
export function OnboardingGuard({ children }) {
  const { user, loading } = useAuth()
  const { hasTimetable, loading: timetableLoading, syncStatus } = useTimetableSync()

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

  // Wait for initial sync attempt to complete
  if (timetableLoading || syncStatus === 'syncing') {
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
    return <Navigate to="/home" replace />
  }

  return children
}
