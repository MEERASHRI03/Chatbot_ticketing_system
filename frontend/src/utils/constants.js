export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login'
  },
  places: '/places',
  bookings: '/bookings',
  payments: '/payments',
  tickets: '/tickets',
  refunds: '/refunds'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export const TICKET_STATUS = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  CANCELLED: 'CANCELLED'
};

export const REFUND_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export const getStatusColor = (status, statusType) => {
  const colors = {
    pending: '#ffc107',
    confirmed: '#28a745',
    cancelled: '#dc3545',
    success: '#28a745',
    failed: '#dc3545',
    active: '#007bff',
    used: '#6c757d',
    approved: '#28a745',
    rejected: '#dc3545'
  };
  
  return colors[status?.toLowerCase()] || '#6c757d';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
