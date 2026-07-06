import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import SearchFilterBar from '../../components/SearchFilterBar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import FormField from '../../components/FormField';
import LoadingSpinner from '../../components/LoadingSpinner';
import { contractAPI, vendorAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchContracts = () => {
    setLoading(true);
    contractAPI.getAll({ page, limit: 10, search })
      .then((res) => {
        setContracts(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
    vendorAPI.getAll({ limit: 100 }).then((res) => setVendors(res.data.data || []));
  }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    reset({ contract_title: '', vendor_id: '', start_date: '', end_date: '', contract_value: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (contract) => {
    setEditing(contract);
    reset({ ...contract, vendor_id: contract.vendor_id });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...data, vendor_id: parseInt(data.vendor_id, 10), contract_value: parseFloat(data.contract_value) };
      if (editing) {
        await contractAPI.update(editing.id, payload);
      } else {
        await contractAPI.create(payload);
      }
      setModalOpen(false);
      fetchContracts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contractAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchContracts();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'contract_title', label: 'Title' },
    { key: 'vendor', label: 'Vendor', render: (r) => r.vendor?.vendor_name },
    { key: 'start_date', label: 'Start', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'End', render: (r) => formatDate(r.end_date) },
    { key: 'contract_value', label: 'Value', render: (r) => formatCurrency(r.contract_value) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(r)} className="text-xs font-medium text-brand-600 hover:text-brand-800">Edit</button>
          <button type="button" onClick={() => setDeleteTarget(r)} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Contract Management">
      {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

      <div className="mb-4 flex justify-between items-center">
        <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search contracts..." />
        <button type="button" onClick={openCreate} className="ml-4 shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add Contract
        </button>
      </div>

      <DataTable columns={columns} data={contracts} loading={loading} pagination={pagination} onPageChange={setPage} emptyTitle="No contracts found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contract' : 'Add Contract'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Contract Title" error={errors.contract_title?.message} required>
            <input {...register('contract_title', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Vendor" error={errors.vendor_id?.message} required>
            <select {...register('vendor_id', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Select vendor...</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
            </select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start Date" error={errors.start_date?.message} required>
              <input type="date" {...register('start_date', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </FormField>
            <FormField label="End Date" error={errors.end_date?.message} required>
              <input type="date" {...register('end_date', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </FormField>
          </div>
          <FormField label="Contract Value ($)" error={errors.contract_value?.message} required>
            <input type="number" step="0.01" {...register('contract_value', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Status">
            <select {...register('status')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </FormField>
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {submitting && <LoadingSpinner size="sm" className="border-white/30 border-t-white" />}
            {editing ? 'Update Contract' : 'Create Contract'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete "${deleteTarget?.contract_title}"?`}
        confirmText="Delete"
      />
    </Layout>
  );
};

export default ContractManagement;
