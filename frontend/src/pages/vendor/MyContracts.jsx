import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { contractAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    contractAPI.getAll({ page, limit: 10 })
      .then((res) => {
        setContracts(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'contract_title', label: 'Title' },
    { key: 'start_date', label: 'Start', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'End', render: (r) => formatDate(r.end_date) },
    { key: 'contract_value', label: 'Value', render: (r) => formatCurrency(r.contract_value) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Layout title="My Contracts">
      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No contracts found"
        emptyDescription="You don't have any contracts assigned yet."
      />
    </Layout>
  );
};

export default MyContracts;
