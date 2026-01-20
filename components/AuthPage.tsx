
import React, { useState, useEffect } from 'react';
import { supabase, signInWithGoogle } from '../services/supabaseClient';

interface AuthPageProps {
  onGuestLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onGuestLogin }) => {
  const [role, setRole] = useState<'user' | 'guide'>('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [terminalStep, setTerminalStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Terminal Animation Sequence
    const timeouts = [
      setTimeout(() => setTerminalStep(1), 500),   // Command typed
      setTimeout(() => setTerminalStep(2), 1500),  // Line 1
      setTimeout(() => setTerminalStep(3), 2200),  // Line 2
      setTimeout(() => setTerminalStep(4), 3000),  // Line 3
      setTimeout(() => setTerminalStep(5), 3800),  // Card appears
    ];

    return () => {
      window.removeEventListener('scroll', handleScroll);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const stats = [
    { label: "Active Nodes", value: "48" },
    { label: "Verified Experts", value: "1.2K" },
    { label: "Routes Synthesized", value: "85k+" },
    { label: "Cultural Data Points", value: "4M+" },
  ];

  const features = [
    {
      title: "Neural Manifests",
      subtitle: "AI Planner",
      desc: "Stop spending weeks on spreadsheets. Our Gemini-powered engine architects hyper-personalized itineraries in seconds.",
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      )
    },
    {
      title: "The Human Layer",
      subtitle: "Verified Guides",
      desc: "AI is the map; humans are the territory. Connect with vetting local historians and master storytellers.",
      icon: (
        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )
    },
    {
      title: "Visual Intelligence",
      subtitle: "Multimodal Chat",
      desc: "Point your camera at any monument. Our Live Concierge identifies heritage markers and narrates history.",
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
    {
      title: "Discovery Engine",
      subtitle: "Grounded Maps",
      desc: "Move beyond 'Top 10' lists. Explore heatmaps of trending culture and hidden culinary gems.",
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      )
    }
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, role: role, email: email }]);
          
          if (profileError) console.error("Profile creation failed", profileError);
          alert("Registration successful! Please check your email for verification.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failure. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setError(error.message || "Google authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden selection:bg-pink-500/30 selection:text-white">
      <style>{`
        .glass-panel-heavy {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7);
        }
        .text-glow {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=2000" 
          alt="India Heritage" 
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-500 border-b ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">L</div>
            <span className="text-xl font-black text-white tracking-tight">Local<span className="textile-gradient">Lens</span></span>
          </div>
          <div className="flex items-center space-x-6">
             <button onClick={onGuestLogin} className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Guest Access</button>
             <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 md:pt-48 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-2xl">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
           <span className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">The Travel OS for India</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85] animate-in fade-in zoom-in duration-1000 text-glow">
          Fragmented <br/> 
          <span className="textile-gradient italic">Unified.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          We bridge the gap by fusing <span className="text-white font-bold">Generative AI</span> precision with a network of <span className="text-white font-bold">Verified Human Experts</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mb-24">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="group relative bg-white text-slate-950 px-10 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:scale-105 transition-all overflow-hidden"
          >
            <span className="relative z-10">Start Expedition</span>
            <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          <button 
            onClick={onGuestLogin}
            className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            Explore as Guest
          </button>
        </div>

        {/* 3D Neural Interface Visualization */}
        <div className="w-full max-w-5xl relative perspective-1000 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
           {/* Ambient Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none"></div>
           
           {/* Main Glass Console */}
           <div className="relative transform md:rotate-x-6 md:rotate-y-[-2deg] hover:rotate-y-0 transition-transform duration-700 ease-out preserve-3d">
              <div className="glass-panel-heavy rounded-[2.5rem] p-2 border border-white/20">
                 <div className="bg-slate-950/80 rounded-[2rem] overflow-hidden relative">
                    {/* Header Bar */}
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                       </div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          System Online
                       </div>
                    </div>

                    {/* Split View Content */}
                    <div className="grid grid-cols-1 md:grid-cols-12 md:h-[450px]">
                       {/* Left: Code/Data Stream */}
                       <div className="md:col-span-7 p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative overflow-hidden min-h-[320px]">
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                          
                          <div className="space-y-5 font-mono text-xs z-10 flex-grow">
                             <div className="flex gap-3 items-center">
                                <span className="text-pink-500 font-bold">$</span>
                                <span className={`text-white transition-opacity duration-300 ${terminalStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>initiate_protocol --target=Varanasi</span>
                             </div>
                             
                             <div className="space-y-3 pl-4 border-l border-white/10 h-24">
                                <div className={`flex items-center gap-2 text-emerald-500 transition-all duration-500 ${terminalStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                  <span>✓</span> Locating heritage nodes...
                                </div>
                                <div className={`flex items-center gap-2 text-emerald-500 transition-all duration-500 delay-100 ${terminalStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                  <span>✓</span> Verifying local guides...
                                </div>
                                <div className={`flex items-center gap-2 text-slate-400 transition-all duration-500 delay-200 ${terminalStep >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Analyzing 14,000+ data points...
                                </div>
                             </div>
                             
                             <div className={`mt-4 bg-slate-900/50 rounded-xl p-4 border border-white/10 relative overflow-hidden transition-all duration-700 transform ${terminalStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                                <div className="text-[9px] uppercase text-slate-500 mb-3 font-bold tracking-widest flex justify-between">
                                  <span>Live Synthesis</span>
                                  <span className="text-purple-400 animate-pulse">● Processing</span>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="relative">
                                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg z-10 relative">
                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                      </div>
                                      <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50 animate-pulse"></div>
                                   </div>
                                   <div>
                                      <div className="text-white font-bold text-sm mb-0.5">Optimizing Route</div>
                                      <div className="text-slate-400 text-[10px] font-medium">Crowd density avoided • Hidden gems added</div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* System Metrics Footer */}
                          {terminalStep >= 5 && (
                            <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col">
                                    <div className="text-[8px] uppercase text-slate-500 font-bold mb-1">Tunnel Latency</div>
                                    <div className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 14ms
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col">
                                    <div className="text-[8px] uppercase text-slate-500 font-bold mb-1">Encrypted Tokens</div>
                                    <div className="text-blue-400 font-mono text-xs font-bold flex items-center gap-2">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> 4.2k/s
                                    </div>
                                </div>
                            </div>
                          )}
                       </div>

                       {/* Right: Visual Card */}
                       <div className="md:col-span-5 relative bg-slate-900 h-[300px] md:h-auto">
                          <img src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                             <div className="glass-panel-heavy rounded-2xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                   <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-full border-2 border-pink-500" />
                                   <div>
                                      <div className="text-white font-bold text-sm">Vikram Singh</div>
                                      <div className="text-[9px] text-pink-400 font-black uppercase">Verified Expert</div>
                                   </div>
                                </div>
                                <p className="text-[10px] text-slate-300 italic leading-relaxed">
                                   "I've reserved the private terrace for the Aarti ceremony. The view is unmatched."
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Section - Floating Cards */}
      <section className="relative z-10 py-24">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel-heavy rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors group">
                 <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 group-hover:text-pink-500 transition-colors">{stat.value}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</span>
              </div>
            ))}
         </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Intelligent <br/><span className="textile-gradient">Infrastructure.</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed">
               We don't just book tickets. We architect experiences using a proprietary blend of large language models and ground-truth verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-panel-heavy p-8 rounded-[2.5rem] hover:bg-white/5 hover:border-pink-500/30 transition-all duration-500 group flex flex-col">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner border border-white/5">
                  {feature.icon}
                </div>
                <div className="mb-4">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-500 block mb-2">{feature.subtitle}</span>
                   <h4 className="text-white font-black text-2xl tracking-tight">{feature.title}</h4>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 flex-grow">{feature.desc}</p>
                <div className="w-full h-px bg-white/5 group-hover:bg-pink-500/50 transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-white/5 pt-24 pb-12 overflow-hidden">
        {/* Decorative Ambient Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none -mt-40"></div>

        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            
            {/* Brand Column - Wider */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-600 to-orange-500 rounded-xl shadow-lg">
                  <span className="text-white font-black text-xl">L</span>
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  Local<span className="textile-gradient">Lens</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-sm">
                The first Intelligent Digital Platform (IDP) for Indian tourism. We synthesize enterprise-grade AI with the lived heritage of 12,000+ verified local storytellers.
              </p>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1"></div>

            {/* Navigation Columns */}
            <div className="lg:col-span-3 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Protocol</h4>
               <ul className="space-y-4">
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">About System</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Safety Matrix</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Privacy Arch</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Contact Node</button></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Social Grid</h4>
              <div className="flex flex-col gap-4">
                <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">Twitter</span>
                </button>
                <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 6.5h.01"/><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/></svg>
                  </div>
                   <span className="text-xs font-bold uppercase tracking-wide">Instagram</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} LocalLens Intelligent Infrastructure.
            </div>
            <div className="flex gap-8">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Systems Verified: Stable</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAuthModal(false)}></div>
          
          <div className="relative glass-panel-heavy rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-10">
                <div className="inline-block p-3 bg-white/5 rounded-2xl mb-4 border border-white/10 shadow-lg">
                   <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-black">L</div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{isSignUp ? 'Initialize Identity' : 'Resume Session'}</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Secure Gateway Access</p>
              </div>

              <div className="flex bg-black/40 p-1 rounded-full mb-8 border border-white/5">
                 <button onClick={() => setRole('user')} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${role === 'user' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Traveler</button>
                 <button onClick={() => setRole('guide')} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${role === 'guide' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Expert Guide</button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-pink-500 transition-all text-sm placeholder:text-slate-600 focus:bg-black/50" placeholder="Email Coordinates" required />
                </div>
                <div className="space-y-2">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-pink-500 transition-all text-sm placeholder:text-slate-600 focus:bg-black/50" placeholder="Passkey" required />
                </div>
                {error && <div className="text-red-400 text-[10px] font-black uppercase tracking-wider bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center">{error}</div>}
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all disabled:opacity-50 mt-4 shadow-xl hover:scale-[1.02] active:scale-[0.98]">{loading ? 'Authenticating...' : (isSignUp ? 'Generate ID' : 'Connect Node')}</button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="flex items-center w-full gap-4 opacity-30"><div className="h-px bg-white/20 flex-grow"></div><span className="text-[9px] text-white font-bold uppercase">Or Authenticate With</span><div className="h-px bg-white/20 flex-grow"></div></div>
                
                <button onClick={handleGoogleLogin} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-3 transition-all hover:border-white/20">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google Workspace
                </button>

                <div className="flex justify-between w-full items-center mt-2">
                  <button onClick={() => setIsSignUp(!isSignUp)} className="text-slate-400 hover:text-pink-500 text-[10px] font-bold underline decoration-slate-700 underline-offset-4 transition-colors">{isSignUp ? 'Already have an ID? Login' : 'New User? Create ID'}</button>
                  <button onClick={onGuestLogin} className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 px-4 py-2 rounded-full transition-all">Guest Mode</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
