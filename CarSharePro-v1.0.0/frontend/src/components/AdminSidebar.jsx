import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Star,
  Shield
} from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { to: '/admin', label: 'Analytics Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/utr', label: 'UTR Verification', icon: CheckCircle2 },
    { to: '/admin/cars', label: 'Car Approvals', icon: Car },
    { to: '/admin/payouts', label: 'Owner Payouts', icon: DollarSign },
    { to: '/admin/bookings', label: 'All Bookings', icon: CalendarCheck },
    { to: '/admin/payments', label: 'Payment Ledger', icon: CreditCard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="flex items-center gap-2" style={{ padding: '0.5rem 0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
        <Shield size={20} style={{ color: '#F59E0B' }} />
        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#F59E0B' }}>Admin Console</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .admin-nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-surface-raised);
        }
        .admin-nav-item.active {
          color: #F59E0B;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
