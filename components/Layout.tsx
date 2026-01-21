import React, { useState } from 'react';
import { supabase, signInWithGoogle } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: any;
  onLoginClick: () => void;
  userRole?: 'user' | 'guide';
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, session, onLoginClick, userRole = 'user' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define base nav items
  let navItems = [
    { id: 'planner', label: 'AI Planner' },
    { id: 'guides', label: 'Local Guides' },
    { id: 'chat', label: 'Live Chat' },
  ];

  // Conditional Logic based on Role
  if (userRole === 'guide') {
    // Guides get Profile, NO History
    navItems.push({ id: 'guide-profile', label: 'My Node' });
  } else {
    // Travelers get History and User Profile
    navItems.splice(1, 0, { id: 'history', label: 'History' });
    navItems.push({ id: 'user-profile', label: 'My Profile' });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Google login failed", e);
      onLoginClick();
    }
  };

  const getUserInitial = () => {
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (session?.user?.email) {
      return session.user.email.split('@')[0];
    }
    return 'User';
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-x-hidden">
      <header className="fixed top-0 w-full z-[100] transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5 supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => setActiveTab('home')}>
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-600 to-orange-500 rounded-xl shadow-lg group-hover:shadow-pink-500/25 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-black text-xl">L</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              Local<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">Lens</span>
            </span>
          </div>
          
          {/* Desktop Navigation - Pill Style */}
          <nav className="hidden md:flex items-center bg-white/5 rounded-full px-2 py-1.5 border border-white/5 backdrop-blur-sm shadow-inner">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 lg:px-6 py-2 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-white text-slate-950 shadow-md scale-100' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3 pl-1 pr-1 py-1 sm:pl-4 sm:pr-2 sm:py-1.5 bg-transparent sm:bg-white/5 rounded-full sm:border border-white/10 transition-all hover:border-white/20">
                <div className="hidden lg:flex flex-col items-end mr-2">
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                     {userRole === 'guide' ? 'Expert Node' : 'Connected'}
                   </span>
                   <span className="text-[10px] text-white font-bold max-w-[100px] truncate leading-tight">{getUserName()}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner ring-2 ring-slate-950">
                  {getUserInitial()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-200 text-slate-950 px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Sign in</span>
              </button>
            )}
            
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 space-y-2">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                  ? 'bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            {!session && (
               <button onClick={() => { handleGoogleSignIn(); setMobileMenuOpen(false); }} className="w-full mt-6 bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                 Sign in with Google
               </button>
            )}
            {session && (
              <button onClick={handleLogout} className="w-full mt-6 bg-red-500/10 text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-colors">
                Disconnect Session
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Padded for fixed header */}
      <main className="flex-grow pt-20">
        {children}
      </main>

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
            <div className="lg:col-span-2 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Expedition Nodes</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setActiveTab('planner')} className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">AI Blueprint</button></li>
                <li><button onClick={() => setActiveTab('guides')} className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Local Vault</button></li>
                {userRole === 'user' && <li><button onClick={() => setActiveTab('history')} className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">User History</button></li>}
                {userRole === 'guide' && <li><button onClick={() => setActiveTab('guide-profile')} className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">My Node</button></li>}
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Protocol</h4>
               <ul className="space-y-4">
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">About System</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Safety Matrix</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Privacy Arch</button></li>
                <li><button className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wide">Contact Node</button></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-8">
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
    </div>
  );
};

export default Layout;