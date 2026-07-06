import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import FormField from '../../components/FormField';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { contractAPI, invoiceAPI } from '../../services/api';

const UploadInvoice = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileName, setFileName] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    contractAPI.getAll({ limit: 100 }).then((res) => setContracts(res.data.data || []));
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) setFileName(file.name);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await invoiceAPI.create({
        contract_id: parseInt(data.contract_id, 10),
        invoice_amount: parseFloat(data.invoice_amount),
        invoice_date: data.invoice_date,
        due_date: data.due_date,
      });
      setSuccess('Invoice submitted successfully and is pending approval.');
      reset();
      setFileName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Upload Invoice">
      <div className="max-w-2xl">
        {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormField label="Contract" error={errors.contract_id?.message} required>
            <select {...register('contract_id', { required: 'Select a contract' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select contract...</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>{c.contract_title}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Invoice Amount ($)" error={errors.invoice_amount?.message} required>
            <input type="number" step="0.01" min="0.01" {...register('invoice_amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Invoice Date" error={errors.invoice_date?.message} required>
              <input type="date" {...register('invoice_date', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </FormField>
            <FormField label="Due Date" error={errors.due_date?.message} required>
              <input type="date" {...register('due_date', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </FormField>
          </div>

          <FormField label="Invoice Document (Mock Upload)">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-brand-400 transition-colors"
            >
              <svg className="h-10 w-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600">Drag & drop your invoice PDF here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse (mock only — file not stored)</p>
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileDrop} className="mt-3 text-xs text-slate-500" />
              {fileName && <p className="mt-2 text-sm font-medium text-brand-600">Selected: {fileName}</p>}
            </div>
          </FormField>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {loading && <LoadingSpinner size="sm" className="border-white/30 border-t-white" />}
            Submit Invoice
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default UploadInvoice;
