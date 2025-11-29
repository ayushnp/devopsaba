import { useState, useEffect } from 'react';
import PageWrapper from '../../components/common/PageWrapper.jsx';
import { api } from '../../api/client.js';
import { exportToPDF } from '../../utils/pdfExport.js';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/student/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get downloadable URL
  const getDownloadUrl = (path) => {
    if (!path) return '#';
    // Assuming server is running on same host or proxy forwards /uploads
    // If path is "uploads/file.pdf", we want "/uploads/file.pdf"
    // If path is absolute or has backslashes, we clean it
    const cleanPath = path.replace(/\\/g, '/'); 
    // If backend returns full path "uploads/..." ensure we access via root relative
    return `/${cleanPath}`;
  };

  return (
    <PageWrapper showBackButton backPath="/student/dashboard">
      <div id="courses-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Course Materials</h1>
          <button
            onClick={() => exportToPDF('courses-content', 'student-courses.pdf')}
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
        ) : courses.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No course materials available yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.course_id} className="flex flex-col p-5 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-slate-50">
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-800">{course.course_name}</h3>
                    <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
                      {course.course_code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Faculty: {course.faculty_name || 'N/A'}</p>
                  <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    {course.semester && <span className="bg-white border px-2 py-0.5 rounded">Sem {course.semester}</span>}
                    {course.academic_year && <span className="bg-white border px-2 py-0.5 rounded">Year {course.academic_year}</span>}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Downloads</p>
                  {course.materials && Array.isArray(course.materials) && course.materials.length > 0 ? (
                    <ul className="space-y-2">
                      {course.materials.map((material, idx) => (
                        <li key={idx}>
                          <a 
                            href={getDownloadUrl(material.path)} 
                            download
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline group"
                          >
                            <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {material.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No files attached.</p>
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

export default StudentCourses;