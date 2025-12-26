
import React from 'react';
import { Itinerary } from '../types';

interface TripDetailsProps {
  itinerary: Itinerary;
  onBack: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ itinerary, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 animate-in fade-in duration-1000">
      <div className="bg-white rounded-[6rem] shadow-[0_96px_192px_-48px_rgba(0,0,0,0.18)] overflow-hidden border border-slate-50">
        <div className="bg-slate-900 p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] saffron-gradient opacity-10 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3"></div>
          
          <button onClick={onBack} className="absolute top-16 left-16 text-slate-400 hover:text-white transition-all duration-700 flex items-center space-x-4 font-black uppercase text-[11px] tracking-[0.5em] group">
            <svg className="w-6 h-6 transition-transform group-hover:-translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Revise Expedition</span>
          </button>
          
          <div className="text-center relative z-10">
            <span className="text-orange-400 font-black uppercase tracking-[0.8em] text-[11px] mb-10 block opacity-90">Confirmed Heritage Protocol</span>
            <h2 className="text-8xl font-black mb-8 tracking-tighter leading-none">{itinerary.destination}</h2>
            <div className="h-1.5 w-32 saffron-gradient mx-auto mb-10 rounded-full"></div>
            <p className="text-slate-400 text-3xl font-medium max-w-3xl mx-auto leading-relaxed tracking-tight">
              A bespoke {itinerary.duration}-day cultural odyssey through the heart of {itinerary.destination.split(' ')[0]}.
            </p>
          </div>
        </div>

        <div className="p-24 space-y-40">
          {itinerary.days.map((day) => (
            <div key={day.day}>
              <div className="flex items-center space-x-12 mb-20">
                <div className="flex flex-col">
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Phase</span>
                   <span className="text-9xl font-black text-slate-900 leading-none">0{day.day}</span>
                </div>
                <div className="h-px flex-grow bg-slate-100"></div>
                <div className="text-right">
                   <span className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">{day.activities.length} Destinations Curated</span>
                </div>
              </div>

              <div className="space-y-24 relative">
                <div className="absolute left-[45px] md:left-[170px] top-0 bottom-0 w-px bg-slate-100 -z-10"></div>
                {day.activities.map((activity, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-16 group">
                    <div className="md:w-40 flex-shrink-0 text-left md:text-right pt-2">
                      <span className="text-lg font-black text-slate-900 block mb-2 tracking-tighter">{activity.time}</span>
                      <span className="text-[11px] font-black text-orange-500 block uppercase tracking-[0.2em] opacity-80">{activity.estimatedTime}</span>
                    </div>
                    
                    <div className="flex-grow space-y-8">
                      <div className="flex items-center justify-between flex-wrap gap-6">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-orange-600 transition-colors duration-700 leading-none">{activity.location}</h4>
                        <div className="flex items-center space-x-4">
                           <span className="text-green-600 text-[11px] font-black uppercase tracking-widest bg-green-50 px-6 py-2.5 rounded-full border border-green-100 shadow-sm">{activity.estimatedCost} Suggested</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-500 leading-relaxed font-semibold text-xl tracking-tight max-w-4xl">{activity.description}</p>
                      
                      <div className="bg-slate-50/50 p-12 rounded-[4rem] border border-slate-100 shadow-inner relative group-hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] transition-all duration-1000 overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 saffron-gradient opacity-[0.04] rounded-bl-full"></div>
                        <div className="flex items-center space-x-4 mb-8 text-orange-500 relative z-10">
                          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 18.343a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
                          <span className="text-[12px] font-black uppercase tracking-[0.4em]">Anthropological Insight</span>
                        </div>
                        <p className="text-slate-800 italic font-black leading-relaxed text-2xl tracking-tighter relative z-10">"{activity.culturalInsight}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-32 border-t border-slate-100 flex flex-col items-center">
             <div className="w-24 h-24 saffron-gradient rounded-[2.5rem] flex items-center justify-center text-slate-900 mb-12 shadow-[0_48px_96px_-24px_rgba(255,153,51,0.5)] transition-transform duration-700 hover:rotate-12">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 20.944a11.955 11.955 0 01-8.618-3.04m12.922-1.76a2.923 2.923 0 000-5.364l-1.286-.538A2.923 2.923 0 0012 11.724a2.923 2.923 0 00-1.018-.466l-1.286-.538a2.923 2.923 0 000 5.364l1.286.538A2.923 2.923 0 0012 16.276a2.923 2.923 0 001.018.466l1.286.538z" /></svg>
             </div>
            <h5 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Manifest Your Odyssey</h5>
            <p className="text-slate-500 mb-16 font-semibold text-center max-w-3xl text-xl leading-relaxed tracking-tight">
              The blueprint is complete. The final bridge is human: connect with a verified local storyteller to navigate the last-mile and breathe life into these heritage sites.
            </p>
            <div className="flex flex-col sm:flex-row gap-10 w-full sm:w-auto">
              <button className="bg-orange-500 text-white px-20 py-8 rounded-[3rem] font-black text-xl shadow-[0_32px_64px_-16px_rgba(255,153,51,0.5)] hover:bg-orange-600 transition-all duration-700 hover:-translate-y-3 active:scale-95 uppercase tracking-[0.3em]">Connect with Local Expert</button>
              <button className="bg-slate-900 text-white px-20 py-8 rounded-[3rem] font-black text-xl hover:bg-slate-800 transition-all duration-700 active:scale-95 uppercase tracking-[0.3em] shadow-2xl">Export Protocol (PDF)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
