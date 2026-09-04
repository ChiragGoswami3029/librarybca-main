import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await signup(name.trim(), normalizedEmail, password);
      setSuccessMessage(res?.message || 'Account created. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err?.status === 409) {
        setErrorMessage('Email is already registered. Please log in instead.');
      } else if (err?.status === 0) {
        setErrorMessage('Unable to connect to the server. Please make sure the backend is running and try again.');
      } else {
        setErrorMessage(err?.message || 'Unable to create your account. Please check your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMessage} Redirecting to login...</span>
        </div>
      )}

      {/* Full Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor="signup-name"
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          Full name <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <User
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            id="signup-name"
            type="text"
            placeholder="Chirag Goswami"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || Boolean(successMessage)}
            required
            className="glass-input"
            style={{ paddingLeft: '36px', height: '42px' }}
            autoComplete="name"
          />
        </div>
      </div>

      {/* Email Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor="signup-email"
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          Email address <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            id="signup-email"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || Boolean(successMessage)}
            required
            className="glass-input"
            style={{ paddingLeft: '36px', height: '42px' }}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor="signup-password"
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          Password <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || Boolean(successMessage)}
            required
            className="glass-input"
            style={{ paddingLeft: '36px', height: '42px' }}
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={Boolean(successMessage)}
        icon={UserPlus}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        Create Account
      </Button>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 700 }}>
          Sign in
        </Link>
      </div>
    </form>
  );
}
