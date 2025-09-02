
import { Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import StepOne from "./pages/Onboarding/StepOne";
import Regular from "./pages/Onboarding/Regular";
import Lagger from "./pages/Onboarding/Lagger";
import Resolved from "./pages/Onboarding/Resolved";
import Resolve from "./pages/Onboarding/Resolve";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { ProtectedRoute, OnboardingGuard } from "./components/RouteGuard";

function App() {
  return (
    <Routes>
      {/* Home is the default route - protected if no data exists */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      
      {/* Onboarding routes - redirect to home if data exists */}
      <Route 
        path="/splash" 
        element={
          <OnboardingGuard>
            <Splash />
          </OnboardingGuard>
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
        path="/lagger" 
        element={
          <OnboardingGuard>
            <Lagger />
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
      
      {/* Settings route - always accessible */}
      <Route path="/settings" element={<Settings />} />
      
      {/* Splash route - accessible when no data exists */}
      <Route path="/splash" element={<Splash />} />
      
      {/* Legacy home route - redirect to root */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;

