import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to upload and download BCA study material."
    >
      <LoginForm />
    </AuthShell>
  );
}
