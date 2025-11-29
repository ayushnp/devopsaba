import { useState } from 'react';
import { api } from '../../api/client.js';

const MasterDataManager = () => {
  const [type, setType] = useState('hostel_route');
  const [hostelForm, setHostelForm] = useState({ route_name: '', transport_details: '' });
  const [feeForm, setFeeForm] = useState({ department_id: '', academic_year: '', structure_details: '' });
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (type === 'hostel_route') {
      payload = {
        transport_details: { description: hostelForm.transport_details },
        route_name: hostelForm.route_name,
        active: true
      };
    } else {
      payload = {
        department_id: feeForm.department_id,
        academic_year: feeForm.academic_year,
        structure_details: { description: feeForm.structure_details }
      };
    }
    const { data } = await api.post('/admin/master-data', { type, ...payload });
    setHistory((prev) => [data, ...prev]);
    setHostelForm({ route_name: '', transport_details: '' });
    setFeeForm({ department_id: '', academic_year: '', structure_details: '' });
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Master Data Manager</h2>
      <p className="mb-4 text-sm text-slate-500">Hostel routes, transport & fee structure</p>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <select
          className="w-full rounded border border-slate-200 px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="hostel_route">Hostel Route</option>
          <option value="fee_structure">Fee Structure</option>
        </select>
        {type === 'hostel_route' ? (
          <div className="space-y-3">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Route Name"
              value={hostelForm.route_name}
              onChange={(e) => setHostelForm((prev) => ({ ...prev, route_name: e.target.value }))}
            />
            <textarea
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Transport details"
              value={hostelForm.transport_details}
              onChange={(e) => setHostelForm((prev) => ({ ...prev, transport_details: e.target.value }))}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Department ID"
              value={feeForm.department_id}
              onChange={(e) => setFeeForm((prev) => ({ ...prev, department_id: e.target.value }))}
            />
            <input
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Academic Year"
              value={feeForm.academic_year}
              onChange={(e) => setFeeForm((prev) => ({ ...prev, academic_year: e.target.value }))}
            />
            <textarea
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Structure details"
              value={feeForm.structure_details}
              onChange={(e) => setFeeForm((prev) => ({ ...prev, structure_details: e.target.value }))}
            />
          </div>
        )}
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white">
          Save master data
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {history.map((item) => (
          <li key={item.route_id || item.fee_id}>Saved entry #{item.route_id || item.fee_id}</li>
        ))}
      </ul>
    </section>
  );
};

export default MasterDataManager;


