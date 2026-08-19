export const ROLES = {
  RENTER: 'USER',
  USER: 'USER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN'
};

export const BOOKING_STATUS = {
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  RETURNED: 'RETURNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUCCESS: 'SUCCESS',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

export const CAR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED'
};

export const CAR_TYPES = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Luxury',
  'Convertible',
  'Electric',
  'MUV / Minivan'
];

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'CNG'
];

export const TRANSMISSIONS = [
  'Manual',
  'Automatic'
];
