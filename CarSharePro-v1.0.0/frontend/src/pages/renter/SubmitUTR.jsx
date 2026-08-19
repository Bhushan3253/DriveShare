import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import ErrorMessage from '../../components/ErrorMessage';
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

const SubmitUTR = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [paymentId, setPaymentId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError('Please enter the UTR number.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // If paymentId not provided in route, initialize/lookup payment
      let targetPaymentId = paymentId;
      if (!targetPaymentId) {
        const payRes = await paymentService.createUPIPayment(bookingId);
        targetPaymentId = payRes.paymentId;
      }

      await paymentService.submitUTR(targetPaymentId, utrNumber.trim());
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('UTR submit error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to submit UTR.';
      setError(typeof msg === 'string' ? msg : 'UTR submission error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="container-sm">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Submit Payment UTR</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Enter the 12-digit transaction UTR reference for Booking #{bookingId?.substring(Math.max(0, bookingId.length - 8))}
          </p>

          {error && <ErrorMessage message={error} />}

          {success ? (
            <div className="card text-center" style={{ background: 'var(--accent-emerald-light)', borderColor: 'rgba(16, 185, 129, 0.3)', padding: '2rem' }}>
              <ShieldCheck size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#6EE7B7' }}>Payment Submitted!</h3>
              <p style={{ color: '#A7F3D0', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Admin is verifying your transaction. Redirecting...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">UPI Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 423589123456"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? <span>Submitting...</span> : <><span>Submit Payment</span><ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitUTR;
