import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';

const Signup = () => {
  const navigate = useNavigate();
  
  // --- LOGIC STATE (Kept existing) ---
  const [form, setForm] = useState({ name: '', email: '', password: '', usn: '', role: 'student' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- UI STATE (From Login Page) ---
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

  // --- LOGIC HANDLERS (Kept existing) ---
  const validate = (name, value, nextForm = form) => {
    if (name === 'name' && !value.trim()) return 'Name is required';
    if (name === 'email' && !isValidEmail(value)) return 'Enter a valid email';
    if (name === 'password' && !isValidPassword(value)) {
      return 'Password must include uppercase, lowercase, number & symbol';
    }
    if (name === 'usn' && nextForm.role === 'student' && !value.trim()) return 'USN is required for students';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    const errorMsg = validate(name, value, nextForm);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const canSubmit =
    form.name &&
    isValidEmail(form.email) &&
    isValidPassword(form.password) &&
    (form.role !== 'student' || form.usn) &&
    !Object.values(fieldErrors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validate('name', form.name),
      email: validate('email', form.email),
      password: validate('password', form.password),
      usn: validate('usn', form.usn)
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      alert('Please resolve highlighted errors.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', form);
      alert('Registration successful! Please login with your new account.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER (New UI, Old Logic) ---
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

      {/* --- SIGNUP CARD --- */}
      <div className="relative z-10 w-full max-w-lg p-8 mx-4 my-10">
        {/* Decorative Border/Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
        
        <div className="relative bg-[#0A0A12]/90 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              REGISTRATION
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Create New Identity</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            
            {/* Role Selector */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Clearance Level</label>
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

            {/* Name Input */}
            <div className="space-y-2">
              <input
                className="w-full bg-[#1A1A2E] border border-white/10 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] placeholder-slate-600 transition-all"
                placeholder="FULL NAME"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && <span className="text-xs text-red-400 tracking-wide block">{fieldErrors.name}</span>}
            </div>

            {/* Conditional USN Input */}
            {form.role === 'student' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] placeholder-slate-600 transition-all"
                  placeholder="USN (STUDENT ID)"
                  name="usn"
                  value={form.usn}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.usn && <span className="text-xs text-red-400 tracking-wide block">{fieldErrors.usn}</span>}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <input
                type="email"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded text-white px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] placeholder-slate-600 transition-all"
                placeholder={form.role === 'admin' || form.role === 'department' ? 'EMAIL (USED AS USERNAME)' : 'EMAIL ADDRESS'}
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <span className="text-xs text-red-400 tracking-wide block">{fieldErrors.email}</span>}
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
              <div className="flex justify-between items-start">
                 <span className={`text-[10px] uppercase tracking-wider ${isValidPassword(form.password) ? 'text-cyan-400' : 'text-slate-500'}`}>
                   Must include Upper, Lower, # & Symbol
                 </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded"
              disabled={loading || !canSubmit}
            >
               <span className="relative z-10">{loading ? 'Processing...' : 'Register Account'}</span>
               <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20"></div>
            </button>

            <div className="text-center mt-6">
               <p className="text-slate-400 text-xs">
                 Already have an account? {' '}
                 <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 underline-offset-4 transition-all">
                   Access Portal
                 </Link>
               </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;