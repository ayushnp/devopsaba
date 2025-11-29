import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const emptyForm = {
  feature_name: '',
  feature_type: '',
  description: '',
  target_audience: '',
  academic_year: ''
};

const AdminFeaturesManager = () => {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFeatures = async () => {
    const { data } = await api.get('/admin/features');
    setFeatures(data);
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const validate = (payload) => {
    const nextErrors = {};
    ['feature_name', 'feature_type', 'target_audience', 'academic_year'].forEach((field) => {
      if (!payload[field]?.trim()) {
        nextErrors[field] = 'Required';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/features/${editingId}`, form);
      } else {
        await api.post('/admin/features', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadFeatures();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save feature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feature) => {
    setForm({
      feature_name: feature.feature_name,
      feature_type: feature.feature_type,
      description: feature.description || '',
      target_audience: feature.target_audience || '',
      academic_year: feature.academic_year || ''
    });
    setEditingId(feature.feature_id);
    setShowForm(true);
  };

  const handleDelete = async (featureId) => {
    if (!window.confirm('Delete this feature?')) return;
    await api.delete(`/admin/features/${featureId}`);
    loadFeatures();
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Dynamic Features</h2>
          <p className="text-sm text-slate-500">Share new sections or initiatives</p>
        </div>
        <button
          type="button"
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setShowForm((prev) => !prev);
            if (showForm) {
              setForm(emptyForm);
              setEditingId(null);
            }
          }}
        >
          {showForm ? 'Close' : 'Add Additional Details'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 space-y-3" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Feature Name"
              value={form.feature_name}
              onChange={(e) => setForm((prev) => ({ ...prev, feature_name: e.target.value }))}
            />
            {errors.feature_name && <span className="text-xs text-danger">{errors.feature_name}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Feature Type"
              value={form.feature_type}
              onChange={(e) => setForm((prev) => ({ ...prev, feature_type: e.target.value }))}
            />
            {errors.feature_type && <span className="text-xs text-danger">{errors.feature_type}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <select
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              value={form.target_audience}
              onChange={(e) => setForm((prev) => ({ ...prev, target_audience: e.target.value }))}
            >
              <option value="">Select Target Audience</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.target_audience && <span className="text-xs text-danger">{errors.target_audience}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Academic Year"
              value={form.academic_year}
              onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))}
            />
            {errors.academic_year && <span className="text-xs text-danger">{errors.academic_year}</span>}
          </div>
          <textarea
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={submitting}
            >
              {editingId ? 'Update Feature' : 'Create Feature'}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded border border-slate-200 px-4 py-2 text-sm"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setErrors({});
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature.feature_id} className="rounded border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold">{feature.feature_name}</p>
                <p className="text-xs uppercase text-slate-400">{feature.feature_type}</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button className="text-accent" type="button" onClick={() => handleEdit(feature)}>
                  Edit
                </button>
                <button className="text-danger" type="button" onClick={() => handleDelete(feature.feature_id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{feature.description || 'No description provided.'}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Audience: {feature.target_audience}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Year: {feature.academic_year}</span>
            </div>
          </div>
        ))}
        {features.length === 0 && <p className="text-sm text-slate-500">No features published yet.</p>}
      </div>
    </section>
  );
};

export default AdminFeaturesManager;

