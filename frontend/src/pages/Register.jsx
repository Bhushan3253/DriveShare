import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle, ArrowRight, Send, Sparkles } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.register(formData);
      setRegisteredEmail(formData.email.trim().toLowerCase());
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        'Registration failed. Email may already be registered.';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div className="container container-sm">
        <div className="card card-glass animate-slide-up" style={{ padding: '2.5rem 2rem' }}>
          {registeredEmail ? (
            /* Registration Success & Verification Instructions */
            <div className="text-center">
              <div
                style={{
                  width: '60px',
                  height: '60px',
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
                <Mail size={32} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#6EE7B7' }}>
                Verify Your Email
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                We have sent a verification link to: <br />
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{registeredEmail}</strong>
              </p>

              <div
                className="card"
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Next Steps:
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                  <li>Open your inbox and look for <strong>Verify your CarRental account</strong></li>
                  <li>Click the <strong>Verify Email</strong> button</li>
                  <li>Log in to your newly activated account!</li>
                </ol>
              </div>

              <Link to="/login" className="btn btn-primary btn-lg btn-block flex items-center justify-center gap-2">
                <span>Proceed to Login</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            /* Registration Form */
            <div>
              {/* Header */}
              <div className="text-center" style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary) 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 0 20px var(--primary-glow)'
                  }}
                >
                  <UserPlus size={24} />
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create an Account</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Join the DriveShare peer-to-peer car sharing community
                </p>
              </div>

              {error && (
                <div
                  className="card flex items-center gap-3"
                  style={{
                    background: 'var(--accent-rose-light)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    padding: '0.85rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem' }}>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <User size={14} style={{ color: 'var(--text-muted)' }} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
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
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <div className="text-center" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Already registered?{' '}
                  <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
