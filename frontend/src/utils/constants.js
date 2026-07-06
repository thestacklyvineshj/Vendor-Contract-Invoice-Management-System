export const APP_NAME = 'Vendor Contract & Invoice Management System';
export const APP_SHORT_NAME = 'VCIMS';

export const ROLE_ROUTES = {
  ADMIN: '/admin',
  FINANCE_MANAGER: '/finance',
  VENDOR: '/vendor',
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

export const APPROVAL_STATUS_OPTIONS = [
  { value: '', label: 'All Approval Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
];
