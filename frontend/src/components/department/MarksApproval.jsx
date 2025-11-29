import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const MarksApproval = () => {
  const [records, setRecords] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [groupedRecords, setGroupedRecords] = useState({});

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/department/pending-marks');
      const records = data.records || [];
      setRecords(records);
      
      // Group records by student/semester for better display
      const grouped = {};
      records.forEach((record) => {
        const key = `${record.usn}_${record.semester}`;
        if (!grouped[key]) {
          grouped[key] = {
            usn: record.usn,
            student_name: record.student_name,
            semester: record.semester,
            department_name: record.department_name,
            student_email: record.student_email,
            student_phone: record.student_phone,
            academic_year: record.academic_year,
            exam_type: record.exam_type,
            exam_date: record.exam_date,
            subjects: []
          };
        }
        grouped[key].subjects.push(record);
      });
      setGroupedRecords(grouped);
    } catch (err) {
      console.error('Failed to load marks', err);
      alert('Failed to load pending marks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const takeAction = async (markId, action) => {
    try {
      await api.put('/department/approve-marks', {
        mark_id: markId,
        action,
        remarks: remarks[markId] || ''
      });
      // Refresh the list
      fetchRecords();
      // Clear remarks for this mark
      setRemarks((prev) => {
        const next = { ...prev };
        delete next[markId];
        return next;
      });
      // Show success notification
      if (action === 'approve') {
        alert('Marks Approved Successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update status');
    }
  };

  const takeBulkAction = async (markIds, action) => {
    if (!window.confirm(`Are you sure you want to ${action} ${markIds.length} subject(s)?`)) {
      return;
    }
    
    try {
      const promises = markIds.map((markId) =>
        api.put('/department/approve-marks', {
          mark_id: markId,
          action,
          remarks: remarks[markId] || ''
        })
      );
      await Promise.all(promises);
      fetchRecords();
      // Clear remarks for these marks
      setRemarks((prev) => {
        const next = { ...prev };
        markIds.forEach((id) => delete next[id]);
        return next;
      });
      // Show success notification
      if (action === 'approve') {
        alert(`Marks Approved Successfully - ${markIds.length} subject(s) approved`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update status');
    }
  };

  const approveAll = async () => {
    const allMarkIds = records.map((r) => r.mark_id);
    if (allMarkIds.length === 0) {
      alert('No pending marks to approve');
      return;
    }
    if (!window.confirm(`Are you sure you want to approve all ${allMarkIds.length} pending marks?`)) {
      return;
    }
    await takeBulkAction(allMarkIds, 'approve');
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Marks Approval Queue</h2>
          <p className="text-sm text-slate-500">Review and approve student marks submissions</p>
        </div>
        <button
          type="button"
          onClick={fetchRecords}
          className="text-sm text-accent hover:underline px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-slate-500">Loading pending records...</p>
        </div>
      )}
      
      {!loading && Object.keys(groupedRecords).length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">No pending marks at the moment.</p>
      )}
      
      <div className="space-y-6">
        {Object.values(groupedRecords).map((group) => {
          const allMarkIds = group.subjects.map((s) => s.mark_id);
          return (
            <div key={`${group.usn}_${group.semester}`} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              {/* Student Header */}
              <div className="mb-4 pb-3 border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-lg">{group.student_name || 'Unknown Student'}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 mt-1">
                      <span>USN: <strong>{group.usn}</strong></span>
                      <span>Semester: <strong>{group.semester}</strong></span>
                      {group.department_name && <span>Dept: <strong>{group.department_name}</strong></span>}
                      {group.academic_year && <span>Year: <strong>{group.academic_year}</strong></span>}
                    </div>
                    {group.exam_type && (
                      <p className="text-xs text-slate-500 mt-1">
                        {group.exam_type} {group.exam_date && `- ${new Date(group.exam_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    Pending
                  </span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Subject Code</th>
                      <th className="px-3 py-2 font-semibold">Subject Name</th>
                      <th className="px-3 py-2 font-semibold text-center">Internal</th>
                      <th className="px-3 py-2 font-semibold text-center">External</th>
                      <th className="px-3 py-2 font-semibold text-center">Total</th>
                      <th className="px-3 py-2 font-semibold text-center">Result</th>
                      <th className="px-3 py-2 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.subjects.map((subject) => (
                      <tr key={subject.mark_id} className="border-b border-slate-100 hover:bg-white">
                        <td className="px-3 py-2 font-mono text-xs">{subject.subject_code}</td>
                        <td className="px-3 py-2">{subject.subject_name}</td>
                        <td className="px-3 py-2 text-center">{subject.internal_marks}</td>
                        <td className="px-3 py-2 text-center">{subject.external_marks}</td>
                        <td className="px-3 py-2 text-center font-semibold">{subject.total_marks}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              subject.result === 'P'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {subject.result || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 justify-center">
                            <button
                              type="button"
                              className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                              onClick={() => takeAction(subject.mark_id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              onClick={() => takeAction(subject.mark_id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex-1">
                  <textarea
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Remarks for all subjects (optional)"
                    value={remarks[allMarkIds[0]] || ''}
                    onChange={(e) => {
                      const newRemarks = { ...remarks };
                      allMarkIds.forEach((id) => {
                        newRemarks[id] = e.target.value;
                      });
                      setRemarks(newRemarks);
                    }}
                  />
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    onClick={() => takeBulkAction(allMarkIds, 'approve')}
                  >
                    Approve All
                  </button>
                  <button
                    type="button"
                    className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => takeBulkAction(allMarkIds, 'reject')}
                  >
                    Reject All
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MarksApproval;
