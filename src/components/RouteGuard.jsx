import { Navigate } from "react-router-dom";

// Component to protect routes based on localStorage data
export function ProtectedRoute({ children }) {
    const hasData = localStorage.getItem('timetableData');
    
    // If no data exists, redirect to splash
    if (!hasData) {
        return <Navigate to="/splash" replace />;
    }
    
    return children;
}

// Component to prevent access to onboarding when data exists
export function OnboardingGuard({ children }) {
    const hasData = localStorage.getItem('timetableData');
    
    // If data exists, redirect to home
    if (hasData) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}
