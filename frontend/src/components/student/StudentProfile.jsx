import { useState } from 'react';
import { api } from '../../api/client.js';
import { isValidPhone } from '../../utils/validators.js';

const StudentProfile = () => {
  const [form, setForm] = useState({ name: '', address: '', phone: '', parent_phone: '' });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    if ((name === 'phone' || name === 'parent_phone') && !isValidPhone(value)) {
      return 'Use 10-digit phone or include country code';
    }
    if (name === 'name' && !value.trim()) {
      return 'Name is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const hasErrors = Object.values(errors).some(Boolean) || !form.name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = Object.entries(form).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: validateField(key, value) }),
      {}
    );
    setErrors(currentErrors);
    if (Object.values(currentErrors).some(Boolean)) {
      return;
    }
    const { data } = await api.post('/student/profile', form);
    setStatus(`Profile updated for ${data.name}`);
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Student Profile</h2>
          <p className="text-sm text-slate-500">Manage personal details</p>
        </div>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1">
          <input
            className="w-full rounded border border-slate-200 px-3 py-2"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="text-xs text-danger">{errors.name}</span>}
        </div>
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <input
              className="rounded border border-slate-200 px-3 py-2"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="text-xs text-danger">{errors.phone}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="rounded border border-slate-200 px-3 py-2"
              name="parent_phone"
              placeholder="Parent Phone"
              value={form.parent_phone}
              onChange={handleChange}
            />
            {errors.parent_phone && <span className="text-xs text-danger">{errors.parent_phone}</span>}
          </div>
        </div>
        <button
          type="submit"
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={hasErrors}
        >
          Save profile
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-success">{status}</p>}
    </section>
  );
};

export default StudentProfile;


