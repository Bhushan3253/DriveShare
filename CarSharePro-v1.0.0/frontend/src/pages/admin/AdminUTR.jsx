import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const AdminUTR = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await paymentService.getPendingPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching pending UTRs:', err);
      setError('Unable to load pending UTR payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleCopyUTR = (utr, id) => {
    navigator.clipboard.writeText(utr);
    setCopiedId(id);
    toast.success(`UTR ${utr} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerify = async (paymentId) => {
    try {
      setProcessingId(paymentId);
      await paymentService.verifyPayment(paymentId);
      setPayments(payments.filter((p) => p.id !== paymentId));
      toast.success('Payment verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (paymentId) => {
    setRejectPaymentId(paymentId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectPaymentId || !rejectReason) return;

    try {
      setProcessingId(rejectPaymentId);
      await paymentService.rejectPayment(rejectPaymentId, rejectReason);
      setPayments(payments.filter((p) => p.id !== rejectPaymentId));
      setRejectModalOpen(false);
      toast.warning('Payment has been rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const paginatedPayments = payments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>UTR Payment Verifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Verify submitted UPI 12-digit UTR transaction numbers against merchant banking records
          </p>
        </div>

        <button onClick={fetchPendingPayments} className="btn btn-secondary btn-sm flex items-center gap-1.5">
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPendingPayments} />}

      {loading ? (
        <Loading message="Checking pending UTR submissions..." />
      ) : payments.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Amount</th>
                  <th>Submitted UTR</th>
                  <th>UPI / VPA</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        #{p.bookingId?.substring(Math.max(0, p.bookingId.length - 8))}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)' }}>
                        {formatCurrency(p.amount)}
                      </strong>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <code
                          style={{
                            background: 'var(--bg-surface-raised)',
                            padding: '0.3rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                          }}
                        >
                          {p.utrNumber || 'N/A'}
                        </code>
                        {p.utrNumber && (
                          <button
                            onClick={() => handleCopyUTR(p.utrNumber, p.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}
                            title="Copy UTR"
                          >
                            {copiedId === p.id ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {p.upiId || '-'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDateTime(p.utrSubmittedAt || p.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerify(p.id)}
                          disabled={processingId === p.id}
                          className="btn btn-success btn-sm flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          <span>Verify</span>
                        </button>

                        <button
                          onClick={() => openRejectModal(p.id)}
                          disabled={processingId === p.id}
                          className="btn btn-outline btn-sm flex items-center gap-1"
                          style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={payments.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <ShieldCheck size={48} style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Pending UTR Verifications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            All renter payments are verified and up to date!
          </p>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Reject UPI Payment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Please provide the reason for payment rejection.
            </p>

            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="e.g. UTR not found in bank statement, amount mismatch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectPaymentId}
                  className="btn btn-danger"
                >
                  {processingId === rejectPaymentId ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUTR;
