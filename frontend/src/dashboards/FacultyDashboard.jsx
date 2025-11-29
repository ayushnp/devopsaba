import FacultyProfile from '../components/faculty/FacultyProfile.jsx';
import CourseMaterials from '../components/faculty/CourseMaterials.jsx';
import AttendanceManager from '../components/faculty/AttendanceManager.jsx';
import StudentListView from '../components/faculty/StudentListView.jsx';

const FacultyDashboard = () => (
  <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile and Course Management side by side */}
      <FacultyProfile />
      <CourseMaterials />
    </div>
    
    {/* Attendance and Student List below */}
    <div className="grid gap-6 lg:grid-cols-1">
      <AttendanceManager />
    </div>
    
    <div className="grid gap-6 lg:grid-cols-1">
      <StudentListView />
    </div>
  </div>
);

export default FacultyDashboard;