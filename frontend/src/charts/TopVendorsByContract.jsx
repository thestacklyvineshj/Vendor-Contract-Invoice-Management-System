import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TopVendorsByContract = ({ data }) => {
  const chartData = (data || []).map((d) => ({
    vendor: d.vendor_name,
    value: parseFloat(d.total_value) || 0,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Top Vendors by Contract Value</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="vendor" width={120} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Contract Value']} />
          <Bar dataKey="value" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopVendorsByContract;
