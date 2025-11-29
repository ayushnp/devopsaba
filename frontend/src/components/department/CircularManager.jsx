import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const CircularManager = () => {
  const [form, setForm] = useState({ department_id: '', title: '', circular_details: '' });
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const { data } = await api.get('/department/circulars');
      setCirculars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch circulars:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Please enter title');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/department/circulars', form);
      setCirculars((prev) => [data, ...prev]);
      setForm({ department_id: '', title: '', circular_details: '' });
      alert('Circular published successfully!');
      fetchCirculars(); // Refresh list
    } catch (err) {
      console.error('Circular creation error:', err);
      alert(err.response?.data?.message || 'Failed to publish circular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Circulars</h2>
      <p className="mb-4 text-sm text-slate-500">Create and broadcast department circulars</p>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Department ID"
          value={form.department_id}
          onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
        />
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Circular Details"
          value={form.circular_details}
          onChange={(e) => setForm((prev) => ({ ...prev, circular_details: e.target.value }))}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {circulars.map((circular) => (
          <li key={circular.circular_id}>{circular.title}</li>
        ))}
      </ul>
    </section>
  );
};

export default CircularManager;


