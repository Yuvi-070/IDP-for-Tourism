
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'planner', label: 'AI Planner' },
    { id: 'guides', label: 'Local Guides' },
    { id: 'chat', label: 'Live Chat' },
  ];

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
             <button className="hidden sm:block bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-950 hover:scale-105 transition-all shadow-xl">
              Portal Login
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-3 bg-white/5 rounded-2xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-slate-900/98 backdrop-blur-3xl border-b border-white/10 transition-all duration-700 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] py-12 px-10' : 'max-h-0'}`}>
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
            <button className="w-full bg-gradient-to-r from-pink-600 to-orange-500 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl">
              Portal Access
            </button>
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
