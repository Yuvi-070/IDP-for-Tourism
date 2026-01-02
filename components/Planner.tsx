
import React, { useState, useEffect, useMemo } from 'react';
import { INDIAN_DESTINATIONS, THEMES } from '../constants';
import { generateTravelItinerary, generateItineraryFromPrompt, getMoreSuggestions, refreshHotelRecommendations } from '../services/geminiService';
import { Itinerary, Activity, HotelRecommendation, TravelOption } from '../types';

interface PlannerProps {
  initialDestination?: string | null;
  onFinalize: (itinerary: Itinerary) => void;
}

const Planner: React.FC<PlannerProps> = ({ initialDestination, onFinalize }) => {
  const [mode, setMode] = useState<'form' | 'prompt'>('form');
  const [destinationInput, setDestinationInput] = useState('');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  
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
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [expandedExtraIdx, setExpandedExtraIdx] = useState<number | null>(null);
  const [seenHotelNames, setSeenHotelNames] = useState<Set<string>>(new Set());

  // Expansion states
  const [expandedTravelIdx, setExpandedTravelIdx] = useState<number | null>(null);
  const [expandedHotelIdx, setExpandedHotelIdx] = useState<number | null>(null);

  useEffect(() => {
    if (initialDestination) {
      setDestinationInput(initialDestination);
    }
  }, [initialDestination]);

  const filteredStartingLocations = useMemo(() => {
    if (!startingLocation) return [];
    return INDIAN_DESTINATIONS.filter(loc => 
      loc.toLowerCase().includes(startingLocation.toLowerCase()) && loc !== "Other (Manual Entry)"
    ).slice(0, 5);
  }, [startingLocation]);

  const filteredDestinations = useMemo(() => {
    if (!destinationInput) return INDIAN_DESTINATIONS.filter(d => d !== "Other (Manual Entry)").slice(0, 5);
    return INDIAN_DESTINATIONS.filter(loc => 
      loc.toLowerCase().includes(destinationInput.toLowerCase()) && loc !== "Other (Manual Entry)"
    ).slice(0, 5);
  }, [destinationInput]);

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
      
      if (mode === 'form') {
        const targetDest = destinationInput.trim() || INDIAN_DESTINATIONS[0];
        if (!targetDest || !startingLocation) {
          alert("Please provide both starting location and destination.");
          setLoading(false);
          return;
        }
        data = await generateTravelItinerary(targetDest, duration, selectedThemes, startingLocation, hotelStars, travelersCount);
      } else {
        if (!prompt.trim()) {
          alert("Please describe your trip intent!");
          setLoading(false);
          return;
        }
        data = await generateItineraryFromPrompt(prompt);
      }
      
      setItinerary(data);
      setSeenHotelNames(new Set(data.hotelRecommendations.map(h => h.name.toLowerCase())));
      fetchExtras(data.destination);
    } catch (error) {
      console.error(error);
      alert("Odyssey synthesis failure. Please refine your parameters and retry.");
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

  const handleRefreshHotels = async () => {
    if (!itinerary) return;
    setLoadingHotels(true);
    try {
      const newHotels = await refreshHotelRecommendations(
        itinerary.destination, 
        hotelStars, 
        Array.from(seenHotelNames)
      );
      
      const filtered = newHotels.filter(h => !seenHotelNames.has(h.name.toLowerCase()));
      if (filtered.length === 0) {
        alert("All unique local sanctuaries have been indexed.");
      } else {
        setItinerary(prev => prev ? {
          ...prev,
          hotelRecommendations: filtered
        } : null);
        setSeenHotelNames(prev => {
          const next = new Set(prev);
          filtered.forEach(h => next.add(h.name.toLowerCase()));
          return next;
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to refresh stay options.");
    } finally {
      setLoadingHotels(false);
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
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 lg:px-16">
        <style>{`
          .cockpit-panel {
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 
              0 30px 60px -12px rgba(0, 0, 0, 0.7),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
          }
          .input-pill {
            background: rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.05);
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .input-pill:focus-within {
            border-color: rgba(236, 72, 153, 0.4);
            background: rgba(0, 0, 0, 0.3);
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(236, 72, 153, 0.1);
          }
          .flow-line::before {
            content: '';
            position: absolute;
            left: 1.5rem;
            top: 2rem;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #ec4899 0%, #f59e0b 50%, #ec4899 100%);
            opacity: 0.2;
            z-index: 0;
          }
          @media (min-width: 640px) {
            .flow-line::before { left: 3rem; width: 4px; }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        
        {/* Main Control Cockpit */}
        <div className="cockpit-panel rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-14 lg:p-20 mb-12 sm:mb-20 relative overflow-hidden group">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[180px] pointer-events-none group-hover:bg-pink-500/10 transition-colors duration-1000"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between mb-10 sm:mb-16 gap-6 sm:gap-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center space-x-4 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                 </span>
                 <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-pink-400">Synthesis Engine 2.5</span>
              </div>
              <h2 className="text-4xl sm:text-7xl lg:text-8xl font-black mb-4 tracking-tight leading-tight text-white">
                Expedition <span className="textile-gradient">Architect</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg sm:text-2xl leading-relaxed max-w-2xl italic tracking-tight">
                Architecting bespoke cultural cycles across Bharat's coordinates.
              </p>
            </div>
            <div className="flex p-1 bg-black/40 rounded-2xl sm:rounded-[2rem] self-start border border-white/5 backdrop-blur-3xl">
              <button onClick={() => setMode('form')} className={`px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black transition-all duration-500 ${mode === 'form' ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Control</button>
              <button onClick={() => setMode('prompt')} className={`px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black transition-all duration-500 ${mode === 'prompt' ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Intuition</button>
            </div>
          </div>

          {mode === 'form' ? (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {/* Starting Location */}
              <div className="space-y-4 relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Origin Axis</label>
                <div className="input-pill rounded-2xl sm:rounded-[2rem] px-6 sm:px-10 py-5 sm:py-8 relative">
                  <input 
                    type="text" 
                    value={startingLocation}
                    onChange={(e) => { setStartingLocation(e.target.value); setShowStartingSuggestions(true); }}
                    onFocus={() => setShowStartingSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStartingSuggestions(false), 200)}
                    placeholder="Origin..."
                    className="w-full bg-transparent outline-none font-black text-white text-xl sm:text-3xl placeholder:text-slate-800"
                  />
                  {showStartingSuggestions && filteredStartingLocations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-[2rem] overflow-hidden z-[100] shadow-2xl">
                      {filteredStartingLocations.map(loc => (
                        <button 
                          key={loc} 
                          onClick={() => { setStartingLocation(loc); setShowStartingSuggestions(false); }}
                          className="w-full text-left px-8 py-5 text-[10px] font-black uppercase hover:bg-pink-600 text-slate-400 hover:text-white transition-all border-b border-white/5 last:border-0"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Axis */}
              <div className="space-y-4 relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Target Node</label>
                <div className="input-pill rounded-2xl sm:rounded-[2rem] px-6 sm:px-10 py-5 sm:py-8 relative">
                  <input 
                    type="text" 
                    value={destinationInput}
                    onChange={(e) => { setDestinationInput(e.target.value); setShowDestSuggestions(true); }}
                    onFocus={() => setShowDestSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                    placeholder="Target..."
                    className="w-full bg-transparent outline-none font-black text-white text-xl sm:text-3xl placeholder:text-slate-800"
                  />
                  {showDestSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-[2rem] overflow-hidden z-[100] shadow-2xl">
                      {filteredDestinations.map(loc => (
                        <button 
                          key={loc} 
                          onClick={() => { setDestinationInput(loc); setShowDestSuggestions(false); }}
                          className="w-full text-left px-8 py-5 text-[10px] font-black uppercase hover:bg-pink-600 text-slate-400 hover:text-white transition-all border-b border-white/5 last:border-0"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Stars */}
              <div className="space-y-4">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Sanctuary Tier</label>
                <div className="input-pill rounded-2xl sm:rounded-[2rem] px-6 sm:px-10 py-5 sm:py-8">
                  <select 
                    value={hotelStars} 
                    onChange={(e) => setHotelStars(parseInt(e.target.value))}
                    className="w-full bg-transparent outline-none font-black text-white text-xl sm:text-3xl appearance-none cursor-pointer"
                  >
                    {[3,4,5,7].map(s => <option key={s} value={s} className="bg-slate-900">{s} Star</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 lg:col-span-3">
                 <div className="space-y-4">
                  <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Travelers</label>
                  <div className="input-pill rounded-xl sm:rounded-2xl px-6 py-4 sm:py-6">
                    <input type="number" min="1" max="50" value={travelersCount} onChange={(e) => setTravelersCount(parseInt(e.target.value))} className="w-full bg-transparent outline-none font-black text-white text-xl sm:text-3xl" />
                  </div>
                 </div>
                 <div className="space-y-4">
                  <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Cycles (Days)</label>
                  <div className="input-pill rounded-xl sm:rounded-2xl px-6 py-4 sm:py-6">
                    <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-transparent outline-none font-black text-white text-xl sm:text-3xl" />
                  </div>
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-6 mt-4 sm:mt-8">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Archetypes</label>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {THEMES.slice(0, 10).map(theme => (
                    <button 
                      key={theme} 
                      onClick={() => toggleTheme(theme)} 
                      className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 border-2 ${selectedThemes.includes(theme) ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="input-pill rounded-[2rem] sm:rounded-[3rem] px-8 py-10">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe intent... (e.g. 3 days in Udaipur focus on lakes)" className="w-full bg-transparent h-40 sm:h-64 outline-none font-black text-white text-xl sm:text-3xl placeholder:text-slate-800 leading-tight" />
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading} className="w-full mt-10 sm:mt-16 py-6 sm:py-10 rounded-2xl sm:rounded-[3rem] font-black text-white text-2xl sm:text-4xl bg-gradient-to-r from-pink-600 to-orange-500 shadow-xl uppercase tracking-[0.4em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4">
            {loading ? (
              <>
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Synthesizing...</span>
              </>
            ) : "Execute"}
          </button>
        </div>

        {itinerary && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* COLUMN 1 - Sequence */}
            <div className="lg:col-span-8 space-y-16 sm:space-y-24">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-10 sm:pb-16 gap-6">
                <div className="space-y-3">
                   <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500">Target Coordinates</span>
                   <h3 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-none">{itinerary.destination.split(' (')[0]}</h3>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                   <span className="bg-white text-slate-950 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">{itinerary.duration} Day Manifest</span>
                </div>
              </div>

              {itinerary.days.map((day, dIdx) => (
                <div key={dIdx} className="relative">
                  <div className="flex items-center space-x-6 mb-10 sm:mb-16">
                    <span className="text-5xl sm:text-9xl font-black textile-gradient tracking-tighter leading-none opacity-40">0{day.day}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  
                  <div className="space-y-12 sm:space-y-20 pl-0 flow-line relative">
                    {day.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="relative pl-12 sm:pl-24">
                        <div className="absolute left-[1.5rem] sm:left-[3rem] top-10 sm:top-14 w-6 h-6 sm:w-10 sm:h-10 bg-white shadow-xl rounded-xl z-10 ring-4 sm:ring-8 ring-slate-950 transform -translate-x-1/2 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 border border-white/5 shadow-xl group transition-all duration-700 hover:border-pink-500/30">
                          <div className="flex flex-col gap-6 sm:gap-8">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-grow">
                                 <div className="flex items-center space-x-4 mb-4">
                                    <div className="bg-black/40 rounded-xl border border-white/10 px-4 py-2 flex items-center shadow-inner">
                                       <svg className="w-4 h-4 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                       <input 
                                         type="time"
                                         value={activity.time.includes(':') ? activity.time : "09:00"} 
                                         onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)} 
                                         className="bg-transparent text-white text-sm sm:text-base font-black uppercase outline-none"
                                       />
                                    </div>
                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{activity.estimatedTime}</span>
                                 </div>
                                 <h4 className="text-xl sm:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-pink-500 transition-colors">{activity.location}</h4>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                  <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'up')} className="p-2 bg-white/5 hover:bg-white hover:text-slate-950 rounded-lg transition-all" disabled={aIdx === 0}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" /></svg></button>
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'down')} className="p-2 bg-white/5 hover:bg-white hover:text-slate-950 rounded-lg transition-all" disabled={aIdx === day.activities.length - 1}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg></button>
                                  </div>
                                  <span className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-emerald-500/10 tracking-widest">{activity.estimatedCost}</span>
                              </div>
                            </div>

                            <p className="text-slate-400 font-medium italic text-lg sm:text-2xl leading-relaxed">"{activity.description}"</p>
                            
                            <div className="bg-black/60 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] text-base sm:text-xl font-black italic text-slate-300 border border-white/5 leading-relaxed relative overflow-hidden">
                               <span className="text-pink-500 uppercase tracking-widest text-[9px] block mb-4 opacity-60">Synthesis Insight:</span>
                               "{activity.culturalInsight}"
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                               <button onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')} className="flex items-center space-x-3 text-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                 <span>Maps</span>
                               </button>
                               <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="bg-white/5 text-slate-600 hover:text-red-500 p-3 rounded-xl border border-white/5 hover:border-red-500/30 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-16 sm:pt-24 flex justify-center">
                 <button onClick={() => onFinalize(itinerary)} className="bg-white text-slate-950 px-16 py-6 sm:px-24 sm:py-8 rounded-full font-black text-xl sm:text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.4em]">Verify Manifest</button>
              </div>
            </div>

            {/* COLUMN 2 - Right Sidebar - Restored features */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit">
              
              {/* Logic Vault (Extras) */}
              <div className="cockpit-panel rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                      <h5 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">Discovery Vault</h5>
                   </div>
                   <button onClick={() => fetchExtras(itinerary.destination)} className="text-pink-500/40 hover:text-pink-500 transition-all"><svg className={`w-5 h-5 ${loadingExtras ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {loadingExtras ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>)}</div>
                  ) : (
                    uniqueExtras.map((extra, idx) => {
                      const isExpanded = expandedExtraIdx === idx;
                      return (
                        <div key={idx} className={`bg-black/40 rounded-2xl p-5 cursor-pointer border-2 transition-all ${isExpanded ? 'border-pink-500 bg-black/60 shadow-xl' : 'border-white/5 hover:border-white/10'}`} onClick={() => setExpandedExtraIdx(isExpanded ? null : idx)}>
                           <div className="flex justify-between items-start mb-2">
                              <h6 className="font-black text-white text-sm leading-tight flex-grow pr-3">{extra.location}</h6>
                              <span className="text-[8px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded-md uppercase">{extra.estimatedCost}</span>
                           </div>
                           <p className={`text-xs text-slate-500 font-medium italic leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>"{extra.description}"</p>
                           {isExpanded && (
                             <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                <div className="bg-black/40 p-3 rounded-lg text-[10px] font-black italic text-slate-300 border border-white/5">"{extra.culturalInsight}"</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {itinerary.days.map((_, i) => (
                                    <button key={i} onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} className="px-3 py-2 text-[8px] font-black uppercase text-slate-500 hover:bg-white hover:text-slate-950 rounded-lg border border-white/5 transition-all">Add: Day 0{i+1}</button>
                                  ))}
                                </div>
                             </div>
                           )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Vector Analysis (Logistics) */}
              <div className="cockpit-panel rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 border border-white/10 shadow-2xl">
                <h5 className="font-black text-orange-500 uppercase tracking-[0.3em] text-[10px] mb-8">Vector Analysis</h5>
                <div className="space-y-4">
                  {itinerary.travelOptions.map((opt, i) => {
                    const isExpanded = expandedTravelIdx === i;
                    return (
                      <div key={i} className={`bg-black/40 rounded-2xl p-5 cursor-pointer border-2 transition-all ${isExpanded ? 'border-orange-500 bg-black/60 shadow-xl' : 'border-white/5 hover:border-white/10'}`} onClick={() => setExpandedTravelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                               </div>
                               <div>
                                  <h6 className="text-sm font-black text-white uppercase">{opt.mode}</h6>
                                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{opt.duration}</span>
                               </div>
                            </div>
                            <span className="text-emerald-400 font-black text-sm">{opt.estimatedCost}</span>
                         </div>
                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                              <p className="text-[10px] text-slate-400 font-medium italic">"{opt.description}"</p>
                              <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/search?q=book+${opt.mode.toLowerCase()}+from+${itinerary.startingLocation}+to+${itinerary.destination.split(' (')[0]}`, '_blank'); }} className="w-full py-3 bg-white text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:brightness-110">Access Node</button>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanctuary Stays (Hotels) - Restored Sidebar section */}
              <div className="cockpit-panel rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h5 className="font-black text-emerald-500 uppercase tracking-[0.3em] text-[10px]">Sanctuary Stays</h5>
                  <button onClick={handleRefreshHotels} className="text-emerald-500/40 hover:text-emerald-500 transition-all"><svg className={`w-5 h-5 ${loadingHotels ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4">
                  {itinerary.hotelRecommendations.map((hotel, i) => {
                    const isExpanded = expandedHotelIdx === i;
                    return (
                      <div key={i} className={`bg-black/40 rounded-2xl p-5 cursor-pointer border-2 transition-all ${isExpanded ? 'border-emerald-500 bg-black/60 shadow-xl' : 'border-white/5 hover:border-white/10'}`} onClick={() => setExpandedHotelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-start mb-2">
                            <h6 className="text-sm font-black text-white truncate w-2/3 uppercase">{hotel.name}</h6>
                            <span className="text-[8px] text-emerald-400 font-black uppercase">{hotel.estimatedPricePerNight}/night</span>
                         </div>
                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
                             <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">"{hotel.description}"</p>
                             <div className="flex flex-wrap gap-1">
                               {hotel.amenities.slice(0, 4).map(a => <span key={a} className="bg-white/5 px-2 py-1 rounded text-[7px] text-slate-500 uppercase font-black">{a}</span>)}
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank'); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-black text-[9px] uppercase transition-all shadow-lg active:scale-95">Verify Site</button>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
