
import React, { useState } from 'react';
import { supabase, signInWithGoogle } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: any;
  onLoginClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, session, onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'planner', label: 'AI Planner' },
    { id: 'history', label: 'History' },
    { id: 'guides', label: 'Local Guides' },
    { id: 'chat', label: 'Live Chat' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No reload needed, App.tsx handles state change via onAuthStateChange
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Google login failed", e);
      // Fallback to modal if direct fail
      onLoginClick();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-x-hidden">
      <header className="bg-slate-950/70 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[100] transition-all">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 h-20 sm:h-28 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 rani-pink-bg rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-[0_10px_30px_rgba(236,72,153,0.4)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              L
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-[-0.05em] text-white">Local<span className="textile-gradient">Lens</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12 lg:space-x-16">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative py-4 ${activeTab === item.id ? 'text-pink-500' : 'text-slate-500 hover:text-white'}`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.8)]"></span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-6">
            {session ? (
              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-[10px] text-slate-400 font-bold hidden lg:inline-block uppercase tracking-wider">
                  Logged in as: {session.user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden sm:flex items-center gap-3 bg-white text-slate-950 border border-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
            )}
            
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-3 bg-white/5 rounded-2xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-slate-900/98 backdrop-blur-3xl border-b border-white/10 transition-all duration-700 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-[600px] py-12 px-10' : 'max-h-0'}`}>
          <div className="space-y-10">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left font-black text-2xl uppercase tracking-tighter ${activeTab === item.id ? 'text-pink-500' : 'text-slate-400'}`}
              >
                {item.label}
              </button>
            ))}
            {session ? (
              <>
                 <div className="text-slate-500 text-sm font-bold truncate">Logged in as: {session.user.email}</div>
                 <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest">
                  Disconnect Session
                </button>
              </>
            ) : (
              <button onClick={() => { handleGoogleSignIn(); setMobileMenuOpen(false); }} className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2">
                 Sign in with Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-white/5 text-white py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-500/5 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="md:col-span-2">
            <div className="text-4xl font-black mb-10 tracking-tighter">Local<span className="textile-gradient">Lens</span> <span className="text-slate-800">IDP</span></div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-xl font-medium italic">
              Bespoke cultural expeditions at the intersection of enterprise-grade AI and authentic human history.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-10 text-[11px] uppercase tracking-[0.5em] text-pink-500">Expedition Nodes</h4>
            <ul className="space-y-6 text-slate-400 text-xs font-black uppercase tracking-[0.25em]">
              <li><button onClick={() => setActiveTab('planner')} className="hover:text-white transition-colors">AI Blueprint</button></li>
              <li><button onClick={() => setActiveTab('guides')} className="hover:text-white transition-colors">Local Vault</button></li>
              <li><button onClick={() => setActiveTab('verification')} className="hover:text-white transition-colors">Apply: Master</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-10 text-[11px] uppercase tracking-[0.5em] text-orange-500">Legal Protocol</h4>
            <ul className="space-y-6 text-slate-400 text-xs font-black uppercase tracking-[0.25em]">
              <li><button className="hover:text-white transition-colors">Privacy Arch</button></li>
              <li><button className="hover:text-white transition-colors">Ethics Matrix</button></li>
              <li><button className="hover:text-white transition-colors">Safety Standard</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-6 mt-32 pt-16 border-t border-white/5 text-center text-slate-700 text-[11px] font-black uppercase tracking-[0.6em]">
          © {new Date().getFullYear()} LocalLens Intelligent Infrastructure. Systems Verified.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
