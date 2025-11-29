import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Signup from './pages/Signup.jsx';

import StudentDashboard from './dashboards/StudentDashboard.jsx';
import FacultyDashboard from './dashboards/FacultyDashboard.jsx';
import DepartmentDashboard from './dashboards/DepartmentDashboard.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';
import RoleRedirect from './components/RoleRedirect.jsx';

// Student Pages
import StudentMarks from './pages/student/StudentMarks.jsx';
import StudentLeave from './pages/student/StudentLeave.jsx';
import StudentProjects from './pages/student/StudentProjects.jsx';
import StudentInternships from './pages/student/StudentInternships.jsx';
import StudentCertificates from './pages/student/StudentCertificates.jsx';
import StudentProfile from './pages/student/StudentProfile.jsx';
import AdminCurated from './pages/student/AdminCurated.jsx';
import StudentCourses from './pages/student/StudentCourses.jsx';
import StudentAttendance from './pages/student/StudentAttendance.jsx';

// Department Pages
import DepartmentMarksApproval from './pages/department/DepartmentMarksApproval.jsx';
import DepartmentLeaveApproval from './pages/department/DepartmentLeaveApproval.jsx';
import DepartmentInternshipApproval from './pages/department/DepartmentInternshipApproval.jsx';
import DepartmentCertificatesApproval from './pages/department/DepartmentCertificatesApproval.jsx';
import DepartmentActivities from './pages/department/DepartmentActivities.jsx';
import DepartmentCirculars from './pages/department/DepartmentCirculars.jsx';
import DepartmentStaff from './pages/department/DepartmentStaff.jsx';

// Admin Pages
import AdminFeatures from './pages/admin/AdminFeatures.jsx';
import AdminFeeStructure from './pages/admin/AdminFeeStructure.jsx';

// Faculty Pages
import FacultyCourses from './pages/faculty/FacultyCourses.jsx';
import FacultyAttendance from './pages/faculty/FacultyAttendance.jsx';
import FacultyStudents from './pages/faculty/FacultyStudents.jsx';
import FacultyProjects from './pages/faculty/FacultyProjects.jsx';
import FacultyProfile from './pages/faculty/FacultyProfile.jsx';

const App = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* Protected Dashboard Routes */}
    <Route element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'department']} />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<RoleRedirect />} />
        
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/marks" element={<StudentMarks />} />
        <Route path="/student/leave" element={<StudentLeave />} />
        <Route path="/student/projects" element={<StudentProjects />} />
        <Route path="/student/internships" element={<StudentInternships />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/admin-curated" element={<AdminCurated />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />

        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/courses" element={<FacultyCourses />} />
        <Route path="/faculty/attendance" element={<FacultyAttendance />} />
        <Route path="/faculty/students" element={<FacultyStudents />} />
        <Route path="/faculty/projects" element={<FacultyProjects />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />

        <Route path="/department/dashboard" element={<DepartmentDashboard />} />
        <Route path="/department/marks-approval" element={<DepartmentMarksApproval />} />
        <Route path="/department/leave-approval" element={<DepartmentLeaveApproval />} />
        <Route path="/department/internship-approval" element={<DepartmentInternshipApproval />} />
        <Route path="/department/certificates-approval" element={<DepartmentCertificatesApproval />} />
        <Route path="/department/activities" element={<DepartmentActivities />} />
        <Route path="/department/circulars" element={<DepartmentCirculars />} />
        <Route path="/department/staff" element={<DepartmentStaff />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/features" element={<AdminFeatures />} />
        <Route path="/admin/fee-structure" element={<AdminFeeStructure />} />
        <Route path="/admin/login-logs" element={<AdminDashboard />} />
      </Route>
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;