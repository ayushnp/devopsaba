import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  // Handle Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Mouse Move for 3D Effects
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

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030014] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* --- GLOBAL STYLES FOR 3D CUBE & GLITCH --- */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .perspective-container { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        
        /* Glitch Text Effect */
        .glitch-text { position: relative; }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch-text::before {
          left: 2px; text-shadow: -1px 0 #00ffff; clip-path: inset(24% 0 29% 0); animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px; text-shadow: -1px 0 #ff00ff; clip-path: inset(54% 0 21% 0); animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 { 0% { clip-path: inset(20% 0 80% 0); } 20% { clip-path: inset(60% 0 10% 0); } 40% { clip-path: inset(40% 0 50% 0); } 60% { clip-path: inset(80% 0 5% 0); } 80% { clip-path: inset(10% 0 40% 0); } 100% { clip-path: inset(30% 0 60% 0); } }
        @keyframes glitch-anim-2 { 0% { clip-path: inset(10% 0 60% 0); } 20% { clip-path: inset(30% 0 10% 0); } 40% { clip-path: inset(80% 0 5% 0); } 60% { clip-path: inset(15% 0 80% 0); } 80% { clip-path: inset(60% 0 20% 0); } 100% { clip-path: inset(40% 0 30% 0); } }
      `}</style>

      {/* --- CYBERPUNK BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Floor */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               transform: `perspective(500px) rotateX(60deg) translateY(${mousePos.y * 20}px) translateZ(-100px)`,
               transformOrigin: 'top center'
             }} 
        />
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-[#030014]/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-10 w-10 flex items-center justify-center bg-cyan-500/10 rounded border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
               {/* Logo Icon Placeholder */}
               <div className="w-4 h-4 bg-cyan-400 rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
            </div>
            <span className="text-xl font-bold tracking-[0.2em] text-white group-hover:text-cyan-400 transition-colors">SOOCHNA</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'About', 'Contact'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="hidden md:block px-6 py-2 text-xs font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all rounded-sm">
              Login
            </Link>
            <Link to="/signup" className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all rounded-sm">
              Join System
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center min-h-screen">
        
        {/* LEFT: Text Content */}
        <div className="flex-1 text-left z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-900/20 text-cyan-400 text-[10px] tracking-[0.2em] mb-6 animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            SYSTEM ONLINE v2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">CAMPUS</span>
            <span className="glitch-text block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600" data-text="INTELLIGENCE">
              INTELLIGENCE
            </span>
          </h1>
          
          <p className="text-slate-400 max-w-xl text-lg leading-relaxed mb-10 border-l-2 border-cyan-500/30 pl-6">
            Orchestrate your entire academic ecosystem. 
            <span className="text-cyan-400"> Real-time analytics</span>, 
            <span className="text-purple-400"> automated workflows</span>, and 
            <span className="text-pink-400"> seamless communication</span> in one unified interface.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/signup" className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-sm overflow-hidden hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative group-hover:text-black">Initialize Access</span>
            </Link>
            <Link to="/login" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/5 hover:border-white/50 transition-all">
              Live Demo
            </Link>
          </div>
        </div>

        {/* RIGHT: Interactive 3D Cube (CSS Only) */}
        <div className="flex-1 flex items-center justify-center relative h-[500px] w-full perspective-container">
          <div 
            className="relative w-64 h-64 preserve-3d transition-transform duration-100 ease-out"
            style={{
              transform: `rotateX(${mousePos.y * -30}deg) rotateY(${mousePos.x * 30}deg)`
            }}
          >
            {/* Cube Faces */}
            <div className="absolute inset-0 border-2 border-cyan-500/50 bg-cyan-900/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]" style={{ transform: 'translateZ(128px)' }}>STUDENT</div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-900/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]" style={{ transform: 'rotateY(180deg) translateZ(128px)' }}>FACULTY</div>
            <div className="absolute inset-0 border-2 border-blue-500/50 bg-blue-900/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]" style={{ transform: 'rotateY(90deg) translateZ(128px)' }}>ADMIN</div>
            <div className="absolute inset-0 border-2 border-pink-500/50 bg-pink-900/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]" style={{ transform: 'rotateY(-90deg) translateZ(128px)' }}>DEPT</div>
            <div className="absolute inset-0 border-2 border-white/20 bg-black/50 backdrop-blur-sm" style={{ transform: 'rotateX(90deg) translateZ(128px)' }}></div>
            <div className="absolute inset-0 border-2 border-white/20 bg-black/50 backdrop-blur-sm shadow-[0_0_100px_rgba(0,240,255,0.3)]" style={{ transform: 'rotateX(-90deg) translateZ(128px)' }}></div>
          </div>
        </div>

      </main>

      {/* --- STATS STRIP --- */}
      <div className="w-full border-y border-white/10 bg-black/40 backdrop-blur-md overflow-hidden py-6 relative z-20">
         <div className="max-w-7xl mx-auto px-6 flex justify-between md:justify-around items-center">
            {[
              { label: 'Active Users', value: '2,500+' },
              { label: 'Daily Events', value: '150+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-cyan-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
         </div>
      </div>

      {/* --- FEATURES GRID (Holographic Cards) --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">SYSTEM MODULES</h2>
             <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Student Portal', 
                desc: 'Access marks, attendance, and projects in a unified dashboard.', 
                color: 'cyan',
                icon: 'M12 14l9-5-9-5-9 5 9 5z'
              },
              { 
                title: 'Faculty Hub', 
                desc: 'Manage courses, approve requests, and track student progress.', 
                color: 'purple',
                icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              },
              { 
                title: 'Admin Console', 
                desc: 'Full system control, fee structures, and global analytics.', 
                color: 'blue',
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              }
            ].map((card, i) => (
              <div 
                key={i} 
                className="group relative p-8 border border-white/10 bg-[#0A0A12] hover:bg-[#0F0F1A] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${card.color}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`w-12 h-12 rounded-lg bg-${card.color}-500/10 flex items-center justify-center mb-6 text-${card.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{card.desc}</p>
                
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  <span>Explore Module</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-[#020205] pt-20 pb-10 text-center md:text-left relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <div className="w-8 h-8 bg-cyan-500 rotate-45"></div>
              <span className="text-2xl font-bold tracking-widest text-white">SOOCHNA</span>
            </div>
            <p className="text-slate-400 max-w-sm mx-auto md:mx-0">
              Advanced campus management solution designed for the future of education technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 uppercase tracking-widest">
          <p>&copy; 2025 SOOCHNA SYSTEM. ALL SYSTEMS OPERATIONAL.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
             <span>v2.0.4</span>
             <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;