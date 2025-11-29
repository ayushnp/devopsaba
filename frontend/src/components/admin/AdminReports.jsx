import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563EB', '#22C55E', '#F97316'];

const AdminReports = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get('/admin/reports').then(({ data }) => setReport(data));
  }, []);

  const chartData =
    report?.leaveSummary?.map((row) => ({ name: row.status, value: Number(row.count) })) || [];

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Admin Reports</h2>
          <p className="text-sm text-slate-500">Auto-refreshes from backend metrics</p>
        </div>
        <button
          type="button"
          className="rounded border border-slate-200 px-3 py-1 text-sm"
          onClick={() => window.print()}
        >
          Export
        </button>
      </header>
      {report ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Totals</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-slate-50 p-3">
                <p className="text-2xl font-semibold">{report.students}</p>
                <p className="text-xs uppercase text-slate-500">Students</p>
              </div>
              <div className="rounded bg-slate-50 p-3">
                <p className="text-2xl font-semibold">{report.faculty}</p>
                <p className="text-xs uppercase text-slate-500">Faculty</p>
              </div>
              <div className="rounded bg-slate-50 p-3">
                <p className="text-2xl font-semibold">{report.departments}</p>
                <p className="text-xs uppercase text-slate-500">Departments</p>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Loading report...</p>
      )}
    </section>
  );
};

export default AdminReports;


