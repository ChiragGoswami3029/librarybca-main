import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';

// Pages
import Dashboard from '../pages/Dashboard';
import Browse from '../pages/Browse';
import FileDetails from '../pages/FileDetails';
import Upload from '../pages/Upload';
import MyUploads from '../pages/MyUploads';
import Notifications from '../pages/Notifications';
import FollowedSubjects from '../pages/FollowedSubjects';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function AppRouter() {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>
        Loading AcademicShare...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Home />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Signup />}
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="browse" element={<Browse />} />
        <Route path="files/:fileId" element={<FileDetails />} />
        <Route path="upload" element={<Upload />} />
        <Route path="my-uploads" element={<MyUploads />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="followed-subjects" element={<FollowedSubjects />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
