import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle2, XCircle, Mail, ArrowRight, RefreshCw, Send, ShieldCheck } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Resend State
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setErrorMsg('No verification token provided in URL.');
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');
        const res = await authService.verifyEmail(token);

        if (res.status === 'ALREADY_VERIFIED') {
          setAlreadyVerified(true);
          toast.info('Your email was already verified!');
        } else {
          setSuccess(true);
          toast.success('Email verified successfully!');
        }
      } catch (err) {
        console.error('Email verification error:', err);
        const msg = err.response?.data?.message || err.response?.data?.error || 'This verification link is invalid or has expired.';
        setErrorMsg(typeof msg === 'string' ? msg : 'Verification failed.');
        toast.error('Verification failed. Token may be expired.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.warning('Please enter your registration email.');
      return;
    }

    try {
      setResending(true);
      const res = await authService.resendVerification(resendEmail.trim());
      setResendSuccess(true);
      toast.success(res.message || 'New verification email sent!');
    } catch (err) {
      console.error('Resend error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to resend verification email.';
      toast.error(typeof msg === 'string' ? msg : 'Error resending email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container section flex justify-center items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="container-sm">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '2rem 1rem' }}>
              <Loading message="Verifying your email address..." />
            </div>
          ) : success || alreadyVerified ? (
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#6EE7B7' }}>
                {alreadyVerified ? 'Email Already Verified!' : 'Email Verified Successfully!'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Your account is activated and ready. You can now log in to explore available cars or manage your host listings.
              </p>

              <Link to="/login" className="btn btn-primary btn-lg flex items-center justify-center gap-2">
                <span>Proceed to Login</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-rose-light)',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <XCircle size={36} />
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#F87171' }}>
                Verification Failed
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {errorMsg || 'This verification link is invalid or has expired.'}
              </p>

              {/* Resend Verification Form */}
              <div
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginTop: '1.5rem',
                  textAlign: 'left'
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={16} style={{ color: 'var(--primary)' }} />
                  Request a New Verification Link
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Enter your email address to receive a fresh 30-minute verification link.
                </p>

                {resendSuccess ? (
                  <div className="card" style={{ background: 'var(--accent-emerald-light)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6EE7B7', padding: '0.75rem', fontSize: '0.85rem' }}>
                    A new verification link has been sent to your email. Please check your inbox!
                  </div>
                ) : (
                  <form onSubmit={handleResend}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="your-registered-email@example.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resending}
                      className="btn btn-secondary btn-block flex items-center justify-center gap-1.5"
                    >
                      <Send size={14} />
                      <span>{resending ? 'Sending Email...' : 'Resend Verification Email'}</span>
                    </button>
                  </form>
                )}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
