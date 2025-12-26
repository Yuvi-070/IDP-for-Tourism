
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
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 saffron-gradient rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
              L
            </div>
            <span className="text-xl sm:text-3xl font-black tracking-tighter text-white">Local<span className="text-pink-500">Lens</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === item.id ? 'text-pink-500' : 'text-slate-400 hover:text-white'}`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 rani-pink-bg rounded-full shadow-[0_0_10px_#ec4899]"></span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
             <button className="hidden sm:block bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-pink-600 hover:border-pink-500 transition-all">
              Portal
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-white/5 transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-96 py-8' : 'max-h-0'}`}>
          <div className="px-6 space-y-6">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left font-black text-xs uppercase tracking-widest py-3 ${activeTab === item.id ? 'text-pink-500' : 'text-slate-400'}`}
              >
                {item.label}
              </button>
            ))}
            <button className="w-full bg-pink-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
              Portal Access
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-white/5 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="md:col-span-2">
            <div className="text-3xl font-black mb-6 tracking-tighter">Local<span className="text-pink-500">Lens</span> <span className="text-slate-700">IDP</span></div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-base font-medium italic">
              Bespoke cultural expeditions at the intersection of deep-grounded AI and authentic local storytellers.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.4em] text-pink-500">Expedition Nodes</h4>
            <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => setActiveTab('planner')} className="hover:text-white transition">AI Blueprint</button></li>
              <li><button onClick={() => setActiveTab('guides')} className="hover:text-white transition">Local Vault</button></li>
              <li><button onClick={() => setActiveTab('verification')} className="hover:text-white transition">Apply: Master</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.4em] text-orange-500">Legal Protocol</h4>
            <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-widest">
              <li><button className="hover:text-white transition">Privacy Architecture</button></li>
              <li><button className="hover:text-white transition">Ethics Matrix</button></li>
              <li><button className="hover:text-white transition">Safety Standards</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 mt-20 pt-12 border-t border-white/5 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} LocalLens Intelligent Infrastructure.
        </div>
      </footer>
    </div>
  );
};

export default Layout;