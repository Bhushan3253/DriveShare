import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        padding: '4rem 0 2rem'
      }}
    >
      <div className="container">
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '3rem' }}>
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Car size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Drive<span style={{ color: 'var(--primary)' }}>Share</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The premium peer-to-peer car sharing marketplace. Turn your unused car days into steady income, or rent vetted private vehicles in minutes.
            </p>
            <div className="flex items-center gap-2" style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} />
              <span>100% UPI & Admin Verified</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>Marketplace</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/cars" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Explore All Cars
                </Link>
              </li>
              <li>
                <Link to="/cars?type=SUV" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Rent SUVs
                </Link>
              </li>
              <li>
                <Link to="/cars?type=Luxury" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Luxury Collection
                </Link>
              </li>
              <li>
                <Link to="/cars?fuelType=Electric" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Electric Vehicles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Car Owners */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>Host / Car Owners</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/owner/cars/add" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  List Your Car
                </Link>
              </li>
              <li>
                <Link to="/owner" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner/earnings" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Earnings & Payouts
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Support */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>Safety & Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li className="flex items-center gap-2">
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Pan-India Coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>support@driveshare.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>+91 92849 40915</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex items-center justify-between flex-wrap gap-4"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}
        >
          <p>© {new Date().getFullYear()} DriveShare Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart size={14} style={{ color: 'var(--accent-rose)', fill: 'var(--accent-rose)' }} />
            <span>for seamless private car rentals.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
