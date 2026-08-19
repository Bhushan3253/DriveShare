import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import carService from '../../services/carService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, parseUtcDate } from '../../utils/formatters';
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingUTR, setSubmittingUTR] = useState(false);
  const [error, setError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // 15-Minute Countdown Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchBookingAndInitUPI = async () => {
      try {
        setLoading(true);
        setError('');

        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData?.carId) {
          const carData = await carService.getCarById(bookingData.carId);
          setCar(carData);
        }

        // Initialize or get UPI QR Session
        const upiData = await paymentService.createUPIPayment(bookingId);
        setPaymentSession(upiData);

        // Setup 15-minute expiration countdown (parse UTC timestamps properly)
        const expiresAtTime = bookingData.expiresAt
          ? parseUtcDate(bookingData.expiresAt).getTime()
          : parseUtcDate(bookingData.createdAt).getTime() + 15 * 60 * 1000;

        const diffSeconds = Math.max(0, Math.floor((expiresAtTime - Date.now()) / 1000));
        setTimeLeft(diffSeconds);

        if (bookingData.status === 'CANCELLED' || (diffSeconds <= 0 && bookingData.status === 'PAYMENT_PENDING')) {
          setIsExpired(true);
        } else {
          setIsExpired(false);
        }
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError('Failed to initialize payment session for this booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndInitUPI();
  }, [bookingId]);

  // Live Timer Countdown Interval
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          toast.warning('Your 15-minute booking reservation hold has expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired, toast]);

  const formatTimer = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const upiIdDisplay = paymentSession?.upiId || (paymentSession?.upiUri && paymentSession.upiUri.includes('pa=') ? (new URLSearchParams(paymentSession.upiUri.split('?')[1])).get('pa') : '') || '';

  const handleCopyUpi = (idToCopy) => {
    const id = idToCopy || upiIdDisplay;
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = (amount) => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    toast.success('Amount copied to clipboard!');
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleUTRSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError('Please enter the 12-digit UPI / UTR Transaction ID from your banking app.');
      return;
    }

    if (isExpired) {
      setError('This booking hold has expired. Please create a new reservation.');
      return;
    }

    try {
      setSubmittingUTR(true);
      setError('');
      await paymentService.submitUTR(paymentSession.paymentId, utrNumber.trim());
      toast.success('UTR submitted successfully! Awaiting admin verification.');
      navigate('/my-bookings', {
        state: { message: 'UTR submitted successfully! Payment is pending admin verification.' }
      });
    } catch (err) {
      console.error('Error submitting UTR:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to submit UTR.';
      setError(typeof msg === 'string' ? msg : 'Error submitting UTR.');
      toast.error('Failed to submit UTR.');
    } finally {
      setSubmittingUTR(false);
    }
  };

  if (loading) {
    return <Loading message="Generating secure UPI QR & payment session..." fullScreen />;
  }

  if (error && !booking) {
    return (
      <div className="container section">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="container-lg">
        {/* Header & Live Countdown Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
              Step 2 of 2: Complete Payment
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Scan & Pay via UPI</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Booking #{bookingId?.substring(Math.max(0, bookingId.length - 8))}
            </p>
          </div>

          {/* 15-Minute Countdown Indicator */}
          {!isExpired ? (
            <div
              className="flex items-center gap-3"
              style={{
                background: timeLeft < 180 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${timeLeft < 180 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Clock size={22} style={{ color: timeLeft < 180 ? 'var(--accent-rose)' : '#FBBF24' }} className={timeLeft < 180 ? 'animate-pulse' : ''} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Hold Reserved For
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: timeLeft < 180 ? 'var(--accent-rose)' : '#FBBF24', fontFamily: 'monospace' }}>
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                color: '#FCA5A5'
              }}
            >
              <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Reservation Hold Expired</span>
            </div>
          )}
        </div>

        {isExpired && (
          <div
            className="card flex items-center justify-between flex-wrap gap-4"
            style={{
              background: 'var(--accent-rose-light)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F87171' }}>15-Minute Booking Window Expired</h3>
              <p style={{ fontSize: '0.85rem', color: '#FCA5A5', marginTop: '0.25rem' }}>
                Your temporary hold on this vehicle has timed out. Please return to the fleet and book again.
              </p>
            </div>
            <Link to="/cars" className="btn btn-primary btn-sm flex items-center gap-1">
              <RotateCcw size={14} />
              <span>Browse Fleet</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 items-start">
          {/* Left Column: Dynamic UPI QR Code & Instructions */}
          <div className="card card-glass" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <QrCode size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Scan QR with any UPI App</h2>
            </div>

            {/* Dynamic QR Display */}
            <div className="flex justify-center" style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  display: 'inline-block',
                  textAlign: 'center',
                  opacity: isExpired ? 0.4 : 1
                }}
              >
                {paymentSession?.qrCode ? (
                  <img
                    src={`data:image/png;base64,${paymentSession.qrCode}`}
                    alt="UPI QR Code"
                    style={{ width: '220px', height: '220px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '220px', height: '220px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    Generating QR...
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', color: '#1F2937', fontWeight: 700, fontSize: '0.85rem' }}>
                  GPay • PhonePe • Paytm • BHIM
                </div>
              </div>
            </div>

            {/* Amount & Copy Details */}
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Exact Amount:</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {formatCurrency(paymentSession?.amount || booking?.totalAmount || 0)}
                  </span>
                  <button
                    onClick={() => handleCopyAmount(paymentSession?.amount || booking?.totalAmount || 0)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {upiIdDisplay && (
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>UPI ID:</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {upiIdDisplay}
                    </span>
                    <button
                      onClick={() => handleCopyUpi(upiIdDisplay)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile UPI Intent Button */}
            {paymentSession?.upiUri && !isExpired && (
              <a
                href={paymentSession.upiUri}
                className="btn btn-secondary btn-block flex items-center justify-center gap-2"
                style={{ marginBottom: '1rem' }}
              >
                <Smartphone size={16} />
                <span>Open in Installed UPI App</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Right Column: Step-by-Step Instructions & UTR Submission */}
          <div className="flex flex-col gap-6">
            {/* Step-by-Step Guide */}
            <div className="card card-glass" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>How to Pay</h3>
              <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                <li>Open Google Pay, PhonePe, Paytm, or your banking app.</li>
                <li>Scan the QR code or click <strong>Open in Installed UPI App</strong>.</li>
                <li>Verify payee name shows <strong>DriveShare Private Rentals</strong>.</li>
                <li>Complete payment and copy the <strong>12-digit UTR / Reference Number</strong>.</li>
                <li>Enter the UTR below to confirm your booking reservation.</li>
              </ol>
            </div>

            {/* UTR Input Form */}
            <div className="card card-glass" style={{ padding: '2rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <ShieldCheck size={22} style={{ color: 'var(--accent-emerald)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Submit 12-Digit UTR Number</h3>
              </div>

              {error && <ErrorMessage message={error} />}

              <form onSubmit={handleUTRSubmit}>
                <div className="form-group">
                  <label className="form-label">UPI Reference / UTR Number *</label>
                  <input
                    type="text"
                    required
                    disabled={isExpired || submittingUTR}
                    maxLength={22}
                    className="form-input"
                    placeholder="e.g. 423589127890"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    style={{ fontSize: '1.05rem', letterSpacing: '0.05em', fontFamily: 'monospace' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                    Usually a 12-digit reference number found in your payment receipt.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingUTR || isExpired}
                  className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                  style={{ marginTop: '1.5rem' }}
                >
                  {submittingUTR ? (
                    <span>Submitting UTR...</span>
                  ) : (
                    <>
                      <span>Submit Payment Verification</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
