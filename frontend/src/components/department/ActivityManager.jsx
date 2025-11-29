import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const ActivityManager = () => {
  const [form, setForm] = useState({ department_id: '', event_title: '', event_details: '', event_date: '' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/department/activities');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.event_title) {
      alert('Please enter event title');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/department/activities', form);
      setEvents((prev) => [data, ...prev]);
      setForm({ department_id: '', event_title: '', event_details: '', event_date: '' });
      alert('Activity created successfully!');
      fetchActivities(); // Refresh list
    } catch (err) {
      console.error('Activity creation error:', err);
      alert(err.response?.data?.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Department Activities</h2>
      <p className="mb-4 text-sm text-slate-500">Plan and record events</p>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Department ID"
          value={form.department_id}
          onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
        />
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Event Title *"
          value={form.event_title}
          onChange={(e) => setForm((prev) => ({ ...prev, event_title: e.target.value }))}
          required
        />
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Event Details"
          value={form.event_details}
          onChange={(e) => setForm((prev) => ({ ...prev, event_details: e.target.value }))}
        />
        <input
          type="date"
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Event Date (optional)"
          value={form.event_date}
          onChange={(e) => setForm((prev) => ({ ...prev, event_date: e.target.value }))}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Add event'}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {events.map((event) => (
          <li key={event.event_id}>{event.event_title}</li>
        ))}
      </ul>
    </section>
  );
};

export default ActivityManager;


