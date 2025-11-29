import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const InternshipSection = () => {
  const [form, setForm] = useState({ company: '', stack_data: '', start_date: '', end_date: '', stipend: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const { data } = await api.get('/student/internships');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company) {
      alert('Please enter company name');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        stack_data: form.stack_data ? form.stack_data.split(',').map((stack) => stack.trim()).filter(Boolean) : []
      };
      const { data } = await api.post('/student/internships', payload);
      setItems((prev) => [data, ...prev]);
      setForm({ company: '', stack_data: '', start_date: '', end_date: '', stipend: '' });
      alert('Internship details submitted successfully!');
      fetchInternships(); // Refresh list
    } catch (err) {
      console.error('Internship submission error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit internship details';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Internships</h2>
        <p className="text-sm text-slate-500">Track internship history</p>
      </header>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
          required
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Stack (comma separated)"
          value={form.stack_data}
          onChange={(e) => setForm((prev) => ({ ...prev, stack_data: e.target.value }))}
        />
        <input
          type="date"
          className="rounded border border-slate-200 px-3 py-2"
          value={form.start_date}
          onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
        />
        <input
          type="date"
          className="rounded border border-slate-200 px-3 py-2"
          value={form.end_date}
          onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
        />
        <input
          type="number"
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Stipend (optional)"
          value={form.stipend}
          onChange={(e) => setForm((prev) => ({ ...prev, stipend: e.target.value }))}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white md:col-span-2 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Add internship'}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item.internship_id}>
            {item.company} · {item.start_date} → {item.end_date || 'Present'}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InternshipSection;


