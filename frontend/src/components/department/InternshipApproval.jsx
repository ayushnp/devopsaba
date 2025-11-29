import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const InternshipApproval = () => {
  const [records, setRecords] = useState([]);

  const loadRecords = async () => {
    try {
      const { data } = await api.get('/department/pending-internships');
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load internships', err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Internship Submissions</h2>
          <p className="text-sm text-slate-500">View student internship details</p>
        </div>
        <button className="text-sm text-accent hover:underline" type="button" onClick={loadRecords}>
          Refresh
        </button>
      </div>
      
      {records.length === 0 && <p className="text-sm text-slate-500">No internships found.</p>}
      
      <div className="space-y-4">
        {records.map((item) => (
          <div key={item.internship_id} className="rounded-lg border border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800">{item.student_name}</p>
                <p className="text-xs text-slate-500 font-mono">{item.usn}</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                {item.approval_status || 'Submitted'}
              </span>
            </div>
            
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Company</p>
                <p className="font-medium">{item.company}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p>{item.start_date} → {item.end_date || 'Present'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Stipend</p>
                <p>{item.stipend ? `₹${item.stipend}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tech Stack</p>
                <p className="truncate">
                  {(Array.isArray(item.stack_data?.technologies)
                    ? item.stack_data.technologies
                    : item.stack_data
                    ? Object.values(item.stack_data)
                    : []
                  ).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InternshipApproval;