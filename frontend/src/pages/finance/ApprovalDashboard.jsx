import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import SearchFilterBar from '../../components/SearchFilterBar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ErrorAlert from '../../components/ErrorAlert';
import { invoiceAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const ApprovalDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    invoiceAPI.getAll({ page, limit: 10, search, approval_status: 'PENDING' })
      .then((res) => {
        setInvoices(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, [page, search]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setError('');
    try {
      await invoiceAPI.approve(id);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    setError('');
    try {
      await invoiceAPI.reject(rejectModal.id, comment);
      setRejectModal(null);
      setComment('');
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'vendor', label: 'Vendor', render: (r) => r.vendor?.vendor_name },
    { key: 'contract', label: 'Contract', render: (r) => r.contract?.contract_title },
    { key: 'invoice_amount', label: 'Amount', render: (r) => formatCurrency(r.invoice_amount) },
    { key: 'invoice_date', label: 'Date', render: (r) => formatDate(r.invoice_date) },
    { key: 'approval_status', label: 'Status', render: (r) => <StatusBadge status={r.approval_status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleApprove(r.id)}
            className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => setRejectModal(r)}
            className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Invoice Approvals">
      {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}
      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." />
      <DataTable columns={columns} data={invoices} loading={loading} pagination={pagination} onPageChange={setPage} emptyTitle="No pending invoices" />

      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setComment(''); }} title="Reject Invoice">
        <p className="text-sm text-slate-600 mb-3">Rejecting invoice <strong>{rejectModal?.invoice_number}</strong></p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reason for rejection (optional)"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { setRejectModal(null); setComment(''); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">Reject Invoice</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default ApprovalDashboard;
