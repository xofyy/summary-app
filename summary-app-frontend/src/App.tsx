import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Interests from './pages/Interests';
import SummaryDetail from './pages/SummaryDetail';
import Sources from './pages/Sources';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  
  // Use both token presence and authentication flag
  const isUserAuthenticated = isAuthenticated && !!token;
  
  console.log('🛡️ ProtectedRoute check:', { 
    isAuthenticated, 
    hasToken: !!token, 
    isUserAuthenticated,
    path: window.location.pathname
  });
  
  if (!isUserAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authentication passed, rendering protected content');
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Public Route component (redirect to home if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

function App() {
  const { setTheme, theme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on app start
    try {
      setTheme(theme);
    } catch (error) {
      console.warn('Failed to set theme:', error);
    }
  }, [setTheme, theme]);

  return (
    <ErrorBoundary>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/interests" element={
            <ProtectedRoute>
              <Interests />
            </ProtectedRoute>
          } />
          <Route path="/sources" element={
            <ProtectedRoute>
              <Sources />
            </ProtectedRoute>
          } />
          <Route path="/summary/:id" element={
            <ProtectedRoute>
              <SummaryDetail />
            </ProtectedRoute>
          } />

          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
