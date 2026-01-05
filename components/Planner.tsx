
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const [showStarDropdown, setShowStarDropdown] = useState(false);
  const [travelersCount, setTravelersCount] = useState(2);

  const [duration, setDuration] = useState(3);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([THEMES[0]]);
  const [customTheme, setCustomTheme] = useState('');
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [extraSuggestions, setExtraSuggestions] = useState<Activity[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [expandedExtraIdx, setExpandedExtraIdx] = useState<number | null>(null);
  const [seenHotelNames, setSeenHotelNames] = useState<Set<string>>(new Set());

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
    ).slice(0, 8);
  }, [startingLocation]);

  const filteredDestinations = useMemo(() => {
    if (!destinationInput) return INDIAN_DESTINATIONS.filter(d => d !== "Other (Manual Entry)").slice(0, 8);
    return INDIAN_DESTINATIONS.filter(loc => 
      loc.toLowerCase().includes(destinationInput.toLowerCase()) && loc !== "Other (Manual Entry)"
    ).slice(0, 8);
  }, [destinationInput]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.length > 1 ? prev.filter(t => t !== theme) : prev
        : [...prev, theme]
    );
  };

  const addCustomTheme = () => {
    if (customTheme.trim()) {
      setSelectedThemes(prev => [...prev, customTheme.trim()]);
      setCustomTheme('');
      setIsAddingTheme(false);
    }
  };

  const handleGenerate = async () => {
    if (mode === 'form') {
      if (!startingLocation.trim()) {
        alert("CRITICAL ERROR: Origin Axis is required to deploy the architect.");
        return;
      }
      if (!destinationInput.trim()) {
        alert("CRITICAL ERROR: Target Node is must to select same as ORIGIN.");
        return;
      }
    } else {
      if (!prompt.trim()) {
        alert("CRITICAL ERROR: Prompt input is mandatory for Intuitive Command.");
        return;
      }
    }

    setLoading(true);
    setExtraSuggestions([]);
    try {
      let data: Itinerary;
      if (mode === 'form') {
        data = await generateTravelItinerary(destinationInput, duration, selectedThemes, startingLocation, hotelStars, travelersCount);
      } else {
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
      const newHotels = await refreshHotelRecommendations(itinerary.destination, hotelStars, Array.from(seenHotelNames));
      const filtered = newHotels.filter(h => !seenHotelNames.has(h.name.toLowerCase()));
      if (filtered.length === 0) {
        alert("All unique local sanctuaries have been indexed.");
      } else {
        setItinerary(prev => prev ? { ...prev, hotelRecommendations: filtered } : null);
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
    const currentLocations = new Set(itinerary.days.flatMap(day => day.activities.map(act => act.location.toLowerCase())));
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
    }
    else if (direction === 'down' && actIdx < activities.length - 1) { 
      [activities[actIdx], activities[actIdx + 1]] = [activities[actIdx + 1], activities[actIdx]]; 
    }
    newItinerary.days[dayIdx].activities = activities;
    setItinerary(newItinerary);
  };

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities[activityIndex] = { ...newItinerary.days[dayIndex].activities[activityIndex], [field]: value };
    setItinerary(newItinerary);
  };

  const renderTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'train': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
      case 'bus': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2zm0 0l-5 5m5-5l5 5m-15 5h1a2 2 0 100-4h-1v-4a2 2 0 00-2-2h-3a2 2 0 00-2 2v4h-1a2 2 0 100 4h1m5 0v-2" /></svg>;
      default: return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
    }
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-orange-500' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3-.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
    ));
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 lg:px-16">
        <style>{`
          .cockpit-panel { background: linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5); }
          .input-pill { background: rgba(0, 0, 0, 0.2); border: 2px solid rgba(255, 255, 255, 0.05); transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
          .input-pill:focus-within { border-color: rgba(236, 72, 153, 0.4); background: rgba(0, 0, 0, 0.3); }
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          .flow-line::before { content: ''; position: absolute; left: 1.5rem; top: 2rem; bottom: 0; width: 2px; background: linear-gradient(to bottom, #ec4899 0%, #f59e0b 50%, #ec4899 100%); opacity: 0.2; z-index: 0; }
          @media (min-width: 640px) { .flow-line::before { left: 3rem; width: 4px; } }
          
          @media (max-width: 1023px) {
            .planner-grid { display: flex; flex-direction: column; }
            .itinerary-stack { order: 1; }
            .finalize-btn-container { order: 2; margin-top: 3rem; margin-bottom: 3rem; }
            .sidebar-stack { order: 3; }
          }
        `}</style>
        
        {/* Main Control Cockpit */}
        <div className="cockpit-panel rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-14 mb-12 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between mb-10 gap-6">
            <div className="max-w-4xl">
              <div className="inline-flex items-center space-x-4 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                 <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-pink-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Expedition Architecture v2.5</span>
              </div>
              <h2 className="text-4xl sm:text-7xl font-black mb-4 tracking-tight leading-tight text-white">Journey <span className="textile-gradient">Architect</span></h2>
            </div>
            <div className="flex p-1 bg-black/40 rounded-[1.5rem] self-start border border-white/5">
              <button onClick={() => setMode('form')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${mode === 'form' ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Form Axis</button>
              <button onClick={() => setMode('prompt')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${mode === 'prompt' ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Intuition</button>
            </div>
          </div>

          {mode === 'form' ? (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {/* Form inputs same as before but ensure UI quality */}
              <div className="space-y-4 relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Origin Axis *</label>
                <div className="input-pill rounded-2xl px-6 py-5 relative">
                  <input type="text" value={startingLocation} onChange={(e) => { setStartingLocation(e.target.value); setShowStartingSuggestions(true); }} onFocus={() => setShowStartingSuggestions(true)} onBlur={() => setTimeout(() => setShowStartingSuggestions(false), 250)} placeholder="Origin (Mumbai, Delhi...)" className="w-full bg-transparent outline-none font-black text-white text-xl placeholder:text-slate-800" />
                  {showStartingSuggestions && filteredStartingLocations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl max-h-64 overflow-y-auto custom-scroll">
                      {filteredStartingLocations.map(loc => ( <button key={loc} onClick={() => { setStartingLocation(loc); setShowStartingSuggestions(false); }} className="w-full text-left px-8 py-4 text-[10px] font-black uppercase hover:bg-pink-600 text-slate-400 hover:text-white transition-all border-b border-white/5 last:border-0">{loc}</button> ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Target Node *</label>
                <div className="input-pill rounded-2xl px-6 py-5 relative">
                  <input type="text" value={destinationInput} onChange={(e) => { setDestinationInput(e.target.value); setShowDestSuggestions(true); }} onFocus={() => setShowDestSuggestions(true)} onBlur={() => setTimeout(() => setShowDestSuggestions(false), 250)} placeholder="Target (Jaipur, Varanasi...)" className="w-full bg-transparent outline-none font-black text-white text-xl placeholder:text-slate-800" />
                  {showDestSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl max-h-64 overflow-y-auto custom-scroll">
                      {filteredDestinations.map(loc => ( <button key={loc} onClick={() => { setDestinationInput(loc); setShowDestSuggestions(false); }} className="w-full text-left px-8 py-4 text-[10px] font-black uppercase hover:bg-pink-600 text-slate-400 hover:text-white transition-all border-b border-white/5 last:border-0">{loc}</button> ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Sanctuary Tier</label>
                <div className="input-pill rounded-2xl px-6 py-5 relative flex items-center justify-between" onClick={() => setShowStarDropdown(!showStarDropdown)}>
                  <span className="font-black text-white text-xl">{hotelStars} Star Sanctuary</span>
                  <svg className={`w-5 h-5 text-slate-500 transition-transform ${showStarDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  {showStarDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl">
                      {[1,2,3,4,5,7].map(s => ( <button key={s} onClick={(e) => { e.stopPropagation(); setHotelStars(s); setShowStarDropdown(false); }} className="w-full text-left px-8 py-4 text-[10px] font-black uppercase hover:bg-emerald-600 text-slate-400 hover:text-white transition-all border-b border-white/5 last:border-0">{s} Star</button> ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 lg:col-span-3">
                 <div className="space-y-4">
                  <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Travelers</label>
                  <div className="input-pill rounded-xl px-6 py-4"> <input type="number" min="1" max="50" value={travelersCount} onChange={(e) => setTravelersCount(parseInt(e.target.value))} className="w-full bg-transparent outline-none font-black text-white text-2xl" /> </div>
                 </div>
                 <div className="space-y-4">
                  <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Cycles (Days)</label>
                  <div className="input-pill rounded-xl px-6 py-4"> <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-transparent outline-none font-black text-white text-2xl" /> </div>
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-6 mt-4">
                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Archetypes</label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map(theme => ( <button key={theme} onClick={() => toggleTheme(theme)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border-2 ${selectedThemes.includes(theme) ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}>{theme}</button> ))}
                  <button onClick={() => setIsAddingTheme(!isAddingTheme)} className="px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 border-dashed border-pink-500/50 text-pink-400 hover:bg-pink-500 hover:text-white transition-all">Other*</button>
                </div>
                {isAddingTheme && (
                  <div className="flex space-x-2 mt-4 animate-in fade-in slide-in-from-top-2">
                    <input type="text" value={customTheme} onChange={(e) => setCustomTheme(e.target.value)} placeholder="Enter manual archetype..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-white outline-none focus:border-pink-500 flex-grow" />
                    <button onClick={addCustomTheme} className="bg-pink-600 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white">Add</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="input-pill rounded-[2rem] px-8 py-10"> <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe intent..." className="w-full bg-transparent h-40 outline-none font-black text-white text-xl placeholder:text-slate-800 leading-tight" /> </div>
          )}

          <button onClick={handleGenerate} disabled={loading} className="w-full mt-10 py-6 rounded-[2rem] font-black text-white text-2xl bg-gradient-to-r from-pink-600 to-orange-500 shadow-xl uppercase tracking-[0.4em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4">
            {loading ? <span className="animate-pulse">Synthesizing Narrative...</span> : "Execute Deployment"}
          </button>
        </div>

        {itinerary && (
          <div className="planner-grid grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* COLUMN 1 - Sequence */}
            <div className="itinerary-stack lg:col-span-8 space-y-16">
              {itinerary.days.map((day, dIdx) => (
                <div key={dIdx} className="relative">
                  <div className="flex items-center space-x-6 mb-10">
                    <span className="text-4xl sm:text-5xl font-black textile-gradient tracking-tighter opacity-40">0{day.day}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  <div className="space-y-12 pl-0 flow-line relative">
                    {day.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="relative pl-10 sm:pl-24">
                        <div className="absolute left-[1.5rem] sm:left-[3rem] top-10 w-6 h-6 bg-white shadow-xl rounded-xl z-10 ring-4 ring-slate-950 transform -translate-x-1/2 flex items-center justify-center"> <div className="w-1.5 h-1.5 bg-pink-600 rounded-full"></div> </div>
                        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[1.5rem] p-6 sm:p-10 border border-white/5 shadow-xl hover:border-pink-500/30 transition-all">
                          <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-grow">
                                <div className="flex items-center space-x-4 mb-2"> 
                                  <input 
                                    type="time" 
                                    value={activity.time} 
                                    onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)}
                                    className="bg-black/40 text-white text-sm font-black px-3 py-1.5 rounded-lg border border-white/10 outline-none"
                                  />
                                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{activity.estimatedTime}</span> 
                                </div>
                                <h4 className="text-xl sm:text-3xl font-black text-white tracking-tight">{activity.location}</h4>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex flex-row space-x-2">
                                   <button onClick={() => handleReorderActivity(dIdx, aIdx, 'up')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all" disabled={aIdx === 0}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7"/></svg></button>
                                   <button onClick={() => handleReorderActivity(dIdx, aIdx, 'down')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all" disabled={aIdx === day.activities.length - 1}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"/></svg></button>
                                </div>
                                <span className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit">{activity.estimatedCost}</span>
                              </div>
                            </div>
                            <p className="text-slate-400 font-medium italic text-sm sm:text-base leading-relaxed">"{activity.description}"</p>
                            <div className="bg-black/60 p-5 sm:p-6 rounded-2xl text-xs sm:text-sm font-black italic text-slate-300 border border-white/5"> <span className="text-pink-500 uppercase tracking-widest text-[8px] block mb-2 opacity-60">Cultural Insight:</span> "{activity.culturalInsight}" </div>
                            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                               <button onClick={() => window.open(activity.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank')} className="text-emerald-400 font-black text-[9px] uppercase tracking-widest flex items-center space-x-2"> <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> <span>Maps</span> </button>
                               <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="text-slate-600 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Desktop Finalize button - follow itinerary */}
              <div className="hidden lg:flex pt-10 justify-center">
                 <button onClick={() => onFinalize(itinerary)} className="bg-white text-slate-950 px-20 py-8 rounded-full font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.4em] w-full">Finalize Manifest</button>
              </div>
            </div>

            {/* Finalize button - Mobile version positioned after days */}
            <div className="finalize-btn-container flex justify-center w-full lg:hidden">
              <button onClick={() => onFinalize(itinerary)} className="bg-white text-slate-950 px-16 py-6 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.4em] w-full max-w-sm">Finalize Manifest</button>
            </div>

            {/* COLUMN 2 - Right Sidebar - Reordered as requested: Discovery -> Vector -> Sanctuary */}
            <div className="sidebar-stack lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-32">
              
              {/* 1. Discovery Vault */}
              <div className="cockpit-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                   <h5 className="font-black text-pink-500 uppercase tracking-[0.3em] text-[10px]">Discovery Vault</h5>
                   <button onClick={() => fetchExtras(itinerary.destination)} className="text-pink-500/40 hover:text-pink-500"><svg className={`w-4 h-4 ${loadingExtras ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scroll pr-2">
                  {uniqueExtras.map((extra, idx) => {
                    const isExpanded = expandedExtraIdx === idx;
                    return (
                      <div key={idx} className={`bg-black/40 rounded-xl p-4 border transition-all cursor-pointer ${isExpanded ? 'border-pink-500/50 bg-black/60 shadow-xl' : 'border-white/5 hover:border-pink-500/30'}`} onClick={() => setExpandedExtraIdx(isExpanded ? null : idx)}>
                         <div className="flex justify-between items-start mb-1">
                            <h6 className="font-black text-white text-[11px] pr-2 uppercase tracking-tight leading-tight">{extra.location}</h6>
                            <span className="text-[8px] text-emerald-400 font-black uppercase whitespace-nowrap">{extra.estimatedCost}</span>
                         </div>
                         <p className={`text-[9px] text-slate-500 italic ${isExpanded ? '' : 'line-clamp-1'}`}>"{extra.description}"</p>
                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
                              <div className="bg-slate-900/60 p-3 rounded-lg text-[10px] italic text-slate-300 border border-white/5">
                                <span className="text-pink-500 uppercase tracking-widest text-[8px] block mb-1 opacity-60">Cultural Insight:</span>
                                "{extra.culturalInsight}"
                              </div>
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(extra.location)}`, '_blank'); }} className="flex-1 px-2 py-2 text-[8px] font-black uppercase bg-emerald-600/10 text-emerald-400 rounded-lg border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all">Show Map</button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {itinerary.days.map((_, i) => ( 
                                  <button key={i} onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} className="px-2 py-2 text-[7px] font-black uppercase text-slate-400 hover:bg-white hover:text-slate-950 rounded-lg border border-white/5 transition-all">Add: Day 0{i+1}</button> 
                                ))}
                              </div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Vector Analysis */}
              <div className="cockpit-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
                <h5 className="font-black text-orange-500 uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-2"> Vector Analysis </h5>
                <div className="space-y-4">
                  {itinerary.travelOptions.map((opt, i) => (
                    <div key={i} className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-orange-500/30 transition-all">
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500"> {renderTransportIcon(opt.mode)} </div>
                             <div>
                                <h6 className="text-xs font-black text-white uppercase">{opt.mode}</h6>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">{opt.operatorDetails}</p>
                             </div>
                          </div>
                          <span className="text-emerald-400 font-black text-xs">{opt.estimatedCost}</span>
                       </div>
                       <p className="text-[10px] text-slate-400 font-medium italic mt-3">"{opt.description}"</p>
                       <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/search?q=book+${opt.mode.toLowerCase()}+from+${itinerary.startingLocation}+to+${itinerary.destination.split(' (')[0]}`, '_blank'); }} className="w-full mt-4 py-2 bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all rounded-lg">Redirect to Booking</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Sanctuary Stays */}
              <div className="cockpit-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-black text-emerald-500 uppercase tracking-[0.3em] text-[10px]">Sanctuary Stays</h5>
                  <button onClick={handleRefreshHotels} className="text-emerald-500/40 hover:text-emerald-500"><svg className={`w-4 h-4 ${loadingHotels ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>
                <div className="space-y-4">
                  {itinerary.hotelRecommendations.map((hotel, i) => (
                    <div key={i} className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all">
                       <div className="flex justify-between items-start mb-2"> <h6 className="text-xs font-black text-white uppercase truncate pr-2">{hotel.name}</h6> <span className="text-[9px] text-emerald-400 font-black whitespace-nowrap">{hotel.estimatedPricePerNight}</span> </div>
                       <div className="flex items-center space-x-4 mb-4 mt-2">
                          <div className="flex flex-col"> <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Google Reviewed</span> <div className="flex items-center gap-0.5">{renderStars(hotel.googleRating)} <span className="text-[8px] text-slate-400 ml-1">({hotel.googleRating})</span></div> </div>
                          <div className="flex flex-col border-l border-white/5 pl-4"> <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Web Reviewed</span> <div className="flex items-center gap-0.5">{renderStars(hotel.webRating)} <span className="text-[8px] text-slate-400 ml-1">({hotel.reviewCount})</span></div> </div>
                       </div>
                       <p className="text-[10px] text-slate-400 font-medium italic line-clamp-2">"{hotel.description}"</p>
                       <button onClick={() => window.open(hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + itinerary.destination)}`, '_blank')} className="w-full mt-4 py-2 bg-emerald-600 rounded-lg text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg">Verify Site</button>
                    </div>
                  ))}
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
