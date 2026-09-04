import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthShell
      title="Create account"
      subtitle="Join your BCA coursemates and start sharing resources."
    >
      <SignupForm />
    </AuthShell>
  );
}
