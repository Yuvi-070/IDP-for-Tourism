
import React, { useState } from 'react';
import { Itinerary } from '../types';

interface TripDetailsProps {
  itinerary: Itinerary;
  onBack: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ itinerary, onBack }) => {
  const [expandedTravelIdx, setExpandedTravelIdx] = useState<number | null>(null);
  const [expandedHotelIdx, setExpandedHotelIdx] = useState<number | null>(null);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-6 md:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 animate-in fade-in zoom-in duration-700">
        <style>{`
          .expand-transition {
            transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          }
        `}</style>
        
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-white/5">
          {/* Header */}
          <div className="bg-slate-900 p-8 sm:p-14 lg:p-20 text-white relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
            
            <button onClick={onBack} className="relative z-10 flex items-center space-x-3 mb-8 font-black uppercase text-[10px] tracking-[0.3em] group text-slate-500 hover:text-pink-500 transition-all">
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Back to Blueprint</span>
            </button>
            
            <div className="relative z-10">
              <span className="text-pink-500 font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs mb-3 block">Heritage Expedition Confirmed</span>
              <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-4 tracking-tighter leading-[0.85] text-white">{itinerary.destination.split(' (')[0]}</h2>
              <div className="h-2 w-32 bg-gradient-to-r from-pink-600 to-orange-500 mb-8 rounded-full"></div>
              <p className="text-slate-400 text-lg sm:text-xl lg:text-2xl font-bold italic max-w-2xl leading-relaxed">
                A tailored {itinerary.duration}-day cultural odyssey synthesized for {itinerary.travelersCount} travelers starting from {itinerary.startingLocation}.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-14 space-y-16">
            {itinerary.days.map((day) => (
              <div key={day.day}>
                <div className="flex items-center space-x-6 mb-10">
                  <span className="text-5xl sm:text-8xl font-black textile-gradient tracking-tighter">0{day.day}</span>
                  <div className="h-px flex-grow bg-white/5"></div>
                  <span className="text-xs font-black uppercase text-pink-500 tracking-widest">{day.activities.length} Waypoints</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 hover:border-pink-500/20 transition-all flex flex-col justify-between group h-full shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-white font-black text-sm">
                             <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span>{activity.time}</span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{activity.estimatedCost}</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 truncate group-hover:text-pink-500 transition-colors">{activity.location}</h4>
                        <p className="text-sm sm:text-base text-slate-400 font-bold italic line-clamp-3 leading-relaxed mb-6 group-hover:line-clamp-none transition-all">"{activity.description}"</p>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{activity.estimatedTime}</span>
                        <button onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')} className="text-[10px] font-black uppercase text-pink-500 hover:text-white transition-colors">Show Map</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logistics & Stay Summary - Redesigned Expansion UI */}
            <div className="pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500 ml-1">Logistics Architecture</h5>
                <div className="space-y-4">
                  {itinerary.travelOptions.map((opt, i) => {
                    const isExpanded = expandedTravelIdx === i;
                    return (
                      <div key={i} className={`bg-slate-900/80 p-6 rounded-[2rem] border transition-all cursor-pointer ${isExpanded ? 'border-pink-500 shadow-2xl bg-slate-800' : 'border-white/5 hover:border-pink-500/20'}`} onClick={() => setExpandedTravelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-center mb-1">
                            <h6 className="text-base font-black text-white uppercase">{opt.mode}</h6>
                            <span className="text-sm font-black text-emerald-400">{opt.estimatedCost}</span>
                         </div>
                         <p className={`text-sm text-slate-400 font-bold italic leading-tight ${isExpanded ? '' : 'truncate'}`}>{opt.description}</p>
                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
                              <div className="flex justify-between text-[10px] font-black uppercase text-pink-500 tracking-widest">
                                <span>Cycle Duration: {opt.duration}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/search?q=book+${opt.mode.toLowerCase()}+from+${itinerary.startingLocation}+to+${itinerary.destination.split(' (')[0]}`, '_blank'); }} className="w-full py-4 bg-pink-600 hover:bg-pink-500 rounded-xl text-white text-[10px] font-black uppercase shadow-lg transition-all active:scale-95">Verify & Book</button>
                           </div>
                         )}
                         {!isExpanded && <p className="text-[10px] text-slate-600 font-black italic mt-2">Expand for logistics analysis & booking...</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 ml-1">Sanctuary Stays</h5>
                <div className="space-y-4">
                  {itinerary.hotelRecommendations.map((hotel, i) => {
                    const isExpanded = expandedHotelIdx === i;
                    return (
                      <div key={i} className={`bg-slate-900/80 p-6 rounded-[2rem] border transition-all cursor-pointer ${isExpanded ? 'border-orange-500 shadow-2xl bg-slate-800' : 'border-white/5 hover:border-orange-500/20'}`} onClick={() => setExpandedHotelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-start mb-1">
                            <h6 className="text-base font-black text-white truncate w-2/3">{hotel.name}</h6>
                            <span className="text-sm font-black text-emerald-400">{hotel.estimatedPricePerNight}</span>
                         </div>
                         <p className={`text-sm text-slate-400 font-bold italic leading-tight ${isExpanded ? '' : 'truncate'}`}>{hotel.description}</p>
                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
                             <div className="flex flex-wrap gap-2">
                               {hotel.amenities.map(a => <span key={a} className="bg-white/5 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 uppercase font-black border border-white/5">{a}</span>)}
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank'); }} className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-xl text-white font-black text-[10px] uppercase transition-all shadow-lg active:scale-95">Explore Sanctuary Site</button>
                           </div>
                         )}
                         {!isExpanded && <p className="text-[10px] text-slate-600 font-black italic mt-2">Expand for amenities & location narrative...</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-20 flex flex-col items-center text-center">
              <h5 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Manifest the Odyssey</h5>
              <p className="text-slate-500 mb-10 font-bold text-lg italic max-w-2xl">Download your heritage matrix and sync with verified master storytellers on the ground.</p>
              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <button className="bg-pink-600 text-white px-12 py-5 rounded-full font-black text-sm sm:text-base shadow-[0_20px_50px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em]">Secure Master Guide</button>
                <button className="bg-white/5 text-white border border-white/10 px-12 py-5 rounded-full font-black text-sm sm:text-base hover:bg-white/10 transition-all active:scale-95 uppercase tracking-[0.3em]">Export Odyssey Blueprint</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
