import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import payoutService from '../../services/payoutService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Car,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Key
} from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payoutService.getOwnerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
      setError('Failed to load owner dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading message="Loading host analytics..." fullScreen />;
  }

  if (error || !dashboard) {
    return (
      <div className="container section">
        <ErrorMessage message={error || 'Dashboard unavailable'} onRetry={fetchDashboard} />
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
            Host Control Center
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Overview of your fleet performance, active rentals, and earnings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/owner/earnings" className="btn btn-secondary flex items-center gap-2">
            <DollarSign size={16} />
            <span>View Earnings</span>
          </Link>
          <Link to="/owner/cars/add" className="btn btn-primary flex items-center gap-2">
            <PlusCircle size={16} />
            <span>Add New Car</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        {/* Total Earnings */}
        <div className="card card-glass">
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Total Earnings (85%)
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {formatCurrency(dashboard.ownerEarnings || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            From {formatCurrency(dashboard.totalBookingValue || 0)} total reservations
          </span>
        </div>

        {/* Pending Payout */}
        <div className="card card-glass">
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Pending Payout
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-amber-light)', color: '#FBBF24' }}>
              <Clock size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24' }}>
            {formatCurrency(dashboard.pendingPayout || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Awaiting admin settlement
          </span>
        </div>

        {/* Total Fleet */}
        <div className="card card-glass">
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Total Fleet / Cars
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Car size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{dashboard.totalCars || 0}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {dashboard.availableCars || 0} approved & active
          </span>
        </div>

        {/* Completed Trips */}
        <div className="card card-glass">
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Completed Rentals
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{dashboard.completedRentals || 0}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {dashboard.activeRentals || 0} currently active
          </span>
        </div>
      </div>

      {/* Two Columns: Recent Bookings & Fleet Overview */}
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Recent Bookings */}
        <div className="card card-glass" style={{ padding: '1.75rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Trip Requests</h3>
            <Link to="/owner/bookings" className="btn btn-outline btn-sm flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {dashboard.recentBookings && dashboard.recentBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dashboard.recentBookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        #{b.id.substring(Math.max(0, b.id.length - 6))}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {formatDate(b.startDate)} - {formatDate(b.endDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {formatCurrency(b.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <CalendarCheck size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No recent bookings for your vehicles.</p>
            </div>
          )}
        </div>

        {/* My Fleet Quick View */}
        <div className="card card-glass" style={{ padding: '1.75rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Vehicle Fleet</h3>
            <Link to="/owner/cars" className="btn btn-outline btn-sm flex items-center gap-1">
              <span>Manage Fleet</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {dashboard.cars && dashboard.cars.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dashboard.cars.slice(0, 5).map((car) => (
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
                      style={{ width: '50px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{car.brand} {car.model}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCurrency(car.pricePerDay)}/day</span>
                    </div>
                  </div>

                  <StatusBadge status={car.status} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Car size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>No cars listed in your fleet yet.</p>
              <Link to="/owner/cars/add" className="btn btn-primary btn-sm">
                + Add Your First Car
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
