import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();
  const lowerClass = String(status).toLowerCase();

  const labels = {
    PAYMENT_PENDING: 'Payment Pending',
    PENDING_VERIFICATION: 'Pending Verification',
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'Checked In',
    IN_PROGRESS: 'In Progress',
    RETURNED: 'Returned',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    BLOCKED: 'Blocked',
    PAID: 'Paid',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
  };

  const displayText = labels[normalized] || normalized;

  return (
    <span className={`badge badge-${lowerClass} ${className}`}>
      <span className="badge-dot" />
      {displayText}
    </span>
  );
};

export default StatusBadge;
