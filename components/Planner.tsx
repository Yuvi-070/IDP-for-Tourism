
import React, { useState, useEffect, useMemo } from 'react';
import { INDIAN_DESTINATIONS, THEMES } from '../constants';
import { generateTravelItinerary, generateItineraryFromPrompt, getMoreSuggestions } from '../services/geminiService';
import { Itinerary, Activity } from '../types';

interface PlannerProps {
  initialDestination?: string | null;
  onFinalize: (itinerary: Itinerary) => void;
}

const Planner: React.FC<PlannerProps> = ({ initialDestination, onFinalize }) => {
  const [mode, setMode] = useState<'form' | 'prompt'>('form');
  const [destination, setDestination] = useState(INDIAN_DESTINATIONS[0]);
  const [manualDestination, setManualDestination] = useState('');
  
  // New Inputs
  const [startingLocation, setStartingLocation] = useState('');
  const [showStartingSuggestions, setShowStartingSuggestions] = useState(false);
  const [hotelStars, setHotelStars] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);

  const [duration, setDuration] = useState(3);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([THEMES[0]]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [extraSuggestions, setExtraSuggestions] = useState<Activity[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [expandedExtraIdx, setExpandedExtraIdx] = useState<number | null>(null);

  useEffect(() => {
    if (initialDestination) {
      if (INDIAN_DESTINATIONS.includes(initialDestination)) {
        setDestination(initialDestination);
      } else {
        setDestination("Other (Manual Entry)");
        setManualDestination(initialDestination);
      }
    }
  }, [initialDestination]);

  const filteredStartingLocations = useMemo(() => {
    if (!startingLocation) return [];
    return INDIAN_DESTINATIONS.filter(loc => 
      loc.toLowerCase().includes(startingLocation.toLowerCase()) && loc !== "Other (Manual Entry)"
    ).slice(0, 5);
  }, [startingLocation]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.length > 1 ? prev.filter(t => t !== theme) : prev
        : [...prev, theme]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setExtraSuggestions([]);
    try {
      let data: Itinerary;
      const targetDest = destination === "Other (Manual Entry)" ? manualDestination : destination;
      
      if (!targetDest || !startingLocation) {
        alert("Please provide both starting location and destination.");
        setLoading(false);
        return;
      }

      if (mode === 'form') {
        data = await generateTravelItinerary(targetDest, duration, selectedThemes, startingLocation, hotelStars, travelersCount);
      } else {
        if (!prompt.trim()) {
          alert("Please describe your trip!");
          setLoading(false);
          return;
        }
        data = await generateItineraryFromPrompt(prompt);
      }
      setItinerary(data);
      fetchExtras(data.destination);
    } catch (error) {
      console.error(error);
      alert("Synthesis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExtras = async (dest: string) => {
    setLoadingExtras(true);
    try {
      const extras = await getMoreSuggestions(dest);
      setExtraSuggestions(extras);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingExtras(false);
    }
  };

  const uniqueExtras = useMemo(() => {
    if (!itinerary) return extraSuggestions;
    const currentLocations = new Set(
      itinerary.days.flatMap(day => day.activities.map(act => act.location.toLowerCase()))
    );
    return extraSuggestions.filter(extra => !currentLocations.has(extra.location.toLowerCase()));
  }, [itinerary, extraSuggestions]);

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  const handleAddFromExtras = (extra: Activity, targetDayIdx: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    const newActivity = { ...extra, time: extra.time || "10:00" };
    newItinerary.days[targetDayIdx].activities.push(newActivity);
    setItinerary(newItinerary);
    setExpandedExtraIdx(null);
  };

  const handleMoveToDay = (currentDayIdx: number, actIdx: number, targetDayIdx: number) => {
    if (!itinerary || targetDayIdx === currentDayIdx) return;
    const newItinerary = { ...itinerary };
    const [activity] = newItinerary.days[currentDayIdx].activities.splice(actIdx, 1);
    newItinerary.days[targetDayIdx].activities.push(activity);
    setItinerary(newItinerary);
  };

  const handleReorderActivity = (dayIdx: number, actIdx: number, direction: 'up' | 'down') => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    const activities = [...newItinerary.days[dayIdx].activities];
    if (direction === 'up' && actIdx > 0) {
      [activities[actIdx], activities[actIdx - 1]] = [activities[actIdx - 1], activities[actIdx]];
    } else if (direction === 'down' && actIdx < activities.length - 1) {
      [activities[actIdx], activities[actIdx + 1]] = [activities[actIdx + 1], activities[actIdx]];
    }
    newItinerary.days[dayIdx].activities = activities;
    setItinerary(newItinerary);
  };

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities[activityIndex] = {
      ...newItinerary.days[dayIndex].activities[activityIndex],
      [field]: value
    };
    setItinerary(newItinerary);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-pink-500 selection:text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          textarea { overflow: hidden !important; resize: none !important; }
          .extra-expand-transition {
            transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
          }
          .flow-line::before {
            content: '';
            position: absolute;
            left: 1.5rem;
            top: 2rem;
            bottom: 0;
            width: 3px;
            background: linear-gradient(to bottom, #ec4899 0%, #f59e0b 100%);
            box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
            z-index: 0;
            transform: translateX(-50%);
          }
          @media (min-width: 640px) {
            .flow-line::before { left: 2.5rem; }
          }
          .textile-gradient {
            background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(315deg) brightness(118%) contrast(119%);
            cursor: pointer;
            scale: 1.3;
          }
        `}</style>
        
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-8 sm:p-14 md:p-20 lg:p-24 mb-16 md:mb-28 border border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between mb-12 md:mb-20 gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-3 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
                 <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Architecting Authenticity</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
                AI Journey <span className="textile-gradient">Architect</span>
              </h2>
              <p className="text-slate-400 font-bold text-base sm:text-xl md:text-2xl leading-relaxed max-w-2xl italic">
                Bespoke expeditions synthesized across Bharat's most iconic heritage coordinates.
              </p>
            </div>
            <div className="flex p-1.5 bg-white/5 rounded-[2rem] self-start shadow-inner border border-white/10">
              <button onClick={() => setMode('form')} className={`px-6 sm:px-12 py-3.5 sm:py-5 rounded-[1.5rem] text-xs sm:text-sm font-black transition-all duration-500 ${mode === 'form' ? 'bg-pink-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>Visual Blueprint</button>
              <button onClick={() => setMode('prompt')} className={`px-6 sm:px-12 py-3.5 sm:py-5 rounded-[1.5rem] text-xs sm:text-sm font-black transition-all duration-500 ${mode === 'prompt' ? 'bg-pink-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>Intuitive Prompt</button>
            </div>
          </div>

          {mode === 'form' ? (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14">
              {/* Starting Location with Autocomplete */}
              <div className="space-y-4 relative">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Starting Coordinate</label>
                <input 
                  type="text" 
                  value={startingLocation}
                  onChange={(e) => { setStartingLocation(e.target.value); setShowStartingSuggestions(true); }}
                  onFocus={() => setShowStartingSuggestions(true)}
                  placeholder="Enter your origin (e.g. Mumbai)..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl shadow-xl"
                />
                {showStartingSuggestions && filteredStartingLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden z-50 shadow-2xl">
                    {filteredStartingLocations.map(loc => (
                      <button 
                        key={loc} 
                        onClick={() => { setStartingLocation(loc); setShowStartingSuggestions(false); }}
                        className="w-full text-left px-8 py-5 text-sm font-black uppercase hover:bg-pink-600/10 text-slate-400 hover:text-pink-400 transition-colors border-b border-white/5 last:border-0"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Axis */}
              <div className="space-y-4">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Destination Axis</label>
                <div className="space-y-4">
                  <select 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl appearance-none cursor-pointer"
                  >
                    {INDIAN_DESTINATIONS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>
                  {destination === "Other (Manual Entry)" && (
                    <input 
                      type="text" 
                      value={manualDestination}
                      onChange={(e) => setManualDestination(e.target.value)}
                      placeholder="Type your destination..."
                      className="w-full bg-white/5 border-2 border-pink-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl shadow-xl animate-in fade-in"
                    />
                  )}
                </div>
              </div>

              {/* Hotel Stars */}
              <div className="space-y-4">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Hotel Standard</label>
                <select 
                  value={hotelStars} 
                  onChange={(e) => setHotelStars(parseInt(e.target.value))}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl appearance-none cursor-pointer shadow-xl"
                >
                  {[1,2,3,4,5,6,7].map(s => <option key={s} value={s} className="bg-slate-900">{s} Star Property</option>)}
                </select>
              </div>

              {/* Travelers Count */}
              <div className="space-y-4">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Traveler Manifest</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50" 
                  value={travelersCount} 
                  onChange={(e) => setTravelersCount(parseInt(e.target.value))} 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl shadow-xl" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Expedition Duration</label>
                <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-5 sm:py-7 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-lg sm:text-2xl shadow-xl" />
              </div>

              <div className="md:col-span-2 space-y-6 mt-6">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Expedition Archetypes</label>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map(theme => (
                    <button 
                      key={theme} 
                      onClick={() => toggleTheme(theme)} 
                      className={`px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-500 border-2 ${selectedThemes.includes(theme) ? 'bg-gradient-to-br from-pink-600 to-orange-500 text-white border-transparent shadow-xl scale-105' : 'bg-white/5 text-slate-500 border-white/10 hover:border-pink-500/50'}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your dream trip to India..." className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] sm:rounded-[3rem] px-8 sm:px-12 py-10 sm:py-16 h-48 sm:h-72 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 font-bold text-white text-lg sm:text-2xl shadow-inner placeholder:text-slate-700" />
          )}

          <button onClick={handleGenerate} disabled={loading} className="w-full mt-12 py-6 sm:py-10 rounded-[2rem] sm:rounded-[3rem] font-black text-white text-lg sm:text-3xl bg-gradient-to-r from-pink-600 to-orange-500 shadow-2xl uppercase tracking-[0.5em] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50">
            {loading ? "Constructing Odyssey..." : "Start The Expidition"}
          </button>
        </div>

        {itinerary && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* COLUMN 1 (Desktop) / TOP (Mobile) - Header and Daily Sequence */}
            <div className="lg:col-span-8 space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-10 gap-6">
                <div className="space-y-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500">Target Node</span>
                   <h3 className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-tight">{itinerary.destination.split(' (')[0]}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="bg-pink-500/10 text-pink-500 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-pink-500/20">{itinerary.duration} Day Sequence</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{itinerary.travelersCount} Travelers from {itinerary.startingLocation}</span>
                </div>
              </div>

              {itinerary.days.map((day, dIdx) => (
                <div key={dIdx} className="relative">
                  <div className="flex items-center space-x-6 mb-12">
                    <span className="text-6xl sm:text-9xl font-black textile-gradient tracking-tighter">0{day.day}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                    <span className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs">Day Cycle</span>
                  </div>
                  
                  <div className="space-y-12 pl-0 flow-line relative">
                    {day.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="relative pl-12 sm:pl-20">
                        <div className="absolute left-[1.5rem] sm:left-[2.5rem] top-10 sm:top-14 w-6 h-6 sm:w-9 sm:h-9 bg-pink-500 shadow-[0_0_20px_#ec4899] rounded-full z-10 ring-4 ring-slate-950 transform -translate-x-1/2"></div>
                        
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl group hover:border-pink-500/30 transition-all duration-700">
                          <div className="flex flex-col gap-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex-grow overflow-hidden">
                                 <div className="flex items-center space-x-4 mb-4">
                                    <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-2 flex items-center shadow-inner">
                                      <input 
                                        type="time"
                                        value={activity.time.includes(':') ? activity.time : "09:00"} 
                                        onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)} 
                                        className="bg-transparent text-white text-sm font-black uppercase outline-none cursor-pointer"
                                      />
                                    </div>
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{activity.estimatedTime}</span>
                                 </div>
                                 <h4 className="text-2xl sm:text-4xl font-black text-white tracking-tighter truncate leading-tight">{activity.location}</h4>
                              </div>
                              
                              <div className="flex items-center space-x-4 flex-shrink-0">
                                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'up')} className="p-2 bg-white/5 hover:bg-pink-500 text-white rounded-lg transition-colors disabled:opacity-20" disabled={aIdx === 0}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'down')} className="p-2 bg-white/5 hover:bg-pink-500 text-white rounded-lg transition-colors disabled:opacity-20" disabled={aIdx === day.activities.length - 1}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                  </div>
                                  <span className="text-emerald-400 bg-emerald-500/10 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-xl">{activity.estimatedCost}</span>
                              </div>
                            </div>

                            <p className="text-slate-400 font-bold italic text-base leading-relaxed">{activity.description}</p>
                            <div className="bg-slate-950/50 p-6 rounded-2xl italic font-black text-slate-200 border border-white/5">"{activity.culturalInsight}"</div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                               <button 
                                 onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')} 
                                 className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-500 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                 <span>Maps</span>
                               </button>
                               <div className="relative group/reloc">
                                  <button className="bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-all border border-white/10">Relocate</button>
                                  <div className="absolute bottom-full right-0 mb-3 bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 py-3 w-40 opacity-0 invisible group-hover/reloc:opacity-100 group-hover/reloc:visible transition-all duration-300 transform translate-y-2 group-hover/reloc:translate-y-0 z-50">
                                    <span className="block px-6 pb-2 text-[8px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 mb-2">Target Cycle</span>
                                    {itinerary.days.map((_, i) => (
                                      <button key={i} onClick={() => handleMoveToDay(dIdx, aIdx, i)} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase hover:bg-pink-500/10 text-slate-500 hover:text-pink-400 transition-colors">Day 0{i+1}</button>
                                    ))}
                                  </div>
                               </div>
                               <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="bg-white/5 text-slate-500 hover:text-red-500 p-3 rounded-lg border border-white/10 hover:border-red-500/30 transition-all">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMN 2 (Desktop) / MIDDLE (Mobile) - Discovery Vault */}
            <div className="lg:col-span-4 lg:row-span-3 lg:sticky lg:top-32 h-fit">
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[80px] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                   <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-6 bg-pink-600 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                      <h5 className="font-black text-white uppercase tracking-[0.4em] text-xs">Discovery Vault</h5>
                   </div>
                   <button onClick={() => fetchExtras(itinerary.destination)} className="text-pink-500/50 hover:text-pink-500 transition-all p-2 hover:bg-white/5 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   </button>
                </div>

                <div className="space-y-6 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto no-scrollbar pr-1">
                  {loadingExtras ? (
                    <div className="space-y-6">
                      {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>)}
                    </div>
                  ) : (
                    uniqueExtras.map((extra, idx) => {
                      const isExpanded = expandedExtraIdx === idx;
                      return (
                        <div 
                          key={idx} 
                          className={`group bg-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 border-2 border-transparent hover:border-pink-500/30 cursor-pointer ${isExpanded ? 'bg-slate-800 border-pink-500 shadow-2xl scale-[1.02]' : ''}`}
                          onClick={() => setExpandedExtraIdx(isExpanded ? null : idx)}
                        >
                          <div className="relative h-44 overflow-hidden">
                             <img 
                               src={`https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=600&sig=${encodeURIComponent(extra.location)}`} 
                               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                               alt={extra.location} 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                             <div className="absolute bottom-6 left-8 right-8">
                                <h6 className="font-black text-white text-xl tracking-tighter mb-1 leading-tight">{extra.location}</h6>
                                <div className="flex items-center space-x-3">
                                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{extra.estimatedTime}</span>
                                  <span className="text-[10px] text-slate-500">•</span>
                                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{extra.estimatedCost}</span>
                                </div>
                             </div>
                          </div>

                          <div className={`extra-expand-transition overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                             <div className="p-8 space-y-6 border-t border-white/5">
                                <p className="text-sm text-slate-400 font-bold italic leading-relaxed">{extra.description}</p>
                                <div className="bg-slate-950/50 p-6 rounded-2xl text-[11px] font-black italic text-slate-200 border border-white/5 leading-relaxed">
                                   <span className="block text-pink-500 mb-2 uppercase tracking-widest text-[8px]">Cultural Note:</span>
                                   "{extra.culturalInsight}"
                                </div>
                                
                                <div className="pt-6 border-t border-white/5">
                                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Inject Into Sequence:</label>
                                   <div className="grid grid-cols-2 gap-3">
                                      {itinerary.days.map((_, i) => (
                                        <button 
                                          key={i} 
                                          onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} 
                                          className="text-center py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-pink-600 hover:text-white rounded-[1.5rem] transition-all border border-white/10 hover:border-pink-500 shadow-lg active:scale-90"
                                        >
                                          Day 0{i+1}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 1 (Desktop) / BOTTOM (Mobile) - Logistics & Accommodation */}
            <div className="lg:col-span-8 space-y-12 py-20 border-t border-white/5">
              <div className="flex items-center space-x-6">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">Logistics <span className="textile-gradient">& Stay</span></span>
                <div className="h-px flex-grow bg-white/5"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Travel Options */}
                 <div className="space-y-6">
                    <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 ml-2">Expedition Route from {itinerary.startingLocation}</label>
                    <div className="space-y-4">
                      {itinerary.travelOptions.map((opt, i) => (
                        <div key={i} className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5 group hover:border-pink-500/30 transition-all shadow-xl">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-xs font-black uppercase tracking-widest text-white px-4 py-2 bg-pink-600 rounded-lg">{opt.mode}</span>
                             <span className="text-emerald-400 font-black text-lg">{opt.estimatedCost}</span>
                          </div>
                          <p className="text-slate-400 font-bold italic text-sm leading-relaxed mb-4">{opt.description}</p>
                          <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span>{opt.duration} Transverse</span>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Hotel Picks */}
                 <div className="space-y-6">
                    <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 ml-2">{hotelStars} Star Sanctuary Recommendations</label>
                    <div className="space-y-4">
                      {itinerary.hotelRecommendations.map((hotel, i) => (
                        <div key={i} className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5 group hover:border-orange-500/30 transition-all shadow-xl">
                          <div className="flex items-start justify-between mb-4">
                             <h5 className="font-black text-xl text-white tracking-tight">{hotel.name}</h5>
                             <div className="flex flex-col items-end space-y-2">
                               <span className="text-emerald-400 font-black text-sm">{hotel.estimatedPricePerNight}<span className="text-slate-600 text-[10px] uppercase">/nt</span></span>
                               <button 
                                 onClick={() => window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank')}
                                 className="bg-white/5 hover:bg-pink-600 border border-white/10 hover:border-pink-500 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all flex items-center space-x-2 shadow-lg"
                               >
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                 </svg>
                                 <span>Maps</span>
                               </button>
                             </div>
                          </div>
                          <p className="text-slate-400 font-bold italic text-sm leading-relaxed mb-6">"{hotel.description}"</p>
                          <div className="flex flex-wrap gap-2">
                             {hotel.amenities.slice(0, 4).map(amn => (
                               <span key={amn} className="bg-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5">{amn}</span>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* FINAL STEP - COLUMN 1 Spanning or Centered */}
            <div className="lg:col-span-8 flex justify-center pt-10 pb-20">
               <button onClick={() => onFinalize(itinerary)} className="bg-gradient-to-r from-pink-600 to-orange-500 text-white px-20 py-8 rounded-full font-black text-2xl shadow-[0_30px_70px_rgba(236,72,153,0.3)] hover:-translate-y-2 active:scale-95 transition-all uppercase tracking-[0.5em]">Finalize Journey</button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
