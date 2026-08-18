import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, CalendarCheck, PlusCircle, User, LayoutDashboard, Shield, LogIn } from 'lucide-react';

const MobileBottomNav = () => {
  const { isAuthenticated, user, hasRole } = useAuth();
  const isOwner = hasRole('OWNER');
  const isAdmin = hasRole('ADMIN');

  return (
    <div className="mobile-bottom-nav">
      {/* 1. Home */}
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Home size={20} />
        </div>
        <span className="nav-label">Home</span>
      </NavLink>

      {/* 2. Browse Cars */}
      <NavLink
        to="/cars"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Compass size={20} />
        </div>
        <span className="nav-label">Explore</span>
      </NavLink>

      {/* 3. My Trips / Bookings */}
      {isAuthenticated && !isAdmin && (
        <NavLink
          to="/my-bookings"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-container">
            <CalendarCheck size={20} />
          </div>
          <span className="nav-label">My Trips</span>
        </NavLink>
      )}

      {/* 4. Host Portal / Add Car / Admin */}
      {isAuthenticated ? (
        isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-container">
              <Shield size={20} color="#F59E0B" />
            </div>
            <span className="nav-label" style={{ color: '#F59E0B' }}>Admin</span>
          </NavLink>
        ) : isOwner ? (
          <NavLink
            to="/owner"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-container">
              <LayoutDashboard size={20} />
            </div>
            <span className="nav-label">Host</span>
          </NavLink>
        ) : (
          <NavLink
            to="/owner/cars/add"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-container">
              <PlusCircle size={20} />
            </div>
            <span className="nav-label">Host Car</span>
          </NavLink>
        )
      ) : null}

      {/* 5. Profile / Account */}
      {isAuthenticated ? (
        <NavLink
          to="/profile"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-container">
            <User size={20} />
          </div>
          <span className="nav-label">Profile</span>
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-container">
            <LogIn size={20} />
          </div>
          <span className="nav-label">Sign In</span>
        </NavLink>
      )}

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 859px) {
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(11, 15, 25, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.09);
            z-index: 850;
            align-items: center;
            justify-content: space-around;
            padding: 0 0.5rem;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            color: #94A3B8;
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 12px;
            transition: all 180ms ease;
            position: relative;
            flex: 1;
            max-width: 72px;
          }

          .mobile-nav-item:active {
            transform: scale(0.92);
          }

          .nav-icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 200ms ease;
          }

          .nav-label {
            font-size: 0.68rem;
            font-weight: 600;
            letter-spacing: -0.01em;
            line-height: 1;
          }

          .mobile-nav-item.active {
            color: #3B82F6;
          }

          .mobile-nav-item.active .nav-icon-container {
            transform: translateY(-2px);
            color: #3B82F6;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
          }

          .mobile-nav-item.active .nav-label {
            color: #60A5FA;
            font-weight: 700;
          }

          .mobile-nav-item.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            width: 14px;
            height: 3px;
            border-radius: 2px;
            background: #3B82F6;
            box-shadow: 0 0 6px #3B82F6;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileBottomNav;
