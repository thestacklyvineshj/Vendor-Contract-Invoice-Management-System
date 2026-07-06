import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/constants';

const FinanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.finance().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Finance Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></Layout>;

  const { summary, recentInvoices } = data || {};

  return (
    <Layout title="Finance Dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Approvals', value: summary?.pendingApprovals, color: 'text-amber-600' },
          { label: 'Approved Unpaid', value: summary?.approvedUnpaid, color: 'text-blue-600' },
          { label: 'Total Paid', value: formatCurrency(summary?.totalPaid), color: 'text-green-600' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Invoices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-slate-500">
                <th className="pb-2 pr-4">Invoice</th>
                <th className="pb-2 pr-4">Vendor</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2 pr-4">Approval</th>
                <th className="pb-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices?.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50">
                  <td className="py-3 pr-4 font-medium">{inv.invoice_number}</td>
                  <td className="py-3 pr-4">{inv.vendor?.vendor_name}</td>
                  <td className="py-3 pr-4">{formatCurrency(inv.invoice_amount)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={inv.approval_status} /></td>
                  <td className="py-3"><StatusBadge status={inv.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default FinanceDashboard;
