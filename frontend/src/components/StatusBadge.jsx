const styles = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  UNPAID: 'bg-slate-100 text-slate-700',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-100 text-slate-600',
  EXPIRED: 'bg-orange-100 text-orange-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

const labels = {
  PARTIALLY_PAID: 'Partially Paid',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
    {labels[status] || status?.replace(/_/g, ' ')}
  </span>
);

export default StatusBadge;
