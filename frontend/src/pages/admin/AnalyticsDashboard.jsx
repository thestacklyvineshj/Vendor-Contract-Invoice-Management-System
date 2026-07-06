import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import MonthlyInvoiceVolume from '../../charts/MonthlyInvoiceVolume';
import PendingVsApproved from '../../charts/PendingVsApproved';
import VendorPaymentDistribution from '../../charts/VendorPaymentDistribution';
import PaymentTrends from '../../charts/PaymentTrends';
import TopVendorsByContract from '../../charts/TopVendorsByContract';
import { dashboardAPI } from '../../services/api';
import { formatCurrency } from '../../utils/constants';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Analytics Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></Layout>;

  const { summary, pendingVsApproved, monthlyInvoiceVolume, vendorPaymentDistribution, paymentTrends, topVendorsByContractValue } = data || {};

  return (
    <Layout title="Analytics Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Vendors', value: summary?.totalVendors },
          { label: 'Total Contracts', value: summary?.totalContracts },
          { label: 'Total Invoices', value: summary?.totalInvoices },
          { label: 'Total Payments', value: formatCurrency(summary?.totalPayments) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <MonthlyInvoiceVolume data={monthlyInvoiceVolume} />
        <PendingVsApproved data={pendingVsApproved} />
        <VendorPaymentDistribution data={vendorPaymentDistribution} />
        <PaymentTrends data={paymentTrends} />
      </div>

      <div className="mt-6">
        <TopVendorsByContract data={topVendorsByContractValue} />
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
