
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

  const handleFinalize = (itinerary: Itinerary) => {
    setFinalItinerary(itinerary);
    setActiveTab('details');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => setActiveTab('planner')} />
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Philosophy</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg">Connecting automated tech with authentic human stories.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="p-10 rounded-3xl bg-orange-50 border border-orange-100">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-8"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Intelligent AI</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">LLM-driven itineraries tailored to your unique interests and curiosity.</p>
                  </div>
                  <div className="p-10 rounded-3xl bg-blue-50 border border-blue-100">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Verified Experts</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">Direct connection to vetted local guides who bring deep context to your journey.</p>
                  </div>
                  <div className="p-10 rounded-3xl bg-green-50 border border-green-100">
                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white mb-8"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.582a7.417 7.417 0 01-1.002-3.328m0 0a7.417 7.417 0 001.002-3.328M9 13.5V13c0-3.314 2.686-6 6-6s6 2.686 6 6v.5M10 17l4-4-4-4m-7 12V5c0-1.105.895-2 2-2h4" /></svg></div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Live Multi-lingual</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">Real-time communication tools integrated seamlessly into your travel cycle.</p>
                  </div>
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

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
