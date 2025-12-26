
import React from 'react';
import { Itinerary } from '../types';

interface TripDetailsProps {
  itinerary: Itinerary;
  onBack: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ itinerary, onBack }) => {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 md:py-32">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 animate-in fade-in zoom-in duration-1000">
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5">
          {/* Header */}
          <div className="bg-slate-900 p-8 sm:p-20 lg:p-32 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3"></div>
            
            <button onClick={onBack} className="relative z-10 flex items-center space-x-4 mb-12 sm:mb-20 font-black uppercase text-[10px] sm:text-xs tracking-[0.4em] group text-slate-500 hover:text-pink-500 transition-all">
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Recalibrate Sequence</span>
            </button>
            
            <div className="relative z-10">
              <span className="text-pink-500 font-black uppercase tracking-[0.5em] text-[10px] sm:text-sm mb-6 block">Confirmed Heritage Protocol</span>
              <h2 className="text-5xl sm:text-8xl lg:text-[10rem] font-black mb-10 tracking-tighter leading-[0.85] text-white">{itinerary.destination.split(' (')[0]}</h2>
              <div className="h-2 w-32 bg-gradient-to-r from-pink-600 to-orange-500 mb-12 rounded-full"></div>
              <p className="text-slate-400 text-lg sm:text-2xl lg:text-3xl font-bold italic max-w-4xl leading-relaxed tracking-tight">
                A bespoke {itinerary.duration}-day cultural odyssey synthesized across Bharat's most iconic heritage nodes.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-20 lg:p-32 space-y-24 sm:space-y-48">
            {itinerary.days.map((day) => (
              <div key={day.day}>
                <div className="flex items-center space-x-6 sm:space-x-16 mb-16 sm:mb-32">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Expedition Cycle</span>
                     <span className="text-6xl sm:text-8xl md:text-[10rem] font-black textile-gradient leading-none tracking-tighter">0{day.day}</span>
                  </div>
                  <div className="h-px flex-grow bg-white/5"></div>
                  <div className="text-right">
                     <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500">{day.activities.length} Waypoints</span>
                  </div>
                </div>

                <div className="space-y-16 sm:space-y-32 relative">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex flex-col lg:flex-row gap-10 sm:gap-20 group relative">
                      <div className="lg:w-40 flex-shrink-0 text-left lg:text-right pt-8">
                        <span className="text-xl sm:text-3xl font-black text-white block mb-2 tracking-tighter">{activity.time}</span>
                        <span className="text-[10px] font-black text-orange-500 block uppercase tracking-widest">{activity.estimatedTime}</span>
                      </div>
                      
                      <div className="flex-grow space-y-10">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                          <div className="space-y-2">
                             <h4 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter group-hover:text-pink-500 transition-colors duration-700 leading-tight">{activity.location}</h4>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')}
                              className="bg-white/5 hover:bg-pink-600 border border-white/10 hover:border-pink-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl flex items-center space-x-2"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span>Maps</span>
                            </button>
                            <span className="text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 px-5 py-2 rounded-xl border border-emerald-500/20 shadow-xl">{activity.estimatedCost}</span>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 leading-relaxed font-bold text-base sm:text-2xl italic tracking-tight max-w-5xl">"{activity.description}"</p>
                        
                        <div className="bg-slate-950/40 p-8 sm:p-16 rounded-[2.5rem] sm:rounded-[4rem] border border-white/5 shadow-inner relative overflow-hidden group/insight hover:border-pink-500/20 transition-all duration-500">
                          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-pink-500/5 rounded-bl-full pointer-events-none"></div>
                          <div className="flex items-center space-x-4 mb-8 text-pink-500 relative z-10">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 18.343a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Resonance Analysis</span>
                          </div>
                          <p className="text-xl sm:text-3xl lg:text-4xl text-slate-200 italic font-black leading-relaxed tracking-tighter relative z-10">"{activity.culturalInsight}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logistics & Stay Section - Final Journey View */}
            <div className="pt-24 sm:pt-48 border-t border-white/5 space-y-16">
              <div className="flex items-center space-x-6">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">Logistics <span className="textile-gradient">& Stay</span></span>
                <div className="h-px flex-grow bg-white/5"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
                {/* Travel Route */}
                <div className="space-y-8">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 ml-2">Expedition Route from {itinerary.startingLocation}</label>
                  <div className="space-y-6">
                    {itinerary.travelOptions.map((opt, i) => (
                      <div key={i} className="bg-slate-900/60 p-8 sm:p-12 rounded-[2.5rem] border border-white/5 group hover:border-pink-500/30 transition-all shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-xs font-black uppercase tracking-widest text-white px-5 py-2.5 bg-pink-600 rounded-xl">{opt.mode}</span>
                          <span className="text-emerald-400 font-black text-2xl">{opt.estimatedCost}</span>
                        </div>
                        <p className="text-slate-400 font-bold italic text-base leading-relaxed mb-6">"{opt.description}"</p>
                        <div className="flex items-center space-x-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>{opt.duration} Total Duration</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Picks */}
                <div className="space-y-8">
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 ml-2">Sanctuary Recommendations</label>
                  <div className="space-y-6">
                    {itinerary.hotelRecommendations.map((hotel, i) => (
                      <div key={i} className="bg-slate-900/60 p-8 sm:p-12 rounded-[2.5rem] border border-white/5 group hover:border-orange-500/30 transition-all shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                          <h5 className="font-black text-2xl text-white tracking-tight pr-4">{hotel.name}</h5>
                          <div className="flex flex-col items-end space-y-3">
                            <span className="text-emerald-400 font-black text-lg">{hotel.estimatedPricePerNight}<span className="text-slate-600 text-[10px] uppercase ml-1">/nt</span></span>
                            <button 
                              onClick={() => window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank')}
                              className="bg-white/5 hover:bg-pink-600 border border-white/10 hover:border-pink-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center space-x-2 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span>Maps</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-400 font-bold italic text-base leading-relaxed mb-8">"{hotel.description}"</p>
                        <div className="flex flex-wrap gap-3">
                          {hotel.amenities.map(amn => (
                            <span key={amn} className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5">{amn}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-24 sm:pt-48 border-t border-white/5 flex flex-col items-center text-center">
               <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-600 to-orange-500 rounded-3xl sm:rounded-[3rem] flex items-center justify-center text-white mb-10 sm:mb-16 shadow-[0_30px_60px_rgba(236,72,153,0.3)]">
                 <svg className="w-10 h-10 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 20.944a11.955 11.955 0 01-8.618-3.04" /></svg>
               </div>
              <h5 className="text-4xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-none">Manifest The <span className="textile-gradient">Odyssey</span></h5>
              <p className="text-slate-500 mb-16 font-bold max-w-3xl text-lg sm:text-2xl leading-relaxed italic">
                The blueprint is complete. Secure the master storytelling link to activate this expedition on the ground.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto">
                <button className="bg-pink-600 text-white px-12 sm:px-20 py-6 rounded-full font-black text-sm sm:text-xl shadow-[0_20px_50px_rgba(236,72,153,0.4)] hover:scale-105 transition-all active:scale-95 uppercase tracking-[0.3em]">Secure Guide Link</button>
                <button className="bg-white/5 text-white border border-white/10 px-12 sm:px-20 py-6 rounded-full font-black text-sm sm:text-xl hover:bg-white/10 transition-all active:scale-95 uppercase tracking-[0.3em]">Export Matrix (PDF)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
