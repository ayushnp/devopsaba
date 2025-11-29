import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = () => {
    if (!user) return '/';
    const role = user.role;
    return `/${role}/dashboard`;
  };

  const getRoleLinks = () => {
    if (!user) return [];
    const role = user.role;
    
    const links = {
      student: [
        { to: '/student/marks', label: 'Marks' },
        { to: '/student/leave', label: 'Leave' },
        { to: '/student/projects', label: 'Projects' },
        { to: '/student/internships', label: 'Internships' },
        { to: '/student/certificates', label: 'Certificates' },
        { to: '/student/profile', label: 'Profile' },
        { to: '/student/notifications', label: 'Notifications' },
        { to: '/student/admin-curated', label: 'Admin Features' }
      ],
      faculty: [
        { to: '/faculty/courses', label: 'Courses' },
        { to: '/faculty/attendance', label: 'Attendance' },
        { to: '/faculty/students', label: 'Students' },
        { to: '/faculty/projects', label: 'Projects' },
        { to: '/faculty/profile', label: 'Profile' },
        { to: '/faculty/notifications', label: 'Notifications' }
      ],
      department: [
        { to: '/department/marks-approval', label: 'Marks Approval' },
        { to: '/department/leave-approval', label: 'Leave Approval' },
        { to: '/department/internship-approval', label: 'Internship Approval' },
        { to: '/department/certificates-approval', label: 'Certificates Approval' },
        { to: '/department/activities', label: 'Activities' },
        { to: '/department/circulars', label: 'Circulars' },
        { to: '/department/staff', label: 'Staff' }
      ],
      admin: [
        { to: '/admin/features', label: 'Features' },
        { to: '/admin/fee-structure', label: 'Fee Structure' },
        { to: '/admin/notifications', label: 'Notifications' }
      ]
    };
    
    return links[role] || [];
  };

  return (
    <nav className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <span className="text-xl font-bold text-slate-800">Soochna</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Home
            </Link>
            
            {user && (
              <>
                <Link
                  to={getRoleDashboard()}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Dashboard
                </Link>
                
                {/* Dropdown for Features */}
                <div className="relative group">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1">
                    Features
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {getRoleLinks().map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600 capitalize">{user.role}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

