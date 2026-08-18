import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  Car,
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
  ChevronDown
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
          className="mobile-only card card-glass animate-slide-up"
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            width: '100vw',
            height: 'calc(100vh - 72px)',
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            zIndex: 899,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
          onClick={(e) => {
            if (e.target.tagName === 'A' || e.target.closest('button')) {
              closeMobile();
            }
          }}
        >
          <NavLink to="/" end className="mobile-nav-link">
            Home
          </NavLink>
          <NavLink to="/cars" className="mobile-nav-link">
            Find Cars
          </NavLink>

          {isAuthenticated ? (
            <>
              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />

              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Renter Navigation
              </p>
              <NavLink to="/my-bookings" className="mobile-nav-link">
                My Bookings
              </NavLink>
              <NavLink to="/profile" className="mobile-nav-link">
                My Profile
              </NavLink>

              {isOwner && (
                <>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Owner Portal
                  </p>
                  <NavLink to="/owner" end className="mobile-nav-link">
                    Owner Dashboard
                  </NavLink>
                  <NavLink to="/owner/cars" className="mobile-nav-link">
                    My Fleet / Cars
                  </NavLink>
                  <NavLink to="/owner/cars/add" className="mobile-nav-link">
                    + Add New Car
                  </NavLink>
                  <NavLink to="/owner/bookings" className="mobile-nav-link">
                    Owner Bookings
                  </NavLink>
                  <NavLink to="/owner/earnings" className="mobile-nav-link">
                    Earnings & Payouts
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#F59E0B', fontWeight: 700 }}>
                    Admin Controls
                  </p>
                  <NavLink to="/admin" className="mobile-nav-link">
                    Admin Dashboard
                  </NavLink>
                  <NavLink to="/admin/cars" className="mobile-nav-link">
                    Car Approvals
                  </NavLink>
                  <NavLink to="/admin/utr" className="mobile-nav-link">
                    UTR Verification
                  </NavLink>
                  <NavLink to="/admin/payouts" className="mobile-nav-link">
                    Payout Settlements
                  </NavLink>
                  <NavLink to="/admin/bookings" className="mobile-nav-link">
                    All Bookings
                  </NavLink>
                </>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button
                  onClick={logout}
                  className="btn btn-danger btn-block flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout ({user?.name})
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3" style={{ marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary btn-block">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-block">
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
        .mobile-nav-link {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          border-radius: var(--radius-md);
          background: var(--bg-surface-raised);
        }
        .mobile-nav-link.active {
          background: var(--primary-light);
          color: var(--primary);
          border: 1px solid var(--primary);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
