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
import { vendorAPI } from '../../services/api';

const VendorManagement = () => {
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

  const fetchVendors = () => {
    setLoading(true);
    vendorAPI.getAll({ page, limit: 10, search })
      .then((res) => {
        setVendors(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    reset({ vendor_name: '', contact_person: '', phone: '', email: '', address: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditing(vendor);
    reset(vendor);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        await vendorAPI.update(editing.id, data);
      } else {
        await vendorAPI.create(data);
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await vendorAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'vendor_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
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
    <Layout title="Vendor Management">
      {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

      <div className="mb-4 flex justify-between items-center">
        <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search vendors..." />
        <button type="button" onClick={openCreate} className="ml-4 shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add Vendor
        </button>
      </div>

      <DataTable columns={columns} data={vendors} loading={loading} pagination={pagination} onPageChange={setPage} emptyTitle="No vendors found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vendor' : 'Add Vendor'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Company Name" error={errors.vendor_name?.message} required>
            <input {...register('vendor_name', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Contact Person" error={errors.contact_person?.message} required>
            <input {...register('contact_person', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            <input type="email" {...register('email', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message} required>
            <input {...register('phone', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Address" error={errors.address?.message} required>
            <textarea {...register('address', { required: 'Required' })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Status">
            <select {...register('status')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </FormField>
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {submitting && <LoadingSpinner size="sm" className="border-white/30 border-t-white" />}
            {editing ? 'Update Vendor' : 'Create Vendor'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${deleteTarget?.vendor_name}?`}
        confirmText="Delete"
      />
    </Layout>
  );
};

export default VendorManagement;
