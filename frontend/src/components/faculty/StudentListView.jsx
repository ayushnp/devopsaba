import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const StudentListView = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/faculty/students').then(({ data }) => setStudents(data));
  }, []);

  const filtered = students.filter((student) =>
    student.name?.toLowerCase().includes(query.toLowerCase()) ||
    student.usn?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow overflow-hidden">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Student List</h2>
          <p className="text-sm text-slate-500">Comprehensive student database</p>
        </div>
        <input
          className="rounded border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search name or USN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">USN</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Parent Phone</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Dept ID</th>
              <th className="px-4 py-3">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <tr key={student.student_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{student.usn}</td>
                <td className="px-4 py-3">{student.name}</td>
                <td className="px-4 py-3 text-slate-500">{student.email}</td>
                <td className="px-4 py-3">{student.phone || '-'}</td>
                <td className="px-4 py-3">{student.parent_phone || '-'}</td>
                <td className="px-4 py-3">{student.batch_year || '-'}</td>
                <td className="px-4 py-3 text-center">{student.department_id || '-'}</td>
                <td className="px-4 py-3 truncate max-w-xs" title={student.address}>{student.address || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-slate-500">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default StudentListView;