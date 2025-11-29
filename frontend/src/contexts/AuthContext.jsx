import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken);
  const [loading, setLoading] = useState(Boolean(storedToken));

  const login = async ({ username, password, role }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password, role });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser({ id: data.user.id, role: data.user.role });
      return data;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/admin/users/profile');
        if (data?.profile) {
          setUser({ id: data.profile.admin_id || data.profile.faculty_id || data.profile.student_id, role: data.role });
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


