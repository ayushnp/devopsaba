import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const FacultyProfile = () => {
  const [form, setForm] = useState({ courses: '', department_id: '', bio: '', time_details: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEW: Fetch profile data when component loads
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/faculty/profile');
      if (data) {
        // Convert DB data back to form strings
        setForm({
          // Convert JSON array ["java", "python"] -> String "java\npython"
          courses: data.courses?.course_list ? data.courses.course_list.join('\n') : '',
          department_id: data.department_id || '',
          bio: data.bio || '',
          // Convert JSON object {details: "today"} -> String "today"
          time_details: data.time_details?.details || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // Payload is prepared as strings, Backend will handle JSON conversion
      const payload = {
        courses: form.courses,
        department_id: form.department_id,
        bio: form.bio,
        time_details: form.time_details
      };
      
      await api.post('/faculty/profile', payload);
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      
      // Refresh data to show saved state
      fetchProfile();
    } catch (err) {
      console.error('Profile update error:', err);
      setStatus({ 
        type: 'error', 
        msg: 'Failed to update profile: ' + (err.response?.data?.message || 'Server error') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Faculty Profile</h2>
      <p className="mb-4 text-sm text-slate-500">Update teaching info</p>
      
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Courses (One per line)</label>
          <textarea
            className="w-full rounded border border-slate-200 px-3 py-2"
            placeholder="e.g.\nJava\nPython"
            rows="3"
            value={form.courses}
            onChange={(e) => setForm((prev) => ({ ...prev, courses: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-xs text-slate-500 mb-1">Department ID</label>
          <input
            type="number"
            className="w-full rounded border border-slate-200 px-3 py-2"
            placeholder="e.g. 1"
            value={form.department_id}
            onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Bio</label>
          <textarea
            className="w-full rounded border border-slate-200 px-3 py-2"
            placeholder="Brief bio"
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Time Details / Office Hours</label>
          <input
            className="w-full rounded border border-slate-200 px-3 py-2"
            placeholder="e.g. Mon-Fri 2PM-4PM"
            value={form.time_details}
            onChange={(e) => setForm((prev) => ({ ...prev, time_details: e.target.value }))}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      
      {status && (
        <p className={`mt-4 text-sm p-2 rounded ${
          status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status.msg}
        </p>
      )}
    </section>
  );
};

export default FacultyProfile;