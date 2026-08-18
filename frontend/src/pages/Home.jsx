import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import carService from '../services/carService';
import Loading from '../components/Loading';
import {
  Car,
  ShieldCheck,
  Zap,
  DollarSign,
  Calendar,
  Sparkles,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Key,
  Shield
} from 'lucide-react';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await carService.getAvailableCars();
        setFeaturedCars(data.slice(0, 6)); // Show top 6
      } catch (err) {
        console.error('Failed to load featured cars:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 4rem',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent 70%), var(--bg-main)',
          overflow: 'hidden'
        }}
      >
        <div className="container text-center" style={{ maxWidth: '1000px', position: 'relative', zIndex: 10 }}>
          {/* Badge */}
          <div
            className="flex items-center gap-2"
            style={{
              display: 'inline-flex',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.5rem',
              color: '#60A5FA',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <Sparkles size={16} />
            <span>Peer-to-Peer Private Car Sharing Marketplace</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#FFFFFF'
            }}
          >
            Rent a car from <span style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>local owners</span> or turn yours into income.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6
            }}
          >
            Discover verified private cars for weekends, road trips, or daily commutes with direct UPI payments and admin verification.
          </p>

          {/* Search Box Component */}
          <div style={{ maxWidth: '900px', margin: '0 auto 2rem' }}>
            <SearchBar />
          </div>

          {/* Trust Highlights */}
          <div className="flex items-center justify-center gap-6 flex-wrap" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>100% Vetted Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Instant UPI Reservations</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={18} style={{ color: '#FBBF24' }} />
              <span>Zero Hidden Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="flex items-end justify-between" style={{ marginBottom: '2.5rem' }}>
            <div>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Featured Fleet
              </p>
              <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Available Cars Near You</h2>
            </div>
            <Link to="/cars" className="btn btn-outline flex items-center gap-2">
              <span>View All Fleet</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <Loading message="Fetching featured cars..." />
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '3rem 1.5rem', background: 'var(--bg-surface-raised)' }}>
              <Car size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No approved cars available yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Be the first to list your private car and start earning!
              </p>
              <Link to="/owner/cars/add" className="btn btn-primary">
                List Your Car Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simple & Transparent
            </p>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>How DriveShare Works</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              Whether renting or sharing, the journey is smooth and secure from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="card card-hover" style={{ background: 'var(--bg-surface)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Find & Reserve</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Search available cars by location and dates. Pick your favourite car and place a 15-minute hold.
              </p>
            </div>

            <div className="card card-hover" style={{ background: 'var(--bg-surface)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-cyan-light)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Pay via UPI QR</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Scan the dynamic UPI QR with Google Pay, PhonePe or Paytm, and submit your UTR reference for instant verification.
              </p>
            </div>

            <div className="card card-hover" style={{ background: 'var(--bg-surface)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Check-In & Drive</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Meet the owner, inspect vehicle condition, tap "Check-In" on your phone, collect keys and hit the road.
              </p>
            </div>

            <div className="card card-hover" style={{ background: 'var(--bg-surface)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-purple-light)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Return & Review</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Return the car to the host. The host completes the booking, earnings are settled, and you leave a star review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Value Proposition Banner */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="container">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>
                For Car Owners
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                Turn your unused car days into steady income.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Private cars sit parked 95% of the time. Set your own availability schedule, set your price, and earn up to 85% of every completed trip with automated admin payouts.
              </p>

              <div className="flex flex-col gap-3" style={{ marginBottom: '2rem' }}>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
                  <span>You choose the available dates and daily rental price</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Admin verifies payments before any trip starts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Direct bank or UPI payout settlements upon trip completion</span>
                </div>
              </div>

              <Link to="/owner/cars/add" className="btn btn-primary btn-lg flex items-center gap-2" style={{ display: 'inline-flex' }}>
                <Key size={18} />
                <span>List Your Car Today</span>
              </Link>
            </div>

            <div className="card card-glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#FFFFFF' }}>Owner Earnings Potential</h3>
              <div className="flex flex-col gap-4">
                <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>Hatchback / Compact</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹1,500 - ₹2,500 / day</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekend rental ~ ₹15,000 / month</p>
                </div>

                <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>Mid-size Sedan / SUV</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹3,000 - ₹5,000 / day</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekend rental ~ ₹30,000 / month</p>
                </div>

                <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>Luxury / Premium Car</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹6,000 - ₹12,000+ / day</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekend rental ~ ₹60,000+ / month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="section">
        <div className="container text-center" style={{ maxWidth: '800px' }}>
          <Shield size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Built on Trust & Transparency</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Every car listing is manually reviewed and approved by administrators. Payments are held in platform escrow until check-in is complete, ensuring peace of mind for both hosts and renters.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/cars" className="btn btn-primary btn-lg">
              Explore Available Fleet
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Join DriveShare
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
