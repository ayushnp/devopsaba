import { useState } from 'react';
import { api } from '../../api/client.js';
import { isValidPassword } from '../../utils/validators.js';

const roles = ['admin', 'department', 'faculty', 'student'];

const UserManagement = () => {
  const [form, setForm] = useState({ username: '', password: '', role: 'faculty' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const createUser = async (e) => {
    e.preventDefault();
    if (!isValidPassword(form.password)) {
      setError('Password must contain uppercase, lowercase, number & symbol');
      return;
    }
    setError('');
    const { data } = await api.post('/admin/users', form);
    setUsers((prev) => [data, ...prev]);
    setForm({ username: '', password: '', role: 'faculty' });
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">User Management</h2>
      <p className="mb-4 text-sm text-slate-500">Provision accounts & roles</p>
      <form className="grid gap-3 md:grid-cols-4" onSubmit={createUser}>
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Username / Email"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          required
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Temp password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <select
          className="rounded border border-slate-200 px-3 py-2"
          value={form.role}
          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.toUpperCase()}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white">
          Create user
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {users.map((user, idx) => (
          <li key={idx} className="rounded border border-slate-200 px-3 py-2">
            {user.username || user.email} · {user.role?.toUpperCase()}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserManagement;


