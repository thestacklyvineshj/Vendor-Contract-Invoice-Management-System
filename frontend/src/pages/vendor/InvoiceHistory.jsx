import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import SearchFilterBar from '../../components/SearchFilterBar';
import StatusBadge from '../../components/StatusBadge';
import { invoiceAPI } from '../../services/api';
import { formatCurrency, formatDate, APPROVAL_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../../utils/constants';

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ approval_status: '', payment_status: '' });

  const fetchInvoices = () => {
    setLoading(true);
    invoiceAPI.getAll({ page, limit: 10, search, ...filters })
      .then((res) => {
        setInvoices(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, [page, search, filters]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'invoice_date', label: 'Date', render: (r) => formatDate(r.invoice_date) },
    { key: 'due_date', label: 'Due', render: (r) => formatDate(r.due_date) },
    { key: 'invoice_amount', label: 'Amount', render: (r) => formatCurrency(r.invoice_amount) },
    { key: 'approval_status', label: 'Approval', render: (r) => <StatusBadge status={r.approval_status} /> },
    { key: 'payment_status', label: 'Payment', render: (r) => <StatusBadge status={r.payment_status} /> },
  ];

  return (
    <Layout title="Invoice History">
      <SearchFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={[
          { key: 'approval_status', options: APPROVAL_STATUS_OPTIONS },
          { key: 'payment_status', options: PAYMENT_STATUS_OPTIONS },
        ]}
        filterValues={filters}
        onFilterChange={(key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); }}
        placeholder="Search by invoice number..."
      />
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No invoices found"
      />
    </Layout>
  );
};

export default InvoiceHistory;
