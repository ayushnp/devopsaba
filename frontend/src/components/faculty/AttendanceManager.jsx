import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const AttendanceManager = () => {
  const [rows, setRows] = useState([{ student_id: '', status: 'present' }]);
  const [message, setMessage] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/faculty/students');
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, { student_id: '', status: 'present' }]);

  const submit = async () => {
    try {
      await api.post('/faculty/attendance', { records: rows, course_id: courseId || null, date });
      setMessage('Attendance saved successfully');
      setRows([{ student_id: '', status: 'present' }]);
    } catch (err) {
      setMessage('Failed to save attendance: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Attendance Manager</h2>
        <button type="button" className="text-sm text-accent" onClick={addRow}>
          + Add Row
        </button>
      </header>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course ID (Optional)</label>
          <input
            type="text"
            className="w-full rounded border border-slate-200 px-3 py-2"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded border border-slate-200 px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-3 py-2">Student ID</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded border border-slate-200 px-2 py-1"
                    value={row.student_id}
                    onChange={(e) => updateRow(idx, 'student_id', e.target.value)}
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.name} ({student.usn})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded border border-slate-200 px-2 py-1"
                    value={row.status}
                    onChange={(e) => updateRow(idx, 'status', e.target.value)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="mt-4 rounded bg-accent px-4 py-2 text-sm font-semibold text-white" onClick={submit}>
        Save attendance
      </button>
      {message && <p className="mt-2 text-sm text-success">{message}</p>}
    </section>
  );
};

export default AttendanceManager;


