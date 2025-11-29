import PageWrapper from '../../components/common/PageWrapper.jsx';
import ActivityManager from '../../components/department/ActivityManager.jsx';
import { exportToPDF } from '../../utils/pdfExport.js';

const DepartmentActivities = () => {
  return (
    <PageWrapper showBackButton backPath="/department/dashboard">
      <div id="activities-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Activities Management</h1>
          <button
            onClick={() => exportToPDF('activities-content', 'department-activities.pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
        </div>
        <ActivityManager />
      </div>
    </PageWrapper>
  );
};

export default DepartmentActivities;

