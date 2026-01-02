
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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          textarea { overflow: hidden !important; resize: none !important; }
          .expand-transition {
            transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
          }
          .reorder-item {
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          }
          .flow-line::before {
            content: '';
            position: absolute;
            left: 1.5rem;
            top: 2rem;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, #ec4899 0%, #f59e0b 100%);
            box-shadow: 0 0 12px rgba(236, 72, 153, 0.4);
            z-index: 0;
            transform: translateX(-50%);
          }
          @media (min-width: 640px) {
            .flow-line::before { left: 2.2rem; }
          }
          .textile-gradient {
            background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(315deg) brightness(118%) contrast(119%);
            cursor: pointer;
            scale: 1.5;
          }
        `}</style>
        
        {/* Main Control Panel */}
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] shadow-2xl p-6 sm:p-12 md:p-16 mb-10 border border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[150px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between mb-8 md:mb-16 gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-3 mb-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                 </span>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-400">Architecting Authenticity</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 tracking-tighter leading-[0.9] text-white">
                Journey <span className="textile-gradient">Architect</span>
              </h2>
              <p className="text-slate-400 font-bold text-lg sm:text-2xl leading-relaxed max-w-2xl italic">
                Bespoke expeditions synthesized across Bharat's most iconic heritage coordinates.
              </p>
            </div>
            <div className="flex p-1 bg-white/5 rounded-[1.8rem] self-start shadow-inner border border-white/10">
              <button onClick={() => setMode('form')} className={`px-8 sm:px-12 py-4 rounded-[1.5rem] text-xs sm:text-base font-black transition-all duration-500 ${mode === 'form' ? 'bg-pink-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>Visual Blueprint</button>
              <button onClick={() => setMode('prompt')} className={`px-8 sm:px-12 py-4 rounded-[1.5rem] text-xs sm:text-base font-black transition-all duration-500 ${mode === 'prompt' ? 'bg-pink-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>Intuitive Prompt</button>
            </div>
          </div>

          {mode === 'form' ? (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {/* Starting Location */}
              <div className="space-y-4 relative">
                <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Starting Coordinate</label>
                <input 
                  type="text" 
                  value={startingLocation}
                  onChange={(e) => { setStartingLocation(e.target.value); setShowStartingSuggestions(true); }}
                  onFocus={() => setShowStartingSuggestions(true)}
                  placeholder="Enter origin (e.g. Mumbai)..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.8rem] px-8 py-6 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-xl sm:text-3xl shadow-xl"
                />
                {showStartingSuggestions && filteredStartingLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden z-50 shadow-2xl">
                    {filteredStartingLocations.map(loc => (
                      <button 
                        key={loc} 
                        onClick={() => { setStartingLocation(loc); setShowStartingSuggestions(false); }}
                        className="w-full text-left px-8 py-5 text-base font-black uppercase hover:bg-pink-600/10 text-slate-400 hover:text-pink-400 transition-colors border-b border-white/5 last:border-0"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Axis */}
              <div className="space-y-4 relative">
                <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Destination Axis</label>
                <input 
                  type="text" 
                  value={destinationInput}
                  onChange={(e) => { setDestinationInput(e.target.value); setShowDestSuggestions(true); }}
                  onFocus={() => setShowDestSuggestions(true)}
                  placeholder="Target destination..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.8rem] px-8 py-6 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-xl sm:text-3xl shadow-xl"
                />
                {showDestSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden z-50 shadow-2xl">
                    {filteredDestinations.map(loc => (
                      <button 
                        key={loc} 
                        onClick={() => { setDestinationInput(loc); setShowDestSuggestions(false); }}
                        className="w-full text-left px-8 py-5 text-base font-black uppercase hover:bg-pink-600/10 text-slate-400 hover:text-pink-400 transition-colors border-b border-white/5 last:border-0"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotel Stars */}
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Stay Standard</label>
                <select 
                  value={hotelStars} 
                  onChange={(e) => setHotelStars(parseInt(e.target.value))}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.8rem] px-8 py-6 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-xl sm:text-3xl appearance-none cursor-pointer shadow-xl"
                >
                  {[1,2,3,4,5,6,7].map(s => <option key={s} value={s} className="bg-slate-900">{s} Star Sanctuary</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8 lg:col-span-3 mt-4">
                 <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Traveler Manifest</label>
                  <input type="number" min="1" max="50" value={travelersCount} onChange={(e) => setTravelersCount(parseInt(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-2xl shadow-xl" />
                 </div>
                 <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Expedition Duration</label>
                  <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-black text-white text-2xl shadow-xl" />
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-4 mt-6">
                <label className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Expedition Archetypes</label>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {THEMES.map(theme => (
                    <button 
                      key={theme} 
                      onClick={() => toggleTheme(theme)} 
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-500 border-2 ${selectedThemes.includes(theme) ? 'bg-gradient-to-br from-pink-600 to-orange-500 text-white border-transparent shadow-xl scale-105' : 'bg-white/5 text-slate-500 border-white/10 hover:border-pink-500/50'}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="E.g., I want a 4-day trip to Jaipur for 2 people starting from Delhi. Focus on street food and palaces..." className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] sm:rounded-[4rem] px-10 sm:px-16 py-12 sm:py-24 h-56 sm:h-96 outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 font-bold text-white text-xl sm:text-3xl shadow-inner placeholder:text-slate-700" />
          )}

          <button onClick={handleGenerate} disabled={loading} className="w-full mt-12 py-8 sm:py-12 rounded-[3rem] font-black text-white text-2xl sm:text-4xl bg-gradient-to-r from-pink-600 to-orange-500 shadow-2xl uppercase tracking-[0.5em] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50">
            {loading ? "Constructing Odyssey..." : "Manifest My Journey"}
          </button>
        </div>

        {itinerary && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* COLUMN 1 - Sequence */}
            <div className="lg:col-span-8 space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-10 gap-8">
                <div className="space-y-3">
                   <span className="text-xs font-black uppercase tracking-[0.5em] text-pink-500">Destination</span>
                   <h3 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-tight">{itinerary.destination.split(' (')[0]}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="bg-pink-500/10 text-pink-500 px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest border border-pink-500/20">{itinerary.duration} Day Sequence</span>
                </div>
              </div>

              {itinerary.days.map((day, dIdx) => (
                <div key={dIdx} className="relative">
                  <div className="flex items-center space-x-6 mb-12">
                    <span className="text-5xl sm:text-8xl font-black textile-gradient tracking-tighter">0{day.day}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  
                  <div className="space-y-12 pl-0 flow-line relative">
                    {day.activities.map((activity, aIdx) => (
                      <div key={activity.location + aIdx} className="relative pl-12 sm:pl-20 reorder-item">
                        <div className="absolute left-[1.5rem] sm:left-[2.2rem] top-12 w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 shadow-[0_0_20px_#ec4899] rounded-full z-10 ring-4 ring-slate-950 transform -translate-x-1/2"></div>
                        
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-white/5 shadow-2xl group hover:border-pink-500/30 transition-all duration-700">
                          <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex-grow overflow-hidden">
                                 <div className="flex items-center space-x-4 mb-3">
                                    <div className="bg-white/5 rounded-2xl border-2 border-white/10 px-5 py-3 flex items-center shadow-inner group/clock transition-all hover:bg-white/10 relative">
                                       <svg className="w-5 h-5 text-pink-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                       <input 
                                         type="time"
                                         value={activity.time.includes(':') ? activity.time : "09:00"} 
                                         onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)} 
                                         className="bg-transparent text-white text-lg font-black uppercase outline-none cursor-pointer"
                                       />
                                    </div>
                                    <span className="text-sm font-black text-orange-500 uppercase tracking-widest">{activity.estimatedTime}</span>
                                 </div>
                                 <h4 className="text-2xl sm:text-4xl font-black text-white tracking-tighter truncate leading-tight group-hover:text-pink-500 transition-colors">{activity.location}</h4>
                              </div>
                              <div className="flex items-center space-x-3 flex-shrink-0">
                                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'up')} className="p-2 bg-white/5 hover:bg-pink-500 text-white rounded-xl disabled:opacity-20" disabled={aIdx === 0}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" /></svg></button>
                                    <button onClick={() => handleReorderActivity(dIdx, aIdx, 'down')} className="p-2 bg-white/5 hover:bg-pink-500 text-white rounded-xl disabled:opacity-20" disabled={aIdx === day.activities.length - 1}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg></button>
                                  </div>
                                  <span className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl text-xs font-black uppercase border border-emerald-500/20 shadow-xl">{activity.estimatedCost}</span>
                              </div>
                            </div>

                            <p className="text-slate-400 font-bold italic text-base sm:text-xl leading-relaxed group-hover:text-slate-200 transition-colors">"{activity.description}"</p>
                            <div className="bg-slate-950/50 p-6 sm:p-10 rounded-[2rem] text-sm sm:text-lg font-black italic text-slate-200 border border-white/5 leading-relaxed relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-3xl rounded-full"></div>
                               "{activity.culturalInsight}"
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                               <button onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')} className="flex items-center space-x-2 text-emerald-500 font-black text-xs uppercase tracking-widest px-6 py-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                 <span>Maps</span>
                               </button>
                               <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="bg-white/5 text-slate-500 hover:text-red-500 p-3 rounded-xl border border-white/10 hover:border-red-500/30 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-12 flex justify-center">
                 <button onClick={() => onFinalize(itinerary)} className="bg-gradient-to-r from-pink-600 to-orange-500 text-white px-16 py-8 rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(236,72,153,0.4)] hover:-translate-y-2 active:scale-95 transition-all uppercase tracking-[0.4em]">Finalize Odyssey</button>
              </div>
            </div>

            {/* COLUMN 2 - Vault / Logistics / Stay */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 h-fit">
              
              {/* Discovery Vault - Interactive & Premium */}
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-6 bg-pink-600 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                      <h5 className="font-black text-white uppercase tracking-[0.4em] text-sm">Discovery Vault</h5>
                   </div>
                   <button onClick={() => fetchExtras(itinerary.destination)} className="text-pink-500/50 hover:text-pink-500 p-2 hover:bg-white/5 rounded-lg transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {loadingExtras ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>)}</div>
                  ) : (
                    uniqueExtras.map((extra, idx) => {
                      const isExpanded = expandedExtraIdx === idx;
                      return (
                        <div key={idx} className={`bg-white/5 rounded-[1.8rem] p-6 cursor-pointer border-l-4 transition-all duration-500 ${isExpanded ? 'border-pink-500 bg-slate-800 shadow-2xl scale-[1.02]' : 'border-transparent hover:border-pink-500/30 hover:bg-white/10'}`} onClick={() => setExpandedExtraIdx(isExpanded ? null : idx)}>
                           <div className="flex justify-between items-start mb-2">
                              <h6 className="font-black text-white text-lg leading-tight flex-grow pr-4">{extra.location}</h6>
                              <span className="text-[10px] text-emerald-400 font-black whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{extra.estimatedCost}</span>
                           </div>
                           <p className={`text-sm text-slate-400 font-bold italic leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>"{extra.description}"</p>
                           {isExpanded && (
                             <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-slate-950/50 p-4 rounded-xl text-xs font-black italic text-slate-200 border border-white/5">
                                   <span className="text-pink-500 uppercase tracking-widest text-[9px] block mb-1">Deep Analysis:</span>
                                   "{extra.culturalInsight}"
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); window.open(extra.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(extra.location)}`, '_blank'); }} className="flex-1 py-3 bg-white/5 hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase text-white transition-all border border-white/10">Show Maps</button>
                                </div>
                                <div className="pt-2">
                                   <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">Deploy into Cycle:</label>
                                   <div className="flex flex-wrap gap-2">
                                      {itinerary.days.map((_, i) => (
                                        <button key={i} onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg border border-white/5 transition-all">Day 0{i+1}</button>
                                      ))}
                                   </div>
                                </div>
                             </div>
                           )}
                           {!isExpanded && <p className="text-[10px] text-slate-600 font-black italic mt-3">Expand for analysis & mapping...</p>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Expedition Logistics - Enhanced & Expandable */}
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
                <h5 className="font-black text-pink-500 uppercase tracking-[0.4em] text-sm mb-8 ml-1">Logistics Architecture</h5>
                <div className="space-y-4">
                  {itinerary.travelOptions.map((opt, i) => {
                    const isExpanded = expandedTravelIdx === i;
                    return (
                      <div key={i} className={`bg-white/5 rounded-[1.5rem] p-6 cursor-pointer border-l-4 transition-all duration-500 ${isExpanded ? 'border-pink-500 bg-slate-800 shadow-2xl' : 'border-transparent hover:bg-white/10'}`} onClick={() => setExpandedTravelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-4">
                               <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                               </div>
                               <div>
                                  <h6 className="text-base font-black text-white uppercase tracking-tight">{opt.mode}</h6>
                                  <span className="text-[10px] text-slate-500 font-black uppercase">{opt.duration} Cycle</span>
                               </div>
                            </div>
                            <span className="text-emerald-400 font-black text-lg tracking-tighter">{opt.estimatedCost}</span>
                         </div>
                         <p className={`text-sm text-slate-400 font-bold italic mt-3 ${isExpanded ? '' : 'truncate'}`}>"{opt.description}"</p>
                         {isExpanded && (
                           <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in duration-500">
                              <div className="bg-slate-950/40 p-4 rounded-xl text-xs text-slate-500 italic leading-relaxed">
                                Optimal route verified from origin {itinerary.startingLocation} to target node {itinerary.destination.split(' (')[0]}.
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/search?q=book+${opt.mode.toLowerCase()}+from+${itinerary.startingLocation}+to+${itinerary.destination.split(' (')[0]}`, '_blank'); }} 
                                className="w-full py-5 bg-pink-600 hover:bg-pink-500 rounded-2xl text-sm font-black uppercase text-white shadow-2xl transition-all active:scale-95 tracking-widest"
                              >
                                Secure Portal Access
                              </button>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stay Sanctuary - Enhanced & Expandable */}
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h5 className="font-black text-orange-500 uppercase tracking-[0.4em] text-sm ml-1">Stay Sanctuary</h5>
                  <button onClick={handleRefreshHotels} disabled={loadingHotels} className="text-orange-500/50 hover:text-orange-500 p-2 hover:bg-white/5 rounded-lg transition-all"><svg className={`w-6 h-6 ${loadingHotels ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4">
                  {itinerary.hotelRecommendations.map((hotel, i) => {
                    const isExpanded = expandedHotelIdx === i;
                    return (
                      <div key={i} className={`bg-white/5 rounded-[1.8rem] p-6 cursor-pointer border-l-4 transition-all duration-500 ${isExpanded ? 'border-orange-500 bg-slate-800 shadow-2xl' : 'border-transparent hover:bg-white/10'}`} onClick={() => setExpandedHotelIdx(isExpanded ? null : i)}>
                         <div className="flex justify-between items-start mb-2 gap-4">
                            <h6 className="text-lg font-black text-white leading-tight flex-grow pr-2">{hotel.name}</h6>
                            <span className="text-emerald-400 font-black text-base whitespace-nowrap">{hotel.estimatedPricePerNight}</span>
                         </div>
                         <p className={`text-sm text-slate-400 font-bold italic leading-relaxed ${isExpanded ? '' : 'truncate'}`}>"{hotel.description}"</p>
                         {isExpanded && (
                           <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in duration-500">
                              <div className="flex flex-wrap gap-2">
                                {hotel.amenities.map(a => <span key={a} className="bg-white/5 px-4 py-2 rounded-xl text-[9px] text-slate-400 uppercase font-black border border-white/5 hover:text-slate-200 transition-colors">{a}</span>)}
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank'); }} 
                                className="w-full py-5 bg-orange-600 hover:bg-orange-500 rounded-2xl text-sm font-black uppercase text-white shadow-2xl transition-all active:scale-95 tracking-widest"
                              >
                                Locate Node Site
                              </button>
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
