import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import FormField from '../../components/FormField';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { invoiceAPI, paymentAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const PaymentManagement = () => {
  const [approvedInvoices, setApprovedInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const selectedInvoiceId = watch('invoice_id');
  const selectedInvoice = approvedInvoices.find((i) => i.id === parseInt(selectedInvoiceId, 10));

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      invoiceAPI.getAll({ approval_status: 'APPROVED', payment_status: 'UNPAID,PARTIALLY_PAID', limit: 100 }),
      paymentAPI.getAll({ page, limit: 10 }),
    ])
      .then(([invRes, payRes]) => {
        const unpaid = (invRes.data.data || []).filter((i) => i.payment_status !== 'PAID');
        setApprovedInvoices(unpaid);
        setPayments(payRes.data.data || []);
        setPagination(payRes.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.create({
        invoice_id: parseInt(data.invoice_id, 10),
        payment_amount: parseFloat(data.payment_amount),
        payment_date: data.payment_date,
        payment_mode: data.payment_mode,
        transaction_reference: data.transaction_reference,
      });
      setSuccess('Payment recorded successfully.');
      reset();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentColumns = [
    { key: 'invoice', label: 'Invoice', render: (r) => r.invoice?.invoice_number },
    { key: 'payment_amount', label: 'Amount', render: (r) => formatCurrency(r.payment_amount) },
    { key: 'payment_date', label: 'Date', render: (r) => formatDate(r.payment_date) },
    { key: 'payment_mode', label: 'Mode' },
    { key: 'transaction_reference', label: 'Reference' },
  ];

  return (
    <Layout title="Payment Management">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Record Payment</h3>
          {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}
          {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Invoice" error={errors.invoice_id?.message} required>
              <select {...register('invoice_id', { required: 'Select an invoice' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Select approved invoice...</option>
                {approvedInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — {formatCurrency(inv.invoice_amount)} ({inv.payment_status})
                  </option>
                ))}
              </select>
            </FormField>

            {selectedInvoice && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p>Invoice Amount: <strong>{formatCurrency(selectedInvoice.invoice_amount)}</strong></p>
                <p>Status: <StatusBadge status={selectedInvoice.payment_status} /></p>
              </div>
            )}

            <FormField label="Payment Amount ($)" error={errors.payment_amount?.message} required>
              <input type="number" step="0.01" min="0.01" {...register('payment_amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </FormField>

            <FormField label="Payment Date" error={errors.payment_date?.message} required>
              <input type="date" {...register('payment_date', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </FormField>

            <FormField label="Payment Mode" error={errors.payment_mode?.message} required>
              <select {...register('payment_mode', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Select mode...</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </FormField>

            <FormField label="Transaction Reference" error={errors.transaction_reference?.message} required>
              <input {...register('transaction_reference', { required: 'Required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="TXN-12345" />
            </FormField>

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {submitting && <LoadingSpinner size="sm" className="border-white/30 border-t-white" />}
              Record Payment
            </button>
          </form>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Payment History</h3>
          <DataTable columns={paymentColumns} data={payments} loading={loading} pagination={pagination} onPageChange={setPage} emptyTitle="No payments recorded" />
        </div>
      </div>
    </Layout>
  );
};

export default PaymentManagement;
