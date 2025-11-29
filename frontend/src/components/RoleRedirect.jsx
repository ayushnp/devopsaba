import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const roleToPath = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  department: '/department/dashboard',
  admin: '/admin/dashboard'
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={roleToPath[user.role] || '/login'} replace />;
};

export default RoleRedirect;


