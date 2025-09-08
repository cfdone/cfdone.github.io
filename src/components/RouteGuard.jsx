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
  const { user, loading } = useAuth()
  const { loading: syncLoading, hasTimetable } = useTimetableSync()

  if (loading || syncLoading) {
    return <LoadingPulseOverlay />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  const hasLocalData =
    localStorage.getItem('timetableData') && localStorage.getItem('onboardingMode')
  const hasRemoteData = hasTimetable()

  if (!hasLocalData && !hasRemoteData) {
    return <Navigate to="/stepone" replace />
  }

  return children
}

export function OnboardingGuard({ children }) {
  const { user } = useAuth()
  const { hasTimetable, timetableData, onboardingMode, syncStatus } = useTimetableSync()

  if (!timetableData && !onboardingMode) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (syncStatus !== 'synced') {
    return <LoadingPulseOverlay />
  }

  if (hasTimetable()) {
    return <Navigate to="/home" replace />
  }

  return children
}
