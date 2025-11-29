import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const StaffDirectory = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    // Fetches all faculty (backend logic updated to support no query param)
    api.get('/department/staff').then(({ data }) => setStaff(data));
  }, []);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Staff Directory</h2>
        <p className="text-sm text-slate-500">All faculty members</p>
      </header>
      <div className="max-h-96 overflow-y-auto pr-2">
        <ul className="space-y-2 text-sm text-slate-600">
          {staff.map((member) => (
            <li key={member.faculty_id} className="rounded border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-800">{member.faculty_name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                {member.department_id && (
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                    Dept: {member.department_id}
                  </span>
                )}
              </div>
            </li>
          ))}
          {staff.length === 0 && <p className="text-slate-400 italic">No faculty members found.</p>}
        </ul>
      </div>
    </section>
  );
};

export default StaffDirectory;