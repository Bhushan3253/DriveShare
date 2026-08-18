import React, { useState, useEffect } from 'react';
import payoutService from '../../services/payoutService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Building2
} from 'lucide-react';

const OwnerEarnings = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payoutService.getOwnerEarningsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching owner earnings summary:', err);
      setError('Unable to load earnings breakdown.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return <Loading message="Loading financial earnings & payouts..." fullScreen />;
  }

  if (error || !summary) {
    return (
      <div className="container section">
        <ErrorMessage message={error || 'Earnings ledger unavailable'} onRetry={fetchEarnings} />
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
          Revenue & Settlements
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Earnings & Payouts</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Complete transparent breakdown of total booking values, 15% platform fee, and 85% owner settlements
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Gross Bookings</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {formatCurrency(summary.totalBookingAmount || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            From {summary.completedTrips || 0} completed trips
          </span>
        </div>

        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Platform Commission (15%)</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {formatCurrency(summary.totalPlatformCommission || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Platform fee & insurance
          </span>
        </div>

        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Net Host Earnings (85%)</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            {formatCurrency(summary.totalOwnerEarnings || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total earned
          </span>
        </div>

        <div className="card card-glass">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pending Payout</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
            {formatCurrency(summary.pendingPayout || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Ready for admin transfer
          </span>
        </div>
      </div>

      {/* Payout Settlements Ledger */}
      <div className="card card-glass" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <Receipt size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payout Settlement History</h2>
        </div>

        {summary.payouts && summary.payouts.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Booking ID</th>
                  <th>Total Amount</th>
                  <th>Commission (15%)</th>
                  <th>Net Payout (85%)</th>
                  <th>Status</th>
                  <th>Reference / Note</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.payouts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        #{p.id.substring(Math.max(0, p.id.length - 8))}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        #{p.bookingId?.substring(Math.max(0, p.bookingId.length - 8))}
                      </span>
                    </td>
                    <td>{formatCurrency(p.totalAmount)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.platformCommission)}</td>
                    <td>
                      <strong style={{ color: 'var(--accent-emerald)' }}>
                        {formatCurrency(p.ownerEarning)}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {p.payoutReference || 'Pending transfer'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(p.processedAt || p.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <DollarSign size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>No payout records yet. Complete bookings to generate settlements.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerEarnings;
