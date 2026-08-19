import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import payoutService from '../../services/payoutService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payoutService.getAdminDashboard();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading admin analytics:', err);
      setError('Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loading message="Loading platform analytics & verification queues..." fullScreen />;
  }

  if (error || !analytics) {
    return (
      <div>
        <ErrorMessage message={error || 'Dashboard unavailable'} onRetry={fetchAnalytics} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            System Administrator
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Overview & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live platform metrics, commission revenue, and pending verification queues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/utr" className="btn btn-primary btn-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Verify Pending UTRs ({analytics.pendingPayments || 0})</span>
          </Link>
          <Link to="/admin/cars" className="btn btn-secondary btn-sm flex items-center gap-2">
            <Car size={16} />
            <span>Pending Cars ({analytics.pendingCars || 0})</span>
          </Link>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {/* Total GMV */}
        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
            Gross Booking Value (GMV)
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {formatCurrency(analytics.totalBookingValue || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            From verified bookings
          </span>
        </div>

        {/* Platform Revenue (15%) */}
        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
            Platform Revenue (15% Commission)
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            {formatCurrency(analytics.platformCommission || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Net platform commission
          </span>
        </div>

        {/* Owner Total Earnings */}
        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
            Owner Earnings (85%)
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {formatCurrency(analytics.ownerEarnings || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total host entitlements
          </span>
        </div>

        {/* Pending Payouts */}
        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
            Pending Host Payouts
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
            {formatCurrency(analytics.pendingPayoutAmount || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analytics.pendingPayouts || 0} transfers awaiting settlement
          </span>
        </div>
      </div>

      {/* Operations Counts Grid */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card card-glass flex items-center gap-4">
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Users</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{analytics.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="card card-glass flex items-center gap-4">
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan-light)', color: 'var(--accent-cyan)' }}>
            <Car size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet / Cars</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {analytics.approvedCars || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {analytics.totalCars || 0}</span>
            </h3>
          </div>
        </div>

        <div className="card card-glass flex items-center gap-4">
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Bookings</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{analytics.totalBookings || 0}</h3>
          </div>
        </div>

        <div className="card card-glass flex items-center gap-4">
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-amber-light)', color: '#FBBF24' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending UTRs</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>{analytics.pendingPayments || 0}</h3>
          </div>
        </div>
      </div>

      {/* Two Columns: Actionable Queues */}
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Pending Payments Queue */}
        <div className="card card-glass" style={{ padding: '1.75rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2">
              <CreditCard size={18} style={{ color: '#F59E0B' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pending UTR Verifications</h3>
            </div>
            <Link to="/admin/utr" className="btn btn-outline btn-sm flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {analytics.recentPendingPayments && analytics.recentPendingPayments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {analytics.recentPendingPayments.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>UTR: {p.utrNumber}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Booking #{p.bookingId?.substring(Math.max(0, p.bookingId.length - 6))}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-emerald)', opacity: 0.6 }} />
              <p style={{ fontSize: '0.85rem' }}>All submitted payments are verified!</p>
            </div>
          )}
        </div>

        {/* Pending Car Approvals */}
        <div className="card card-glass" style={{ padding: '1.75rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2">
              <Car size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pending Car Listings</h3>
            </div>
            <Link to="/admin/cars" className="btn btn-outline btn-sm flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {analytics.pendingCarApprovals && analytics.pendingCarApprovals.length > 0 ? (
            <div className="flex flex-col gap-3">
              {analytics.pendingCarApprovals.slice(0, 5).map((car) => (
                <div
                  key={car.id}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                      alt={car.model}
                      style={{ width: '45px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{car.brand} {car.model} ({car.year})</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{car.location}</p>
                    </div>
                  </div>

                  <span className="badge badge-pending">Needs Approval</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-emerald)', opacity: 0.6 }} />
              <p style={{ fontSize: '0.85rem' }}>No car listings waiting for moderation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
