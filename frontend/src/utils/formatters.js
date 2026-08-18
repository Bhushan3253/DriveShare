/**
 * Format currency to Indian Rupees (INR)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format ISO Date or Date string to readable format (e.g. 15 Aug 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return String(dateString);
  }
};

/**
 * Format Date & Time (e.g. 15 Aug 2026, 04:30 PM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return String(dateString);
  }
};

/**
 * Truncate long strings with ellipsis
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Safely parse UTC timestamps from backend (handles missing 'Z' timezone suffix)
 */
export const parseUtcDate = (dateString) => {
  if (!dateString) return new Date();
  if (dateString instanceof Date) return dateString;
  try {
    const str = String(dateString).trim();
    const hasTimezone = str.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(str);
    const normalizedStr = hasTimezone ? str : `${str}Z`;
    const parsed = new Date(normalizedStr);
    return isNaN(parsed.getTime()) ? new Date(str) : parsed;
  } catch {
    return new Date(dateString);
  }
};
