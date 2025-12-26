
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
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 saffron-gradient rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl">
              B
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">Bharat<span className="text-orange-500">Yatra</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-semibold text-sm lg:text-base transition-colors ${activeTab === item.id ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4">
             <button className="hidden sm:block bg-slate-900 text-white px-4 lg:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs lg:text-sm hover:bg-slate-800 transition">
              Sign In
            </button>
            {/* Mobile Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-white border-b border-gray-100 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-64 py-4' : 'max-h-0'}`}>
          <div className="px-4 space-y-4">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left font-bold text-sm py-2 ${activeTab === item.id ? 'text-orange-600' : 'text-slate-600'}`}
              >
                {item.label}
              </button>
            ))}
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm mt-2">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12 lg:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="text-2xl font-black mb-4">BharatYatra IDP</div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm sm:text-base">
              Empowering local experts and providing travelers with authentic, AI-enhanced human experiences across India.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm sm:text-base uppercase tracking-widest text-orange-500">Platform</h4>
            <ul className="space-y-3 text-slate-400 text-sm sm:text-base">
              <li><button onClick={() => setActiveTab('planner')} className="hover:text-white transition">AI Itinerary</button></li>
              <li><button onClick={() => setActiveTab('guides')} className="hover:text-white transition">Marketplace</button></li>
              <li><button onClick={() => setActiveTab('verification')} className="hover:text-white transition">Join as Guide</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm sm:text-base uppercase tracking-widest text-orange-500">Legal</h4>
            <ul className="space-y-3 text-slate-400 text-sm sm:text-base">
              <li><button className="hover:text-white transition">Privacy Policy</button></li>
              <li><button className="hover:text-white transition">Terms of Service</button></li>
              <li><button className="hover:text-white transition">Safety Guidelines</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 mt-12 sm:mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs sm:text-sm font-medium">
          © {new Date().getFullYear()} BharatYatra Intelligent Digital Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
