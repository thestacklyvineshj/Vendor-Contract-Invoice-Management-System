import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyInvoiceVolume = ({ data }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="font-semibold text-slate-900 mb-4">Monthly Invoice Volume</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
        <Bar dataKey="total_amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default MonthlyInvoiceVolume;
