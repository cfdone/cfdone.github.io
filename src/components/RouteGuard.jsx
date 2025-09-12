// ...existing code...
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useTimetableSync from '../hooks/useTimetableSync'
import LoadingPulseOverlay from './Loading'

export function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <LoadingPulseOverlay />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { loading: timetableLoading } = useTimetableSync()

  if (authLoading || timetableLoading) {
    return <LoadingPulseOverlay />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  const localTimetable = localStorage.getItem('timetableData')
  const localOnboarding = localStorage.getItem('onboardingMode')
  if (!localTimetable || !localOnboarding) {
    return <Navigate to="/stepone" replace />
  }
  return children
}

export function OnboardingGuard({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { timetableData, onboardingMode, loading: timetableLoading } = useTimetableSync()
  if (authLoading || timetableLoading) {
    return <LoadingPulseOverlay />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (timetableData && onboardingMode) {
    return <Navigate to="/home" replace />
  }
  return children
}
