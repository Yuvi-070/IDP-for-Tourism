
import React, { useState } from 'react';
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

  const handleMapSelect = (dest: string) => {
    setPreselectedDest(dest);
    setActiveTab('planner');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="bg-slate-950">
            <Hero onGetStarted={() => setActiveTab('planner')} />
            
            {/* Quick Start Hotspots Section */}
            <section className="py-24 sm:py-48 bg-slate-950 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-16 md:mb-24 gap-8">
                  <div className="max-w-3xl">
                    <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6">Quick Start <span className="textile-gradient">Nodes</span></h2>
                    <p className="text-slate-500 font-bold text-lg sm:text-2xl italic leading-relaxed">Instant synthesis for Bharat's most iconic cultural coordinates.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                  {[
                    { name: "Jaipur (Pink City)", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=600" },
                    { name: "Varanasi (Spiritual Capital)", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=600" },
                    { name: "Ladakh (Moonland)", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=600" },
                    { name: "Kochi (Queen of Arabian Sea)", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=600" }
                  ].map((city) => (
                    <button 
                      key={city.name}
                      onClick={() => handleMapSelect(city.name)}
                      className="group relative aspect-[4/5] sm:aspect-auto sm:h-80 md:h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-1000 border border-white/5 hover:border-pink-500/50 hover:-translate-y-6"
                    >
                      <img src={city.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100" alt={city.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-10 left-10 right-10 text-left">
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] block mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Deploy Logic</span>
                        <h4 className="text-white font-black text-2xl sm:text-4xl tracking-tighter leading-tight group-hover:text-pink-500 transition-colors">{city.name.split(' (')[0]}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-24 sm:py-48 bg-slate-900/20 relative">
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24 sm:mb-40">
                   <div className="inline-flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full mb-8 border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">The Architecture of Bharat</span>
                   </div>
                  <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-10 tracking-tighter leading-none">Core <span className="textile-gradient">Philosophy</span></h2>
                  <p className="text-slate-500 max-w-3xl mx-auto text-lg sm:text-2xl font-bold italic leading-relaxed">
                    Connecting high-throughput neural intelligence with the irreplaceable soul of human narrative.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                  {[
                    { title: "Grounded AI", desc: "Synthesizing multi-modal heritage data into bespoke itineraries through the Gemini architecture.", color: "bg-pink-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
                    { title: "Verified Masters", desc: "Access the inner-circle of Bharat's verified local experts and lineage-based storytellers.", color: "bg-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
                    { title: "Real-time Bridge", desc: "Seamless cross-linguistic communication tools designed for the chaos of the last-mile.", color: "bg-orange-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5h12M9 3v2m1.048 9.582a7.417 7.417 0 01-1.002-3.328m0 0a7.417 7.417 0 001.002-3.328M9 13.5V13c0-3.314 2.686-6 6-6s6 2.686 6 6v.5M10 17l4-4-4-4m-7 12V5c0-1.105.895-2 2-2h4" /> }
                  ].map((item, idx) => (
                    <div key={idx} className="p-10 sm:p-16 rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl hover:border-pink-500/30 transition-all duration-700 hover:-translate-y-4 group">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 ${item.color} rounded-2xl flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 transition-transform`}>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black mb-6 text-white tracking-tighter">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-base sm:text-xl font-bold italic">{item.desc}</p>
                    </div>
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
        return finalItinerary ? <TripDetails itinerary={finalItinerary} onBack={() => setActiveTab('planner')} /> : <Planner onFinalize={handleFinalize} />;
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

  const handleFinalize = (itinerary: Itinerary) => {
    setFinalItinerary(itinerary);
    setActiveTab('details');
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
