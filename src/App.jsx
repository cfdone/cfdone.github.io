import { Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'
import Login from './pages/Login'
import StepOne from './pages/Onboarding/StepOne'
import Regular from './pages/Onboarding/Regular'
import Preferences from './pages/Onboarding/Preferences'
import Resolved from './pages/Onboarding/Resolved'
import Resolve from './pages/Onboarding/Resolve'
import Preview from './pages/Onboarding/Preview'
import Home from './pages/Home'
import Settings from './pages/Settings'
import UniHub from './pages/UniHub'
import { ProtectedRoute, OnboardingGuard, AuthGuard } from './components/RouteGuard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login route - accessible when not authenticated */}
        <Route path="/login" element={<Login />} />

        {/* Home route - protected, requires auth and data */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Onboarding routes - redirect to home if data exists */}
        <Route
          path="/stepone"
          element={
            <OnboardingGuard>
              <StepOne />
            </OnboardingGuard>
          }
        />
        <Route
          path="/regular"
          element={
            <OnboardingGuard>
              <Regular />
            </OnboardingGuard>
          }
        />

        <Route
          path="/preferences"
          element={
            <OnboardingGuard>
              <Preferences />
            </OnboardingGuard>
          }
        />
        <Route
          path="/resolved"
          element={
            <OnboardingGuard>
              <Resolved />
            </OnboardingGuard>
          }
        />
        <Route
          path="/resolve"
          element={
            <OnboardingGuard>
              <Resolve />
            </OnboardingGuard>
          }
        />
        <Route
          path="/preview"
          element={
            <OnboardingGuard>
              <Preview />
            </OnboardingGuard>
          }
        />

        {/* Settings route - requires authentication */}
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          }
        />
        <Route
          path="/unihub"
          element={
            <AuthGuard>
              <UniHub />
            </AuthGuard>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
