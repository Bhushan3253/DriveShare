import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  User,
  Mail,
  Phone,
  Shield,
  Car,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  FileCheck,
  ExternalLink,
  Save,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // DL Form State
  const [dlNumber, setDlNumber] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [dlFile, setDlFile] = useState(null);
  const [dlPreview, setDlPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      if (data.drivingLicenseNumber) {
        setDlNumber(data.drivingLicenseNumber);
      }
      if (data.drivingLicenseExpiry) {
        setDlExpiry(data.drivingLicenseExpiry);
      }
      if (data.drivingLicenseUrl) {
        setDlPreview(data.drivingLicenseUrl);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDlFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDlPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!dlNumber) {
      toast.error('Please enter your Driving License number.');
      return;
    }
    if (!dlFile && !profile?.drivingLicenseUrl) {
      toast.error('Please upload a photo of your Driving License.');
      return;
    }

    try {
      setUploading(true);
      const updated = await userService.submitDrivingLicense(dlFile, dlNumber, dlExpiry);
      setProfile(updated);
      setDlFile(null);
      toast.success('Driving license submitted for admin verification!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit driving license.');
    } finally {
      setUploading(false);
    }
  };

  const kycStatus = profile?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="container section">
      <div className="container-md">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          {/* Profile Header */}
          <div className="flex items-center gap-4" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--primary-glow)'
              }}
            >
              {profile?.name?.charAt(0)?.toUpperCase() || authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{profile?.name || authUser?.name}</h1>
              <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                <span className="badge badge-purple">
                  {profile?.role || authUser?.role} ACCOUNT
                </span>
                {kycStatus === 'VERIFIED' && (
                  <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
                    ✓ VERIFIED DRIVER
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Overview Grid */}
          <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>Email Address</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{profile?.email || authUser?.email || 'N/A'}</p>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>Account Status</span>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontWeight: 600, color: '#6EE7B7' }}>Active & Good Standing</span>
              </div>
            </div>
          </div>

          {/* DRIVER KYC / DRIVING LICENSE SECTION */}
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <FileCheck size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Driver License & KYC Verification</h3>
              </div>

              {/* Status Badge */}
              <div>
                {kycStatus === 'VERIFIED' && (
                  <span className="badge badge-approved" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    ✓ Approved Driver
                  </span>
                )}
                {kycStatus === 'PENDING_VERIFICATION' && (
                  <span className="badge badge-pending" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    ⏳ Under Admin Review
                  </span>
                )}
                {kycStatus === 'REJECTED' && (
                  <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    ✕ Verification Rejected
                  </span>
                )}
                {kycStatus === 'NOT_SUBMITTED' && (
                  <span className="badge badge-inactive" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    Not Submitted
                  </span>
                )}
              </div>
            </div>

            {/* Rejection Alert */}
            {kycStatus === 'REJECTED' && profile?.kycRejectionReason && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  color: 'var(--accent-rose)',
                  fontSize: '0.85rem'
                }}
              >
                <strong>Admin Note:</strong> {profile.kycRejectionReason}. Please update your details or re-upload a clear document.
              </div>
            )}

            {kycStatus === 'VERIFIED' ? (
              <div className="grid grid-cols-3 gap-4" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>License Number</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                    {profile.drivingLicenseNumber}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Expiry Date</span>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {profile.drivingLicenseExpiry ? formatDate(profile.drivingLicenseExpiry) : 'Standard Valid'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>Verified & Eligible to Drive</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit}>
                <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Driving License Number *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. DL-1420110012345"
                      value={dlNumber}
                      onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">License Expiration Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dlExpiry}
                      onChange={(e) => setDlExpiry(e.target.value)}
                    />
                  </div>
                </div>

                {/* DL Photo Upload */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Upload Driving License Photo / Scan *</label>
                  <div className="flex items-start gap-4">
                    <label
                      className="btn btn-secondary btn-sm flex items-center gap-2 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <Upload size={14} />
                      <span>{dlPreview ? 'Change Photo' : 'Select Photo'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </label>

                    {dlPreview && (
                      <div style={{ width: '120px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', border: '1px solid var(--border-subtle)' }}>
                        <img src={dlPreview} alt="DL Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                    Accepted formats: JPG, PNG, WEBP. Ensure the license number and your photo are clearly legible.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{uploading ? 'Uploading & Submitting...' : 'Submit for Driver Verification'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Host CTA */}
          <div
            className="card flex items-center justify-between flex-wrap gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <Car size={28} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Host on DriveShare</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Earn money sharing your idle car with verified drivers
                </p>
              </div>
            </div>

            <Link to="/owner/cars/add" className="btn btn-primary btn-sm">
              List Your Car
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

