import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f59e0b', '#22c55e', '#ef4444'];

const PendingVsApproved = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data?.pending || 0 },
    { name: 'Approved', value: data?.approved || 0 },
    { name: 'Rejected', value: data?.rejected || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Pending vs Approved Invoices</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PendingVsApproved;
