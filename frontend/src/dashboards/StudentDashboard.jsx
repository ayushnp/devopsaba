import StudentProfile from '../components/student/StudentProfile.jsx';
import MarksUpload from '../components/student/MarksUpload.jsx';
import CertificatesUpload from '../components/student/CertificatesUpload.jsx';
import ProjectsSection from '../components/student/ProjectsSection.jsx';
import InternshipSection from '../components/student/InternshipSection.jsx';
import LeaveRequest from '../components/student/LeaveRequest.jsx';
import FeedbackForm from '../components/student/FeedbackForm.jsx';

const StudentDashboard = () => (
  <div className="space-y-6">
    {/* Quick Actions / Summary could go here */}
    
    <div className="grid gap-6 lg:grid-cols-2">
      <StudentProfile />
      <MarksUpload />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <CertificatesUpload />
      <ProjectsSection />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <InternshipSection />
      <LeaveRequest />
    </div>
    <FeedbackForm />
  </div>
);

export default StudentDashboard;