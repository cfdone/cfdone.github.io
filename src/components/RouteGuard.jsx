import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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

// Component to protect routes based on localStorage data
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const hasData = localStorage.getItem('timetableData')

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

  // If no data exists, redirect to login (which will handle routing to stepone after auth)
  if (!hasData) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Component to prevent access to onboarding when data exists
export function OnboardingGuard({ children }) {
  const { user, loading } = useAuth()
  const hasData = localStorage.getItem('timetableData')

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

  // If data exists, redirect to home
  if (hasData) {
    return <Navigate to="/home" replace />
  }

  return children
}
