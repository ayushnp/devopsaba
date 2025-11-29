import { useState, useEffect } from 'react';
import PageWrapper from '../../components/common/PageWrapper.jsx';
import { api } from '../../api/client.js';
import { exportToPDF } from '../../utils/pdfExport.js';

const AdminFeeStructure = () => {
  const [form, setForm] = useState({
    department_id: '',
    academic_year: '',
    structure_details: ''
  });
  const [feeStructures, setFeeStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeeStructures();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/department/list');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const { data } = await api.get('/admin/fee-structure');
      setFeeStructures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch fee structures:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.academic_year) {
      alert('Please enter academic year');
      return;
    }
    setLoading(true);
    try {
      let structureDetails = {};
      if (form.structure_details) {
        try {
          structureDetails = JSON.parse(form.structure_details);
        } catch (parseErr) {
          // If not valid JSON, treat as plain text
          structureDetails = { description: form.structure_details };
        }
      }
      
      const payload = {
        department_id: form.department_id ? parseInt(form.department_id, 10) : null,
        academic_year: form.academic_year,
        structure_details: structureDetails
      };
      
      await api.post('/admin/fee-structure', payload);
      alert('Fee structure saved successfully!');
      setForm({ department_id: '', academic_year: '', structure_details: '' });
      fetchFeeStructures();
    } catch (err) {
      console.error('Fee structure error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save fee structure';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper showBackButton backPath="/admin/dashboard">
      <div id="fee-structure-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Fee Structure Management</h1>
          <button
            onClick={() => exportToPDF('fee-structure-content', 'fee-structure.pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                className="w-full rounded border border-slate-200 px-3 py-2"
                value={form.department_id}
                onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                className="w-full rounded border border-slate-200 px-3 py-2"
                value={form.academic_year}
                onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))}
                placeholder="e.g., 2024-25"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fee Structure Details (JSON)</label>
            <textarea
              className="w-full rounded border border-slate-200 px-3 py-2"
              rows="6"
              value={form.structure_details}
              onChange={(e) => setForm((prev) => ({ ...prev, structure_details: e.target.value }))}
              placeholder='{"tuition": 50000, "hostel": 20000, ...}'
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Fee Structure'}
          </button>
        </form>

        <div>
          <h2 className="text-lg font-semibold mb-4">Existing Fee Structures</h2>
          {feeStructures.length === 0 ? (
            <p className="text-slate-500">No fee structures found.</p>
          ) : (
            <div className="space-y-3">
              {feeStructures.map((fee) => (
                <div key={fee.fee_id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Academic Year: {fee.academic_year}</p>
                      {fee.department_id && (
                        <p className="text-sm text-slate-600">
                          Department: {departments.find(d => d.department_id === fee.department_id)?.department_name || `ID: ${fee.department_id}`}
                        </p>
                      )}
                      <pre className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                        {JSON.stringify(fee.structure_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminFeeStructure;

