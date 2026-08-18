import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import ErrorMessage from '../components/ErrorMessage';
import { LogIn, ArrowRight, Lock, Mail, Shield, UserCheck, Key, Sparkles, Send, AlertTriangle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState('');
  const [resendVerificationToken, setResendVerificationToken] = useState('');
  const [resendActivating, setResendActivating] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
      setUnverifiedEmail('');
      setResendStatusMsg('');
      setResendVerificationToken('');
    }
  };

  const handleLoginSubmit = async (email, password) => {
    try {
      const data = await login({ email, password });

      toast.success(`Welcome back, ${data.name || 'Driver'}!`);

      if (data.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (data.role === 'OWNER') {
        navigate('/owner', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid email or password.';
      const msgStr = typeof msg === 'string' ? msg : 'Login failed.';

      if (msgStr.includes('EMAIL_NOT_VERIFIED') || msgStr.toLowerCase().includes('verify your email')) {
        setUnverifiedEmail(email);
        setError('Please verify your email before logging in.');
        toast.warning('Please verify your email address.');
      } else {
        setError(msgStr);
        toast.error(msgStr);
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUnverifiedEmail('');
      setResendStatusMsg('');
      setResendVerificationToken('');
      await handleLoginSubmit(formData.email, formData.password);
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleResendForUnverified = async () => {
    if (!unverifiedEmail) return;
    try {
      setResending(true);
      setResendStatusMsg('');
      const res = await authService.resendVerification(unverifiedEmail);
      setResendStatusMsg('✓ ' + (res.message || 'Verification link sent to your email!'));
      if (res?.verificationToken) {
        setResendVerificationToken(res.verificationToken);
      }
      toast.success(res.message || 'Verification link sent to your email!');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to resend verification email.';
      setResendStatusMsg(errMsg);
      toast.warning(errMsg);
    } finally {
      setResending(false);
    }
  };

  const handleResendActivate = async () => {
    if (!resendVerificationToken) return;
    try {
      setResendActivating(true);
      await authService.verifyEmail(resendVerificationToken);
      toast.success('Email verified successfully! Logging you in...');
      setUnverifiedEmail('');
      await handleLoginSubmit(formData.email, formData.password);
    } catch (err) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setResendActivating(false);
    }
  };

  // 1-Click Fast Demo Login Handler
  const handleQuickDemoLogin = async (roleName, demoEmail, demoPass) => {
    try {
      setDemoLoading(roleName);
      setError('');
      setUnverifiedEmail('');
      setResendStatusMsg('');
      await handleLoginSubmit(demoEmail, demoPass);
    } catch (err) {
      // handled
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="container section flex justify-center items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="container-sm">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 0 24px var(--primary-glow)'
              }}
            >
              <LogIn size={26} />
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Log in to your DriveShare account to manage reservations & fleet
            </p>
          </div>

          {/* Quick Demo Switcher Section */}
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div className="flex items-center gap-1.5" style={{ marginBottom: '0.75rem', color: '#FBBF24', fontSize: '0.8rem', fontWeight: 700 }}>
              <Sparkles size={14} />
              <span>1-CLICK DEMO LOGIN (PRE-VERIFIED)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={demoLoading !== null || loading}
                onClick={() => handleQuickDemoLogin('RENTER', 'renter@driveshare.com', 'password123')}
                className="btn btn-secondary btn-sm flex flex-col items-center justify-center gap-1"
                style={{ padding: '0.6rem 0.3rem', fontSize: '0.75rem' }}
              >
                <UserCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>{demoLoading === 'RENTER' ? 'Loading...' : 'Renter'}</span>
              </button>

              <button
                type="button"
                disabled={demoLoading !== null || loading}
                onClick={() => handleQuickDemoLogin('OWNER', 'owner@driveshare.com', 'password123')}
                className="btn btn-secondary btn-sm flex flex-col items-center justify-center gap-1"
                style={{ padding: '0.6rem 0.3rem', fontSize: '0.75rem' }}
              >
                <Key size={16} style={{ color: 'var(--primary)' }} />
                <span>{demoLoading === 'OWNER' ? 'Loading...' : 'Host / Owner'}</span>
              </button>

              <button
                type="button"
                disabled={demoLoading !== null || loading}
                onClick={() => handleQuickDemoLogin('ADMIN', 'admin@driveshare.com', 'admin123')}
                className="btn btn-secondary btn-sm flex flex-col items-center justify-center gap-1"
                style={{ padding: '0.6rem 0.3rem', fontSize: '0.75rem' }}
              >
                <Shield size={16} style={{ color: '#F59E0B' }} />
                <span>{demoLoading === 'ADMIN' ? 'Loading...' : 'Admin'}</span>
              </button>
            </div>
          </div>

          {/* Unverified Email Warning Banner with 1-click Resend */}
          {unverifiedEmail && (
            <div
              className="card"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}
            >
              <div className="flex items-center gap-2" style={{ color: '#FBBF24', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} />
                <span>Email Verification Required</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                Account <strong>{unverifiedEmail}</strong> is not verified yet. Check your inbox or request a new link below.
              </p>

              {resendStatusMsg ? (
                <div>
                  <div style={{ color: resendStatusMsg.startsWith('✓') ? '#6EE7B7' : '#FBBF24', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {resendStatusMsg}
                  </div>
                  {resendVerificationToken && (
                    <button
                      type="button"
                      onClick={handleResendActivate}
                      disabled={resendActivating}
                      className="btn btn-primary btn-sm flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>{resendActivating ? 'Activating...' : '⚡ Verify & Login Now (1-Click)'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendForUnverified}
                  disabled={resending}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{resending ? 'Sending Link...' : 'Resend Verification Email'}</span>
                </button>
              )}
            </div>
          )}

          {error && !unverifiedEmail && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                <Mail size={14} style={{ color: 'var(--primary)' }} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                <Lock size={14} style={{ color: 'var(--primary)' }} />
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading !== null}
              className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
