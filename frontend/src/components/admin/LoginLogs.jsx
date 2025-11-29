import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const LoginLogs = () => {
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    const { data } = await api.get('/admin/logs', { params });
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500">From</label>
          <input
            type="date"
            className="rounded border border-slate-200 px-3 py-2"
            value={filters.from}
            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">To</label>
          <input
            type="date"
            className="rounded border border-slate-200 px-3 py-2"
            value={filters.to}
            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <button type="button" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white" onClick={fetchLogs}>
          Filter
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-4 py-2 text-sm"
          onClick={() => window.print()}
        >
          Export PDF
        </button>
      </div>
      <div className="overflow-x-auto text-sm">
        <table className="w-full">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id} className="border-b border-slate-100">
                <td className="px-3 py-2">#{log.user_id}</td>
                <td className="px-3 py-2 uppercase">{log.user_type}</td>
                <td className="px-3 py-2">{log.login_date}</td>
                <td className="px-3 py-2">{new Date(log.login_timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LoginLogs;


