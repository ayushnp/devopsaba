import { useState } from 'react';
import { api } from '../../api/client.js';

const MarksUpload = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ 
    semester: '',
    academic_year: '',
    exam_type: 'Semester Result',
    exam_date: new Date().toISOString().split('T')[0]
  });
  
  const [subjects, setSubjects] = useState([
    { subject_code: '', subject_name: '', internal_marks: '', external_marks: '' }
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { subject_code: '', subject_name: '', internal_marks: '', external_marks: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = {
      ...newSubjects[index],
      [field]: value
    };
    setSubjects(newSubjects);
  };

  const submitMarks = async () => {
    // Validation
    if (!meta.semester) {
      alert('Please enter Semester');
      return;
    }

    const validSubjects = subjects.filter(subject => 
      subject.subject_code && subject.subject_name && 
      subject.internal_marks !== '' && subject.external_marks !== ''
    );

    if (validSubjects.length === 0) {
      alert('Please enter at least one subject with marks');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/student/marks', {
        semester: parseInt(meta.semester, 10),
        academic_year: meta.academic_year || null,
        exam_type: meta.exam_type || 'Semester Result',
        exam_date: meta.exam_date || null,
        subjects: validSubjects.map((subject) => ({
          ...subject,
          internal_marks: parseInt(subject.internal_marks, 10),
          external_marks: parseInt(subject.external_marks, 10)
        }))
      });

      if (data.success) {
        setResult({ ...data, message: data.message || 'Marks submitted for approval' });
        setSubjects([{ subject_code: '', subject_name: '', internal_marks: '', external_marks: '' }]);
        setMeta({ 
          semester: '',
          academic_year: '',
          exam_type: 'Semester Result',
          exam_date: new Date().toISOString().split('T')[0]
        });
      } else {
        alert('Submission failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Submission failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubjects([{ subject_code: '', subject_name: '', internal_marks: '', external_marks: '' }]);
    setMeta({ 
      semester: '',
      academic_year: '',
      exam_type: 'Semester Result',
      exam_date: new Date().toISOString().split('T')[0]
    });
    setResult(null);
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manual Marks Entry</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your marks manually for department approval</p>
      </header>

      {/* Student Information */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester *
          </label>
          <input
            type="number"
            min="1"
            max="8"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            placeholder="e.g., 4"
            value={meta.semester}
            onChange={(e) => setMeta(prev => ({ ...prev, semester: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            placeholder="e.g., 2024-25"
            value={meta.academic_year}
            onChange={(e) => setMeta(prev => ({ ...prev, academic_year: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Type
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            placeholder="e.g., Semester Result"
            value={meta.exam_type}
            onChange={(e) => setMeta(prev => ({ ...prev, exam_type: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            value={meta.exam_date}
            onChange={(e) => setMeta(prev => ({ ...prev, exam_date: e.target.value }))}
          />
        </div>
      </div>

      {/* Subjects Entry */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Subjects & Marks</h3>
          <button
            type="button"
            onClick={addSubject}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            + Add Subject
          </button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code *
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="e.g., BCS401"
                    value={subject.subject_code}
                    onChange={(e) => updateSubject(index, 'subject_code', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="e.g., ANALYSIS & DESIGN OF ALGORITHMS"
                    value={subject.subject_name}
                    onChange={(e) => updateSubject(index, 'subject_name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="0-100"
                      value={subject.internal_marks}
                      onChange={(e) => updateSubject(index, 'internal_marks', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="0-100"
                      value={subject.external_marks}
                      onChange={(e) => updateSubject(index, 'external_marks', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {subjects.length > 1 && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center"
          disabled={loading}
          onClick={submitMarks}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit for Approval'
          )}
        </button>
        
        <button
          type="button"
          className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={resetForm}
        >
          Reset
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-6">
          <div className="rounded-lg bg-green-50 border border-green-200 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-green-800">Submission Successful</h3>
                <p className="text-green-700">{result.message}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white rounded-lg p-4 border border-green-100">
              <div>
                <div className="text-green-600 font-medium">Student Name</div>
                <div className="text-gray-800 font-semibold">{result.summary?.studentName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-green-600 font-medium">USN</div>
                <div className="text-gray-800 font-semibold">{result.summary?.usn || 'N/A'}</div>
              </div>
              <div>
                <div className="text-green-600 font-medium">Semester</div>
                <div className="text-gray-800 font-semibold">{result.summary?.semester || 'N/A'}</div>
              </div>
              <div>
                <div className="text-green-600 font-medium">Subjects Submitted</div>
                <div className="text-gray-800 font-semibold">{result.summary?.subjectsInserted}</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Your marks have been submitted for department approval. 
                You can check the approval status in your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarksUpload;