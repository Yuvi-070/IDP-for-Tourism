
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
          <>
            <Hero onGetStarted={() => setActiveTab('planner')} />
            
            {/* Quick Start Hotspots Section */}
            <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Quick Start <span className="text-orange-500">Expeditions</span></h2>
                    <p className="text-slate-500 font-medium text-sm sm:text-base md:text-lg">Instant AI curation for our most sought-after cultural hubs.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {[
                    { name: "Jaipur (Pink City)", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=600" },
                    { name: "Varanasi (Spiritual Capital)", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=600" },
                    { name: "Ladakh (Moonland)", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=600" },
                    { name: "Kochi (Queen of Arabian Sea)", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=600" }
                  ].map((city) => (
                    <button 
                      key={city.name}
                      onClick={() => handleMapSelect(city.name)}
                      className="group relative aspect-[4/5] sm:aspect-auto sm:h-64 md:h-80 lg:h-96 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      <img src={city.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={city.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-left">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Explore</span>
                        <h4 className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight">{city.name.split(' (')[0]}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-12 sm:py-24 bg-slate-50">
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-20">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Our Core Philosophy</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">Connecting automated tech with authentic human stories.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
                  {[
                    { title: "Intelligent AI", desc: "LLM-driven itineraries tailored to your unique interests and curiosity.", color: "bg-orange-500", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
                    { title: "Verified Experts", desc: "Direct connection to vetted local guides who bring deep context to your journey.", color: "bg-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
                    { title: "Live Multi-lingual", desc: "Real-time communication tools integrated seamlessly into your travel cycle.", color: "bg-green-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.582a7.417 7.417 0 01-1.002-3.328m0 0a7.417 7.417 0 001.002-3.328M9 13.5V13c0-3.314 2.686-6 6-6s6 2.686 6 6v.5M10 17l4-4-4-4m-7 12V5c0-1.105.895-2 2-2h4" /> }
                  ].map((item, idx) => (
                    <div key={idx} className="p-6 sm:p-10 rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8`}>
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <IndiaMap onSelectDestination={handleMapSelect} />
          </>
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
