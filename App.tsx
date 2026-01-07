
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Planner from './components/Planner';
import GuideMarketplace from './components/GuideMarketplace';
import ChatInterface from './components/ChatInterface';
import VerificationForm from './components/VerificationForm';
import IndiaMap from './components/IndiaMap';
import TripDetails from './components/TripDetails';
import { Itinerary } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [preselectedDest, setPreselectedDest] = useState<string | null>(null);
  const [finalItinerary, setFinalItinerary] = useState<Itinerary | null>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeySelected(selected);
      } else {
        // Fallback for standard environments
        setIsApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setIsApiKeySelected(true);
    }
  };

  const handleMapSelect = (dest: string) => {
    setPreselectedDest(dest);
    setActiveTab('planner');
  };

  const handleFinalize = (itinerary: Itinerary) => {
    setFinalItinerary(itinerary);
    setActiveTab('details');
  };

  if (isApiKeySelected === null) return null; // Wait for initial check

  if (!isApiKeySelected) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rani-pink-bg rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-3xl mb-12 animate-bounce">L</div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Initialize <span className="textile-gradient">Neural Bridge</span></h1>
        <p className="text-slate-400 text-lg md:text-xl font-bold italic mb-12 max-w-lg leading-relaxed">
          LocalLens requires a secure link to your Google AI Studio project to architect heritage odysseys.
        </p>
        <button 
          onClick={handleOpenKeySelection}
          className="bg-white text-slate-950 px-12 py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Connect Project
        </button>
        <p className="mt-8 text-slate-600 text-xs font-black uppercase tracking-widest">
          Project requires billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-pink-500 underline decoration-pink-500/30">View Documentation</a>
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="bg-slate-950">
            <Hero onGetStarted={() => setActiveTab('planner')} />
            
            <section className="py-24 sm:py-32 bg-slate-950 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 md:mb-20 gap-8">
                  <div className="max-w-3xl">
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-6">Quick Start <span className="textile-gradient">Nodes</span></h2>
                    <p className="text-slate-500 font-bold text-lg sm:text-2xl italic leading-relaxed">Instant synthesis for Bharat's most iconic cultural coordinates.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                  {[
                    { name: "Jaipur (Pink City)", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800" },
                    { name: "Varanasi (Spiritual Capital)", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800" },
                    { name: "Ladakh (Moonland)", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=800" },
                    { name: "Kochi (Queen of Arabian Sea)", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800" },
                    { name: "Hampi (Ancient Ruins)", img: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&q=80&w=800" },
                    { name: "Munnar (Tea Estates)", img: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=800" },
                    { name: "Udaipur (City of Lakes)", img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800" },
                    { name: "Amritsar (Golden Temple)", img: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800" }
                  ].map((city) => (
                    <button 
                      key={city.name}
                      onClick={() => handleMapSelect(city.name)}
                      className="group relative h-64 sm:h-80 md:h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 border border-white/5 hover:border-pink-500/50 hover:-translate-y-4"
                    >
                      <img 
                        src={city.img} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-100" 
                        alt={city.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-left">
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.4em] block mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Deploy Logic</span>
                        <h4 className="text-white font-black text-xl sm:text-2xl tracking-tighter leading-tight group-hover:text-pink-500 transition-colors">{city.name.split(' (')[0]}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <IndiaMap onSelectDestination={handleMapSelect} />
          </div>
        );
      case 'planner':
        return <Planner initialDestination={preselectedDest} onFinalize={handleFinalize} />;
      case 'details':
        return finalItinerary ? (
          <TripDetails 
            itinerary={finalItinerary} 
            onBack={() => setActiveTab('planner')} 
            onBookGuide={() => setActiveTab('guides')} 
          />
        ) : (
          <Planner onFinalize={handleFinalize} />
        );
      case 'guides':
        return <GuideMarketplace />;
      case 'chat':
        return <ChatInterface />;
      case 'verification':
        return <VerificationForm />;
      default:
        return <Hero onGetStarted={() => setActiveTab('planner')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
