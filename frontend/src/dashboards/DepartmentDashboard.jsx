import ActivityManager from '../components/department/ActivityManager.jsx';
import CircularManager from '../components/department/CircularManager.jsx';
import StaffDirectory from '../components/department/StaffDirectory.jsx';
import LeaveApproval from '../components/department/LeaveApproval.jsx';
import MarksApproval from '../components/department/MarksApproval.jsx';
import InternshipApproval from '../components/department/InternshipApproval.jsx';
import CertificatesApproval from '../components/department/CertificatesApproval.jsx';

const DepartmentDashboard = () => (
  <div className="space-y-6">
    <MarksApproval />
    <div className="grid gap-6 lg:grid-cols-2">
      <InternshipApproval />
      <CertificatesApproval />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <ActivityManager />
      <CircularManager />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <StaffDirectory />
      <LeaveApproval />
    </div>
  </div>
);

export default DepartmentDashboard;