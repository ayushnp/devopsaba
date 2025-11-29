import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const linksByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/features', label: 'Features' },
    { to: '/admin/fee-structure', label: 'Fee Structure' },
    { to: '/admin/login-logs', label: 'Login Logs' }
  ],
  faculty: [
    { to: '/faculty/dashboard', label: 'Dashboard' },
    { to: '/faculty/courses', label: 'Courses' },
    { to: '/faculty/attendance', label: 'Attendance' },
    { to: '/faculty/students', label: 'Students' },
    { to: '/faculty/projects', label: 'Projects' },
    { to: '/faculty/profile', label: 'Profile' }
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/marks', label: 'Marks' },
    { to: '/student/leave', label: 'Leave' },
    { to: '/student/projects', label: 'Projects' },
    { to: '/student/internships', label: 'Internships' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/courses', label: 'Courses' },
    { to: '/student/attendance', label: 'Attendance' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/admin-curated', label: 'Admin Features' }
  ],
  department: [
    { to: '/department/dashboard', label: 'Dashboard' },
    { to: '/department/marks-approval', label: 'Marks Approval' },
    { to: '/department/leave-approval', label: 'Leave Approval' },
    { to: '/department/internship-approval', label: 'Internship Approval' },
    { to: '/department/certificates-approval', label: 'Certificates Approval' },
    { to: '/department/activities', label: 'Activities' },
    { to: '/department/circulars', label: 'Circulars' },
    { to: '/department/staff', label: 'Staff' }
  ]
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out
          md:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 pt-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { if(window.innerWidth < 768) onClose() }}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="mb-3 px-2">
            <p className="text-xs font-bold uppercase text-slate-500">Logged in as</p>
            <p className="truncate text-sm font-medium text-slate-200">{user?.username || 'User'}</p>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-600/20"
            onClick={logout}
          >
            <span>Sign out</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;