import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const CertificatesApproval = () => {
  const [records, setRecords] = useState([]);

  const loadRecords = async () => {
    try {
      const { data } = await api.get('/department/pending-certificates');
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load certificates', err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Certificates</h2>
          
        </div>
        <button className="text-sm text-accent hover:underline" type="button" onClick={loadRecords}>
          Refresh
        </button>
      </div>
      
      {records.length === 0 && <p className="text-sm text-slate-500">No certificates found.</p>}
      
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.certificate_id} className="rounded-lg border border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800">{record.student_name}</p>
                <p className="text-xs text-slate-500 font-mono">{record.usn}</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">
                {record.certificate_type}
              </span>
            </div>
            
            <div className="grid gap-2 text-sm md:grid-cols-2">
              {record.competition && <p><span className="text-slate-500">Competition:</span> {record.competition}</p>}
              {record.internship && <p><span className="text-slate-500">Internship:</span> {record.internship}</p>}
              {record.workshop && <p><span className="text-slate-500">Workshop:</span> {record.workshop}</p>}
            </div>
            
            
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificatesApproval;