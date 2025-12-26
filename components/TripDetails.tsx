
import React from 'react';
import { Itinerary } from '../types';

interface TripDetailsProps {
  itinerary: Itinerary;
  onBack: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ itinerary, onBack }) => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 md:py-20 lg:py-24 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2rem] sm:rounded-[4rem] lg:rounded-[6rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="bg-slate-900 p-8 sm:p-16 lg:p-24 text-white relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-[500px] sm:h-[500px] saffron-gradient opacity-10 rounded-full blur-[100px] sm:blur-[150px] translate-x-1/3 -translate-y-1/3"></div>
          
          <button onClick={onBack} className="relative z-10 sm:absolute sm:top-12 sm:left-12 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center sm:justify-start space-x-3 mb-8 sm:mb-0 font-black uppercase text-[10px] sm:text-xs tracking-widest group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Revise Expedition</span>
          </button>
          
          <div className="sm:text-left relative z-10">
            <span className="text-orange-400 font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] text-[10px] sm:text-xs mb-4 sm:mb-8 block opacity-90">Confirmed Heritage Protocol</span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">{itinerary.destination}</h2>
            <div className="h-1 w-16 sm:w-24 saffron-gradient mb-6 sm:mb-10 rounded-full mx-auto sm:mx-0"></div>
            <p className="text-slate-400 text-base sm:text-xl lg:text-2xl font-medium max-w-3xl leading-relaxed tracking-tight">
              A bespoke {itinerary.duration}-day cultural odyssey through the heart of {itinerary.destination.split(' ')[0]}.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-12 lg:p-24 space-y-16 sm:space-y-32">
          {itinerary.days.map((day) => (
            <div key={day.day}>
              <div className="flex items-center space-x-4 sm:space-x-12 mb-8 sm:mb-16">
                <div className="flex flex-col">
                   <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">Phase</span>
                   <span className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-none">0{day.day}</span>
                </div>
                <div className="h-px flex-grow bg-slate-100"></div>
                <div className="text-right">
                   <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-orange-500">{day.activities.length} Stops</span>
                </div>
              </div>

              <div className="space-y-12 sm:space-y-24 relative">
                {/* Timeline Line - Hidden on small screens */}
                <div className="hidden lg:block absolute left-[120px] top-0 bottom-0 w-px bg-slate-100 -z-10"></div>
                
                {day.activities.map((activity, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row gap-6 sm:gap-12 group">
                    <div className="lg:w-32 flex-shrink-0 text-left lg:text-right pt-2 border-l-4 lg:border-l-0 border-orange-500/20 pl-4 lg:pl-0">
                      <span className="text-sm sm:text-lg font-black text-slate-900 block mb-0.5 tracking-tighter">{activity.time}</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-orange-500 block uppercase tracking-widest opacity-80">{activity.estimatedTime}</span>
                    </div>
                    
                    <div className="flex-grow space-y-4 sm:space-y-8">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <h4 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter group-hover:text-orange-600 transition-colors duration-500 leading-tight">{activity.location}</h4>
                        <div className="flex items-center space-x-2">
                           <span className="text-green-600 text-[9px] sm:text-[10px] font-black uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">{activity.estimatedCost}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-500 leading-relaxed font-semibold text-sm sm:text-lg lg:text-xl tracking-tight max-w-4xl">{activity.description}</p>
                      
                      <div className="bg-slate-50/50 p-5 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 saffron-gradient opacity-[0.04] rounded-bl-full"></div>
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6 text-orange-500 relative z-10">
                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 18.343a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
                          <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest">Culture insight</span>
                        </div>
                        <p className="text-base sm:text-xl lg:text-2xl text-slate-800 italic font-black leading-relaxed tracking-tighter relative z-10">"{activity.culturalInsight}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-12 sm:pt-24 border-t border-slate-100 flex flex-col items-center text-center">
             <div className="w-12 h-12 sm:w-20 sm:h-20 saffron-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-900 mb-6 sm:mb-10 shadow-lg">
               <svg className="w-6 h-6 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 20.944a11.955 11.955 0 01-8.618-3.04" /></svg>
             </div>
            <h5 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter">Manifest Your Odyssey</h5>
            <p className="text-slate-500 mb-8 sm:mb-12 font-semibold max-w-2xl text-sm sm:text-lg lg:text-xl leading-relaxed">
              The blueprint is complete. The final bridge is human: connect with a verified local storyteller to breathe life into these heritage sites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <button className="bg-orange-500 text-white px-8 sm:px-12 py-3.5 sm:py-6 rounded-full font-black text-sm sm:text-lg shadow-xl hover:bg-orange-600 transition-all active:scale-95 uppercase tracking-widest">Connect with Guide</button>
              <button className="bg-slate-900 text-white px-8 sm:px-12 py-3.5 sm:py-6 rounded-full font-black text-sm sm:text-lg hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest">Export (PDF)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
