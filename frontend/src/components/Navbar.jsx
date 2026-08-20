import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  Car,
  Compass,
  MapPin,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  PlusCircle,
  Users,
  CreditCard,
  CheckCircle,
  Star,
  ChevronDown,
  Smartphone
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = hasRole('ADMIN');
  const isOwner = hasRole('OWNER');

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      style={{
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        height: '72px'
      }}
    >
      <div className="container flex items-center justify-between" style={{ height: '100%' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={closeMobile}
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--primary-glow)',
              color: '#FFFFFF'
            }}
          >
            <Car size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Drive<span style={{ color: 'var(--primary)' }}>Share</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="flex items-center gap-6" style={{ display: 'none' }} id="desktop-nav-links">
          {/* Dynamically enabled on desktop via CSS */}
        </div>

        {/* Desktop Main Navigation */}
        <div className="desktop-only flex items-center gap-1">
          {/* Common Links */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/cars"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Find Cars
          </NavLink>

          <NavLink
            to="/nearby"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={{ color: 'var(--accent-cyan)' }}
          >
            <Compass size={15} style={{ marginRight: '4px' }} />
            Nearby Map
          </NavLink>

          {/* Renter Specific Links */}
          {isAuthenticated && !isAdmin && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              My Bookings
            </NavLink>
          )}

          {/* Owner Quick Access */}
          {isAuthenticated && isOwner && !isAdmin && (
            <>
              <NavLink
                to="/owner"
                end
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Owner Portal
              </NavLink>
              <NavLink
                to="/owner/cars/add"
                className="btn btn-primary btn-sm flex items-center gap-1"
                style={{ marginLeft: '0.5rem' }}
              >
                <PlusCircle size={15} />
                List Your Car
              </NavLink>
            </>
          )}

          {/* Admin Navigation */}
          {isAuthenticated && isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              style={{ color: '#F59E0B' }}
            >
              <Shield size={16} />
              Admin Portal
            </NavLink>
          )}
        </div>

        {/* Right Section: Auth & Notifications */}
        <div className="desktop-only flex items-center gap-3">
          {/* Download App CTA */}
          <a
            href="/driveshare.apk"
            download="DriveShare.apk"
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            style={{
              borderRadius: 'var(--radius-full)',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60A5FA',
              textDecoration: 'none',
              padding: '0.35rem 0.85rem'
            }}
            title="Download Android APK"
          >
            <Smartphone size={14} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Get App</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>APK</span>
          </a>

          {isAuthenticated ? (
            <>
              <NotificationBell />

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem' }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {userMenuOpen && (
                  <div
                    className="card card-glass animate-slide-up"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      padding: '0.5rem',
                      zIndex: 1000,
                      boxShadow: 'var(--shadow-xl)'
                    }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div style={{ padding: '0.75rem 0.75rem 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                      <span className="badge badge-purple" style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}>
                        {user?.role}
                      </span>
                    </div>

                    <div style={{ padding: '0.25rem 0' }}>
                      <Link to="/profile" className="dropdown-item">
                        <User size={16} />
                        Profile Settings
                      </Link>

                      {isOwner && (
                        <>
                          <Link to="/owner" className="dropdown-item">
                            <LayoutDashboard size={16} />
                            Owner Dashboard
                          </Link>
                          <Link to="/owner/cars" className="dropdown-item">
                            <Car size={16} />
                            My Cars
                          </Link>
                          <Link to="/owner/earnings" className="dropdown-item">
                            <DollarSign size={16} />
                            Earnings & Payouts
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item" style={{ color: '#FBBF24' }}>
                          <Shield size={16} />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="dropdown-item"
                        style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-subtle)', marginTop: '0.25rem' }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="mobile-only flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          className="mobile-nav-drawer animate-slide-up"
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: 'calc(100vh - 72px)',
            backgroundColor: '#0B0F19',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '1.25rem 1rem 3.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxSizing: 'border-box'
          }}
          onClick={(e) => {
            if (e.target.tagName === 'A' || e.target.closest('button')) {
              closeMobile();
            }
          }}
        >
          {/* Main Discovery */}
          <NavLink to="/" end className="mobile-nav-link">
            <Car size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>Home Marketplace</span>
          </NavLink>
          <NavLink to="/cars" className="mobile-nav-link">
            <Car size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <span>Browse All Cars</span>
          </NavLink>
          <NavLink to="/nearby" className="mobile-nav-link">
            <Compass size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>Nearby Map Discovery</span>
          </NavLink>
          <a
            href="/driveshare.apk"
            download="DriveShare.apk"
            className="mobile-nav-link"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#60A5FA'
            }}
          >
            <Smartphone size={18} style={{ color: '#60A5FA', flexShrink: 0 }} />
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <span>Download Android App</span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                APK v1.0
              </span>
            </div>
          </a>

          {isAuthenticated ? (
            <>
              {/* Renter Section */}
              <div className="mobile-nav-header" style={{ marginTop: '0.75rem' }}>
                <span>Renter Portal</span>
              </div>
              <NavLink to="/my-bookings" className="mobile-nav-link">
                <CalendarCheck size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <span>My Bookings & Trips</span>
              </NavLink>
              <NavLink to="/profile" className="mobile-nav-link">
                <User size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span>My Profile & Settings</span>
              </NavLink>

              {/* Owner Section */}
              {isOwner && (
                <>
                  <div className="mobile-nav-header" style={{ marginTop: '0.75rem' }}>
                    <span>Host / Owner Portal</span>
                  </div>
                  <NavLink to="/owner" end className="mobile-nav-link">
                    <LayoutDashboard size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>Owner Dashboard</span>
                  </NavLink>
                  <NavLink to="/owner/cars" className="mobile-nav-link">
                    <Car size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                    <span>My Fleet / Cars</span>
                  </NavLink>
                  <NavLink to="/owner/cars/add" className="mobile-nav-link">
                    <PlusCircle size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <span>+ List New Car</span>
                  </NavLink>
                  <NavLink to="/owner/bookings" className="mobile-nav-link">
                    <CalendarCheck size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                    <span>Owner Reservations</span>
                  </NavLink>
                  <NavLink to="/owner/earnings" className="mobile-nav-link">
                    <DollarSign size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <span>Earnings & Payouts</span>
                  </NavLink>
                </>
              )}

              {/* Admin Section */}
              {isAdmin && (
                <>
                  <div className="mobile-nav-header" style={{ marginTop: '0.75rem', color: '#F59E0B' }}>
                    <span>Admin Controls</span>
                  </div>
                  <NavLink to="/admin" className="mobile-nav-link">
                    <Shield size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>Admin Dashboard</span>
                  </NavLink>
                  <NavLink to="/admin/cars" className="mobile-nav-link">
                    <CheckCircle size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>Car Approvals</span>
                  </NavLink>
                  <NavLink to="/admin/utr" className="mobile-nav-link">
                    <CreditCard size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>UTR Verification</span>
                  </NavLink>
                  <NavLink to="/admin/payouts" className="mobile-nav-link">
                    <DollarSign size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>Payout Settlements</span>
                  </NavLink>
                  <NavLink to="/admin/bookings" className="mobile-nav-link">
                    <CalendarCheck size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>All Bookings</span>
                  </NavLink>
                </>
              )}

              {/* Logout Button */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-danger btn-block flex items-center justify-center gap-2"
                  style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <LogOut size={18} />
                  <span>Logout ({user?.name || 'User'})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3" style={{ marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary btn-block btn-lg">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-block btn-lg">
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .nav-link {
          padding: 0.5rem 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.925rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-surface-raised);
        }
        .nav-link.active {
          color: var(--primary);
          background: var(--primary-light);
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
          cursor: pointer;
        }
        .dropdown-item:hover {
          background: var(--bg-surface-hover);
        }
        .mobile-nav-drawer {
          display: flex !important;
          flex-direction: column !important;
        }
        .mobile-nav-header {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 800;
          padding: 0.5rem 0.5rem 0.25rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.35rem;
        }
        .mobile-nav-link {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 0.85rem 1rem !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-md) !important;
          background: var(--bg-surface-raised) !important;
          border: 1px solid var(--border-subtle) !important;
          text-decoration: none !important;
          margin-bottom: 0.25rem !important;
        }
        .mobile-nav-link:hover {
          background: var(--bg-surface-hover) !important;
        }
        .mobile-nav-link.active {
          background: rgba(59, 130, 246, 0.18) !important;
          color: #60A5FA !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
