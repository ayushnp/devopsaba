import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const LeaveRequest = () => {
  const [form, setForm] = useState({ leave_details: '', from_date: '', to_date: '' });
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/student/leave')
      .then(({ data }) => setRequests(data))
      .catch((err) => console.error('Failed to load leaves', err));
  }, []);

  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0; // 0 = Sunday
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Check for Sunday restriction
    if (isSunday(form.from_date) || isSunday(form.to_date)) {
      setError('Cannot apply for leave on Sunday');
      return;
    }
    
    if (new Date(form.from_date) > new Date(form.to_date)) {
      setError('End date must be after start date');
      return;
    }
    
    setError('');
    try {
      const { data } = await api.post('/student/leave', form);
      setRequests((prev) => [data, ...prev]);
      setForm({ leave_details: '', from_date: '', to_date: '' });
      alert('Leave request submitted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit request';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Leave Request</h2>
        <p className="text-sm text-slate-500">Submit leave for approval</p>
      </header>
      <form className="space-y-3" onSubmit={submit}>
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Leave details (Reason)"
          value={form.leave_details}
          onChange={(e) => setForm((prev) => ({ ...prev, leave_details: e.target.value }))}
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 mb-1">From</span>
            <input
              type="date"
              className="rounded border border-slate-200 px-3 py-2"
              value={form.from_date}
              onChange={(e) => setForm((prev) => ({ ...prev, from_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 mb-1">To</span>
            <input
              type="date"
              className="rounded border border-slate-200 px-3 py-2"
              value={form.to_date}
              onChange={(e) => setForm((prev) => ({ ...prev, to_date: e.target.value }))}
              required
            />
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Submit Request
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">History</h3>
        <ul className="space-y-2 text-sm text-slate-600 max-h-40 overflow-y-auto">
          {requests.length === 0 && <p className="text-slate-400 italic">No leave requests yet.</p>}
          {requests.map((req) => (
            <li
              key={req.leave_id}
              className="rounded border border-slate-100 bg-slate-50 p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium truncate w-48" title={req.leave_details}>
                  {req.leave_details}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(req.from_date).toLocaleDateString()} → {new Date(req.to_date).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                  req.status === 'approved'
                    ? 'bg-green-100 text-green-600'
                    : req.status === 'rejected'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                {req.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LeaveRequest;