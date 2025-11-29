import { useState, useEffect } from 'react';
import PageWrapper from '../../components/common/PageWrapper.jsx';
import { api } from '../../api/client.js';
import { exportToPDF } from '../../utils/pdfExport.js';

const AdminCurated = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data } = await api.get('/admin/features');
      // Filter for student-targeted features
      const studentFeatures = Array.isArray(data) 
        ? data.filter((f) => f.target_audience === 'student')
        : [];
      setFeatures(studentFeatures);
    } catch (err) {
      console.error('Failed to fetch features:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper showBackButton backPath="/student/dashboard">
      <div id="admin-curated-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Admin Curated Features</h1>
          <button
            onClick={() => exportToPDF('admin-curated-content', 'admin-features.pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : features.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No curated features available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.feature_id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-800 mb-2">{feature.feature_name}</h3>
                <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{feature.feature_type}</span>
                  {feature.academic_year && <span>{feature.academic_year}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdminCurated;

