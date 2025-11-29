import { useState, useEffect } from 'react';
import PageWrapper from '../../components/common/PageWrapper.jsx';
import { api } from '../../api/client.js';
import { exportToPDF } from '../../utils/pdfExport.js';

const FacultyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/faculty/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveProject = async (projectId, status) => {
    try {
      await api.put(`/faculty/projects/${projectId}`, { status });
      fetchProjects();
      alert(`Project ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      alert('Failed to update project status');
    }
  };

  return (
    <PageWrapper showBackButton backPath="/faculty/dashboard">
      <div id="projects-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Student Project Reviews</h1>
          <button
            onClick={() => exportToPDF('projects-content', 'faculty-projects.pdf')}
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
        ) : projects.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No projects submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.project_id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{project.project_name}</h3>
                    <p className="text-sm text-slate-600">Student: {project.student_name || 'Unknown'}</p>
                    <p className="text-sm text-slate-600">Domain: {project.domain || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'approved' ? 'bg-green-100 text-green-700' :
                    project.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {project.status || 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{project.impact}</p>
                <div className="flex gap-2">
                  {(!project.status || project.status === 'pending') && (
                    <>
                      <button
                        onClick={() => approveProject(project.project_id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => approveProject(project.project_id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default FacultyProjects;

