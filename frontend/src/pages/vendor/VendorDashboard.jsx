import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.vendor()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></Layout>;

  const { summary, recentInvoices, contracts } = data || {};

  return (
    <Layout title="Vendor Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Active Contracts', value: summary?.totalContracts },
          { label: 'Total Invoices', value: summary?.totalInvoices },
          { label: 'Company', value: summary?.vendorName },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Invoices</h3>
          {recentInvoices?.length ? (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-slate-500">{formatDate(inv.invoice_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(inv.invoice_amount)}</p>
                    <StatusBadge status={inv.approval_status} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No invoices yet</p>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Active Contracts</h3>
          {contracts?.length ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-sm font-medium">{c.contract_title}</p>
                  <p className="text-xs text-slate-500">{formatDate(c.start_date)} – {formatDate(c.end_date)}</p>
                  <p className="text-sm text-brand-600 font-medium mt-1">{formatCurrency(c.contract_value)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No active contracts</p>}
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
