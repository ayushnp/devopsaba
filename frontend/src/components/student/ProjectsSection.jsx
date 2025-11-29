import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const ProjectsSection = () => {
  const [form, setForm] = useState({ project_name: '', domain: '', impact: '' });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/student/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_name) {
      alert('Please enter project name');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/student/projects', form);
      setProjects((prev) => [data, ...prev]);
      setForm({ project_name: '', domain: '', impact: '' });
      alert('Project submitted successfully!');
      fetchProjects(); // Refresh list
    } catch (err) {
      console.error('Project submission error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit project';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Projects</h2>
        <p className="text-sm text-slate-500">Showcase academic and research work</p>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Project Name"
          value={form.project_name}
          onChange={(e) => setForm((prev) => ({ ...prev, project_name: e.target.value }))}
          required
        />
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Domain"
          value={form.domain}
          onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))}
        />
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Impact / Description"
          value={form.impact}
          onChange={(e) => setForm((prev) => ({ ...prev, impact: e.target.value }))}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save project'}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {projects.map((project) => (
          <li key={project.project_id}>
            {project.project_name} · {project.domain}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectsSection;


