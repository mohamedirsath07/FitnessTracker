/**
 * ============================================
 * MAIN APP COMPONENT
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * REACT ROUTER:
 * React Router enables navigation between pages without full page reloads.
 * - BrowserRouter: Uses HTML5 history API for clean URLs
 * - Routes: Container for Route components
 * - Route: Maps a URL path to a component
 * 
 * PROTECTED ROUTES:
 * Some pages should only be accessible to logged-in users.
 * We create a ProtectedRoute component that redirects to login if not auth'd.
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataCacheProvider } from './context/DataCacheContext';
import { LoadingScreen } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPWA from './components/InstallPWA';

// Auth pages — small, loaded eagerly for fast first paint
import Login from './pages/Login';
import Register from './pages/Register';

// Heavy pages — lazy loaded (code-split) to reduce initial bundle
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Workout = React.lazy(() => import('./pages/Workout'));
const Nutrition = React.lazy(() => import('./pages/Nutrition'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Quests = React.lazy(() => import('./pages/Quests'));
const GuildPage = React.lazy(() => import('./pages/Guild'));
const BodyAnalysis = React.lazy(() => import('./pages/BodyAnalysis'));

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication.
 * If user is not logged in, redirects to login page.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

/**
 * PublicRoute Component
 * 
 * For login/register pages - redirects to dashboard if already logged in.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * AppRoutes Component
 * 
 * Defines all the routes for the application.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quests"
        element={
          <ProtectedRoute>
            <Quests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guild"
        element={
          <ProtectedRoute>
            <GuildPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/body"
        element={
          <ProtectedRoute>
            <BodyAnalysis />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Main App Component
 * 
 * Wrapped with ErrorBoundary to catch runtime errors gracefully.
 * Uses React.lazy + Suspense for code-splitting (smaller initial bundle).
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <DataCacheProvider>
            <AppRoutes />
            <InstallPWA />
          </DataCacheProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
