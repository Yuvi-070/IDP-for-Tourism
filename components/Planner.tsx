
import React, { useState, useEffect } from 'react';
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
      setDestination(initialDestination);
    }
  }, [initialDestination]);

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
        data = await generateTravelItinerary(destination, duration, selectedThemes);
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
      alert("Something went wrong. Please try again.");
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

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  const handleAddFromExtras = (extra: Activity, targetDayIdx: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    const newActivity = { 
      ...extra, 
      time: extra.time || "10:00"
    };
    newItinerary.days[targetDayIdx].activities.push(newActivity);
    setItinerary(newItinerary);
    setExtraSuggestions(prev => prev.filter(e => e.location !== extra.location));
    setExpandedExtraIdx(null);
  };

  const handleMoveToDay = (currentDayIdx: number, actIdx: number, targetDayIdx: number) => {
    if (!itinerary || targetDayIdx === currentDayIdx) return;
    const newItinerary = { ...itinerary };
    const [activity] = newItinerary.days[currentDayIdx].activities.splice(actIdx, 1);
    newItinerary.days[targetDayIdx].activities.push(activity);
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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea { overflow: hidden !important; resize: none !important; }
        .extra-expand-transition {
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }
      `}</style>
      
      {/* Search & Configuration Card */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] shadow-2xl p-6 sm:p-10 md:p-16 lg:p-20 mb-12 md:mb-20 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 sm:w-2.5 h-full saffron-gradient opacity-80"></div>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 md:mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-[1.1]">AI Heritage <span className="text-orange-500">Curator</span></h2>
            <p className="text-slate-500 font-bold text-sm sm:text-lg md:text-xl leading-relaxed">Synthesizing centuries of culture into your personalized expedition.</p>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-2xl md:rounded-full self-start shadow-inner border border-slate-200/50">
            <button onClick={() => setMode('form')} className={`px-4 sm:px-10 py-2.5 sm:py-4 rounded-xl md:rounded-full text-xs sm:text-sm font-black transition-all duration-300 ${mode === 'form' ? 'bg-white text-orange-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Visual Builder</button>
            <button onClick={() => setMode('prompt')} className={`px-4 sm:px-10 py-2.5 sm:py-4 rounded-xl md:rounded-full text-xs sm:text-sm font-black transition-all duration-300 ${mode === 'prompt' ? 'bg-white text-orange-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Smart Prompt</button>
          </div>
        </div>

        {mode === 'form' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Primary Hub</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-[2rem] px-4 sm:px-8 py-3.5 sm:py-5 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-slate-800 text-sm sm:text-lg lg:text-xl shadow-sm appearance-none cursor-pointer">
                {INDIAN_DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Duration (Days)</label>
              <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-[2rem] px-4 sm:px-8 py-3.5 sm:py-5 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-slate-800 text-sm sm:text-lg lg:text-xl shadow-sm" />
            </div>
            <div className="md:col-span-2 space-y-4 sm:space-y-6 mt-4">
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Expedition Archetypes</label>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {THEMES.map(theme => (
                  <button 
                    key={theme} 
                    onClick={() => toggleTheme(theme)}
                    className={`px-4 sm:px-6 py-2 sm:py-3.5 rounded-lg sm:rounded-2xl text-[10px] sm:text-xs lg:text-sm font-black transition-all duration-300 border-2 ${selectedThemes.includes(theme) ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200'}`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 ml-1">Natural Language Protocol</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Unfold your travel vision... e.g. A 5-day spiritual immersion in Rishikesh." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-[2.5rem] px-4 sm:px-8 py-6 sm:py-10 h-32 sm:h-48 lg:h-64 outline-none focus:ring-4 focus:ring-orange-500/10 font-medium text-slate-700 leading-relaxed shadow-inner text-sm sm:text-lg lg:text-xl" />
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading} className="w-full mt-8 sm:mt-16 py-4 sm:py-8 rounded-xl sm:rounded-[2.5rem] font-black text-white text-base sm:text-2xl transition-all duration-500 saffron-gradient hover:opacity-95 disabled:opacity-50 flex items-center justify-center shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] sm:tracking-[0.4em]">
          {loading ? (
             <span className="flex items-center space-x-3 sm:space-x-6">
               <svg className="animate-spin h-5 w-5 sm:h-8 sm:w-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="text-xs sm:text-xl">Analyzing Context...</span>
             </span>
          ) : "Initialize Expedition"}
        </button>
      </div>

      {itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-20 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-12 md:space-y-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-slate-100 pb-8 sm:pb-12">
              <div>
                <span className="text-orange-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[10px] sm:text-xs mb-2 sm:mb-4 block">Operational Hub</span>
                <h3 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">{itinerary.destination}</h3>
                <div className="flex items-center space-x-4 sm:space-x-8 mt-6 sm:mt-10">
                  <div className="flex items-center space-x-2 sm:space-x-4 bg-orange-50 px-4 sm:px-8 py-2 sm:py-3.5 rounded-full border border-orange-100 shadow-sm">
                    <span className="text-orange-600 font-black text-[10px] sm:text-sm uppercase">{itinerary.duration} Days</span>
                  </div>
                  <span className="text-slate-300 h-6 sm:h-10 w-px bg-slate-200"></span>
                  <p className="text-slate-400 font-bold text-[10px] sm:text-sm lg:text-base tracking-tight italic">Validated Logical Flow</p>
                </div>
              </div>
            </div>

            {itinerary.days.map((day, dIdx) => (
              <div key={dIdx} className="bg-white rounded-[1.5rem] sm:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-10 lg:p-16 shadow-xl border border-slate-50 relative overflow-hidden group/day">
                <div className="absolute top-0 right-0 w-24 sm:w-48 lg:w-64 h-24 sm:h-48 lg:h-64 bg-slate-50 rounded-bl-[2rem] sm:rounded-bl-[5rem] lg:rounded-bl-[8rem] -z-10 group-hover/day:bg-orange-50/50 transition-colors duration-1000"></div>
                <div className="flex items-center space-x-4 sm:space-x-8 mb-8 sm:mb-16">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">Phase</span>
                    <span className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 leading-none">0{day.day}</span>
                  </div>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                
                <div className="space-y-8 md:space-y-12">
                  {day.activities.map((activity, aIdx) => (
                    <div key={aIdx} className="bg-slate-50/40 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 border border-slate-100 hover:bg-white transition-all duration-500 relative shadow-sm hover:shadow-2xl">
                      <div className="flex flex-col gap-6 sm:gap-10">
                        <div className="flex-grow space-y-6 w-full">
                           <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex flex-col min-w-[100px]">
                                  <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Arrival:</span>
                                  <input 
                                    type="time"
                                    value={activity.time.includes(':') ? (activity.time.match(/\d{2}:\d{2}/)?.[0] || "10:00") : "10:00"} 
                                    onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)} 
                                    className="bg-slate-900 text-white text-xs sm:text-sm font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl outline-none shadow-lg cursor-pointer w-full sm:w-auto" 
                                  />
                                </div>
                                <input value={activity.location} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'location', e.target.value)} className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 outline-none w-full border-b-2 border-transparent focus:border-orange-500 bg-transparent transition-all tracking-tighter py-1" />
                             </div>
                           </div>

                           <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
                              <div className="flex items-center space-x-2 sm:space-x-4 bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenure:</span>
                                <input value={activity.estimatedTime} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'estimatedTime', e.target.value)} className="text-orange-600 font-black text-[10px] sm:text-sm outline-none w-16 sm:w-24 bg-transparent" />
                              </div>
                              <div className="flex items-center space-x-2 sm:space-x-4 bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital:</span>
                                <input value={activity.estimatedCost} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'estimatedCost', e.target.value)} className="text-green-600 font-black text-[10px] sm:text-sm outline-none w-16 sm:w-24 bg-transparent" />
                              </div>
                           </div>

                           <div className="space-y-4 pt-2">
                              <textarea rows={1} value={activity.description} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'description', e.target.value)} className="text-slate-500 text-sm sm:text-base lg:text-lg w-full outline-none bg-transparent leading-relaxed no-scrollbar font-medium" />
                              <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-[2rem] border border-slate-50 shadow-inner group/insight relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 saffron-gradient opacity-[0.03] rounded-bl-full"></div>
                                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-5 text-orange-500">
                                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 18.343a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Culture Insight</span>
                                </div>
                                <textarea rows={1} value={activity.culturalInsight} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'culturalInsight', e.target.value)} className="text-sm sm:text-lg lg:text-xl text-slate-800 italic w-full outline-none bg-transparent border-none leading-relaxed no-scrollbar font-bold tracking-tight" />
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-row sm:justify-end gap-3 sm:gap-4 mt-auto">
                           <div className="relative group/menu flex-grow sm:flex-grow-0">
                              <button className="w-full flex items-center justify-center space-x-2 bg-white text-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-wider px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-md">
                                <span>Move</span>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <div className="absolute top-full right-0 mt-3 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-50 py-3 sm:py-4 w-32 sm:w-48 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform translate-y-2 group-hover/menu:translate-y-0 z-50">
                                {itinerary.days.map((_, i) => (
                                  <button key={i} onClick={() => handleMoveToDay(dIdx, aIdx, i)} className={`w-full text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase hover:bg-orange-50 hover:text-orange-600 transition-colors ${i === dIdx ? 'text-orange-500' : 'text-slate-400'}`}>Phase 0{i+1}</button>
                                ))}
                              </div>
                           </div>
                           <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="flex items-center justify-center bg-white text-red-400 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-md hover:bg-red-50 hover:text-red-600 transition-all duration-300">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-8 pb-12 sm:pb-20">
               <button onClick={() => onFinalize(itinerary)} className="w-full sm:w-auto bg-slate-900 text-white px-8 sm:px-24 py-4 sm:py-8 rounded-full font-black text-lg sm:text-2xl lg:text-3xl shadow-2xl hover:bg-orange-600 hover:-translate-y-1.5 transition-all duration-500 active:scale-95 uppercase tracking-widest sm:tracking-[0.4em]">Finalize Journey</button>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] lg:rounded-[4rem] p-6 sm:p-10 border border-slate-100 shadow-xl h-full lg:max-h-[calc(100vh-140px)] flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-orange-50/40 rounded-full blur-[80px] -z-10"></div>
              
              <h5 className="font-black text-slate-900 mb-6 sm:mb-10 uppercase tracking-[0.3em] text-[10px] sm:text-xs flex items-center justify-between flex-shrink-0">
                <span>Discovery Library</span>
                <button onClick={() => fetchExtras(itinerary.destination)} className="text-slate-300 hover:text-orange-500 transition-all p-2 hover:bg-orange-50 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </h5>
              
              <div className="space-y-4 sm:space-y-6 lg:overflow-y-auto pr-1 no-scrollbar flex-grow pb-8">
                {loadingExtras ? (
                  <div className="space-y-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-24 sm:h-32 bg-slate-50/80 rounded-2xl animate-pulse"></div>)}
                  </div>
                ) : (
                  extraSuggestions.map((extra, idx) => {
                    const isExpanded = expandedExtraIdx === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`bg-slate-50/60 rounded-xl sm:rounded-3xl overflow-hidden transition-all duration-500 border-2 border-transparent hover:border-orange-200 cursor-pointer ${isExpanded ? 'shadow-2xl bg-white border-orange-200' : 'hover:shadow-lg'}`}
                        onClick={() => setExpandedExtraIdx(isExpanded ? null : idx)}
                      >
                        <div className={`p-3 sm:p-6 flex items-center justify-between group/summary ${isExpanded ? 'bg-orange-50/20' : ''}`}>
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-sm">
                               <img src={`https://picsum.photos/seed/${extra.location.replace(/\s/g, '')}/100/100`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="max-w-[140px] sm:max-w-[200px]">
                              <h6 className="font-black text-slate-900 text-xs sm:text-base group-hover/summary:text-orange-600 transition-colors leading-tight mb-0.5 sm:mb-1 truncate">{extra.location}</h6>
                              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{extra.estimatedTime}</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0 ${isExpanded ? 'bg-orange-600 text-white rotate-45' : 'bg-white text-slate-300 border border-slate-100 group-hover/summary:bg-orange-600 group-hover/summary:text-white'}`}>
                            <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                          </div>
                        </div>

                        <div className={`extra-expand-transition overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 border-t border-slate-100">
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bold">{extra.description}</p>
                              <div className="bg-orange-50/80 p-3 sm:p-5 rounded-lg sm:rounded-2xl italic text-[10px] sm:text-sm text-orange-900 border border-orange-100">
                                 "{extra.culturalInsight}"
                              </div>
                              <div className="flex gap-2 sm:gap-3">
                                <span className="text-[8px] sm:text-[9px] font-black bg-slate-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg uppercase">{extra.estimatedTime}</span>
                                <span className="text-[8px] sm:text-[9px] font-black bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg uppercase">{extra.estimatedCost}</span>
                              </div>
                              
                              <div className="pt-4 sm:pt-6 border-t border-slate-50">
                                 <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 ml-1">Add to phase:</label>
                                 <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {itinerary.days.map((_, i) => (
                                      <button 
                                        key={i} 
                                        onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} 
                                        className="text-left px-3 sm:px-5 py-2 sm:py-3.5 text-[9px] sm:text-xs font-black uppercase text-slate-600 hover:bg-orange-600 hover:text-white rounded-lg sm:rounded-2xl transition-all duration-300 border border-slate-100 hover:border-orange-600 flex items-center justify-between"
                                      >
                                        <span>Phase 0{i+1}</span>
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
        </div>
      )}
    </div>
  );
};

export default Planner;
