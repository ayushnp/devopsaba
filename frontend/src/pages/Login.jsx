import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isValidEmail } from '../utils/validators.js';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // UI STATE ONLY: Mouse position for background effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateField = (name, value, role = form.role) => {
    if (name === 'username') {
      if (!value.trim()) return 'Username is required';
      if (role !== 'student' && !isValidEmail(value)) {
        return 'Enter a valid institutional email';
      }
    }
    if (name === 'password' && !value.trim()) {
      return 'Password is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    if (name === 'role') {
      setFieldErrors((prev) => ({ ...prev, username: validateField('username', nextForm.username, value) }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
    setForm(nextForm);
  };

  const hasValidationErrors = Object.values(fieldErrors).some(Boolean) || !form.username || !form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameError = validateField('username', form.username);
    const passwordError = validateField('password', form.password);
    setFieldErrors({ username: usernameError, password: passwordError });
    if (usernameError || passwordError) {
      alert('Please fix highlighted errors before submitting.');
      return;
    }
    setError(null);
    try {
      const data = await login(form);
      const userRole = data.user.role;
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (userRole === 'department') {
        navigate('/department/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030014] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               transform: `perspective(500px) rotateX(60deg) translateY(${mousePos.y * 20}px) translateZ(-100px)`,
               transformOrigin: 'top center'
             }} 
        />
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        {/* Decorative Border/Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
        
        <div className="relative bg-[#0A0A12]/90 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              ACCESS PORTAL
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Authenticate Identity</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Role Selector */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Select Clearance Level</label>
               <div className="relative">
                 <select
                   className="w-full bg-[#1A1A2E] border border-cyan-500/30 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] appearance-none transition-all uppercase text-sm"
                   name="role"
                   value={form.role}
                   onChange={handleChange}
                 >
                   <option value="student">Student</option>
                   <option value="faculty">Faculty</option>
                   <option value="department">Department Head</option>
                   <option value="admin">Administrator</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-500">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                 </div>
               </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <input
                className="w-full bg-[#1A1A2E] border border-white/10 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] placeholder-slate-600 transition-all"
                placeholder="EMAIL / USERNAME"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
              {fieldErrors.username && <span className="text-xs text-red-400 tracking-wide">{fieldErrors.username}</span>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <input
                type="password"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] placeholder-slate-600 transition-all"
                placeholder="PASSWORD"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {fieldErrors.password && <span className="text-xs text-red-400 tracking-wide">{fieldErrors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              disabled={loading || hasValidationErrors}
            >
               <span className="relative z-10">{loading ? 'Authenticating...' : 'Initiate Session'}</span>
               <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20"></div>
            </button>

            <div className="text-center mt-6">
               <p className="text-slate-400 text-xs">
                 New User? {' '}
                 <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 underline-offset-4 transition-all">
                   Initialize Registration
                 </Link>
               </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;