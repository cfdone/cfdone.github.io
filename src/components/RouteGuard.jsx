import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingPulseOverlay from './Loading'
// ...existing code...

// Component to protect routes that require authentication
export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
  return <LoadingPulseOverlay />;
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPulseOverlay />;
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Use only localStorage for navigation decisions
  const hasLocalData = localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')

  // If no data exists in localStorage, redirect to stepone
  if (!hasLocalData) {
    return <Navigate to="/stepone" replace />
  }

  return children
}

// Component to prevent access to onboarding when data exists
export function OnboardingGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPulseOverlay />;
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Use only localStorage for navigation decisions
  const hasLocalData = localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')

  // If data exists in localStorage, redirect to home
  if (hasLocalData) {
    return <Navigate to="/home" replace />
  }

  return children
}
