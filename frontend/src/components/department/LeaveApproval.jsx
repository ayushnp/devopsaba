import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const LeaveApproval = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data } = await api.get('/department/leave-requests');
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (leaveId, status) => {
    await api.put('/department/leave-approval', { leave_id: leaveId, status });
    fetchRequests();
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Leave Approval</h2>
      <p className="mb-4 text-sm text-slate-500">Approve or reject student leave</p>
      <div className="space-y-3 text-sm text-slate-600">
        {requests.length === 0 && <p>No pending requests</p>}
        {requests.map((req) => (
          <div key={req.leave_id} className="rounded border border-slate-200 p-3">
            <p className="font-medium">
              {req.name} ({req.usn})
            </p>
            <p className="text-xs text-slate-500">
              {req.from_date} → {req.to_date}
            </p>
            <p className="mt-2">{req.leave_details}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded bg-success px-3 py-1 text-xs text-white"
                onClick={() => updateStatus(req.leave_id, 'approved')}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded bg-danger px-3 py-1 text-xs text-white"
                onClick={() => updateStatus(req.leave_id, 'rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LeaveApproval;


