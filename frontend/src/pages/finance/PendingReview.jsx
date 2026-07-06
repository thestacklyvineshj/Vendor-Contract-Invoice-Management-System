import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import SearchFilterBar from '../../components/SearchFilterBar';
import StatusBadge from '../../components/StatusBadge';
import { invoiceAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const PendingReview = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    invoiceAPI.getAll({ page, limit: 10, search, approval_status: 'PENDING' })
      .then((res) => {
        setInvoices(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'vendor', label: 'Vendor', render: (r) => r.vendor?.vendor_name },
    { key: 'contract', label: 'Contract', render: (r) => r.contract?.contract_title },
    { key: 'invoice_amount', label: 'Amount', render: (r) => formatCurrency(r.invoice_amount) },
    { key: 'invoice_date', label: 'Submitted', render: (r) => formatDate(r.invoice_date) },
    { key: 'due_date', label: 'Due', render: (r) => formatDate(r.due_date) },
    { key: 'approval_status', label: 'Status', render: (r) => <StatusBadge status={r.approval_status} /> },
  ];

  return (
    <Layout title="Pending Invoice Review">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {pagination?.total || 0} invoice(s) awaiting your review and approval.
      </div>
      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search pending invoices..." />
      <DataTable columns={columns} data={invoices} loading={loading} pagination={pagination} onPageChange={setPage} emptyTitle="No pending invoices" emptyDescription="All invoices have been reviewed." />
    </Layout>
  );
};

export default PendingReview;
