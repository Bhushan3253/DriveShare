import React, { useState, useEffect } from 'react';
import payoutService from '../../services/payoutService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Receipt,
  Building2
} from 'lucide-react';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Process Payout Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payoutService.getAllPayouts();
      setPayouts(data || []);
    } catch (err) {
      console.error('Error fetching admin payouts:', err);
      setError('Unable to load payout records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleFilterChange = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const openProcessModal = (payout) => {
    setSelectedPayout(payout);
    setReference('UPI_' + Date.now().toString().slice(-8));
    setNotes('');
    setModalOpen(true);
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayout) return;

    try {
      setProcessing(true);
      const updated = await payoutService.processPayout(selectedPayout.id, reference, notes);
      setPayouts(payouts.map((p) => (p.id === selectedPayout.id ? updated : p)));
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payout.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const paginatedPayouts = filteredPayouts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Owner Payout Settlements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Disburse 85% host shares for completed bookings after 15% platform commission deduction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" style={{ background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'PENDING', 'PROCESSED', 'FAILED'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`btn btn-sm ${filter === tab ? 'btn-primary' : ''}`}
                style={{
                  background: filter === tab ? undefined : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem'
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button onClick={fetchPayouts} className="btn btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPayouts} />}

      {loading ? (
        <Loading message="Fetching payout ledgers..." />
      ) : filteredPayouts.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Booking Ref</th>
                  <th>Host ID</th>
                  <th>Gross GMV</th>
                  <th>Fee (15%)</th>
                  <th>Net Payout (85%)</th>
                  <th>Status</th>
                  <th>Settled Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayouts.map((p) => {
                  const gross = p.amount + (p.platformFee || 0);
                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          #{p.id.substring(Math.max(0, p.id.length - 8))}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          #{p.bookingId?.substring(Math.max(0, p.bookingId.length - 8))}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          #{p.ownerId?.substring(Math.max(0, p.ownerId.length - 6))}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatCurrency(gross)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--accent-amber)', fontSize: '0.85rem' }}>
                          {formatCurrency(p.platformFee || 0)}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>
                          {formatCurrency(p.amount)}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.processedAt ? formatDateTime(p.processedAt) : 'Pending Settlement'}
                      </td>
                      <td>
                        <div className="flex justify-end">
                          {p.status === 'PENDING' ? (
                            <button
                              onClick={() => openProcessModal(p)}
                              className="btn btn-primary btn-sm flex items-center gap-1"
                            >
                              <Send size={13} />
                              <span>Settle Payout</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Ref: {p.transactionReference || 'N/A'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPayouts.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <DollarSign size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No payouts found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No payouts matching this status filter.
          </p>
        </div>
      )}

      {/* Process Payout Modal */}
      {modalOpen && selectedPayout && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Settle Host Payout
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Confirm fund transfer to vehicle host for booking #{selectedPayout.bookingId?.substring(Math.max(0, selectedPayout.bookingId.length - 8))}.
            </p>

            <div
              className="card"
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Transfer Amount:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {formatCurrency(selectedPayout.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Platform Commission Retained (15%):</span>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                  {formatCurrency(selectedPayout.platformFee || 0)}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessSubmit}>
              <div className="form-group">
                <label className="form-label">Transaction / Bank Reference *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. IMPS/UPI reference number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Notes (Optional)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="e.g. Transferred via HDFC Bank UPI..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-success flex items-center gap-1"
                >
                  <CheckCircle2 size={16} />
                  <span>{processing ? 'Processing...' : 'Mark as Settled'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
