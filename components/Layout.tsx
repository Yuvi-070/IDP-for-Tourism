
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 saffron-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl">
              B
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Bharat<span className="text-orange-500">Yatra</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('planner')}
              className={`font-medium transition ${activeTab === 'planner' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
            >
              AI Planner
            </button>
            <button 
              onClick={() => setActiveTab('guides')}
              className={`font-medium transition ${activeTab === 'guides' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
            >
              Local Guides
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`font-medium transition ${activeTab === 'chat' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
            >
              Live Chat
            </button>
          </nav>

          <div className="flex items-center space-x-4">
             <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold mb-4">BharatYatra IDP</div>
            <p className="text-slate-400 max-w-sm">
              Empowering local experts and providing travelers with authentic, AI-enhanced human experiences across India.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => setActiveTab('planner')}>AI Itinerary</button></li>
              <li><button onClick={() => setActiveTab('guides')}>Marketplace</button></li>
              <li><button onClick={() => setActiveTab('verification')}>Join as Guide</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Safety Guidelines</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} BharatYatra Intelligent Digital Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
