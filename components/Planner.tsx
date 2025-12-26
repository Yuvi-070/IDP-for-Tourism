
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea { overflow: hidden !important; resize: none !important; }
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
      
      <div className="bg-white rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.12)] p-12 md:p-20 mb-20 border border-slate-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-3.5 h-full saffron-gradient opacity-80"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-12">
          <div className="max-w-xl">
            <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-[0.9]">AI Heritage <span className="text-orange-500">Curator</span></h2>
            <p className="text-slate-400 font-bold text-xl leading-relaxed">Synthesizing centuries of Indian culture into your personalized expedition.</p>
          </div>
          <div className="flex p-2.5 bg-slate-100 rounded-[2.5rem] self-start shadow-inner border border-slate-200/50">
            <button onClick={() => setMode('form')} className={`px-14 py-5 rounded-[2rem] text-sm font-black transition-all duration-700 ${mode === 'form' ? 'bg-white text-orange-600 shadow-[0_12px_24px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-600'}`}>Visual Builder</button>
            <button onClick={() => setMode('prompt')} className={`px-14 py-5 rounded-[2rem] text-sm font-black transition-all duration-700 ${mode === 'prompt' ? 'bg-white text-orange-600 shadow-[0_12px_24px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-600'}`}>Smart Prompt</button>
          </div>
        </div>

        {mode === 'form' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-top-12 duration-1000">
            <div className="space-y-8">
              <label className="block text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 ml-4">Select Principal Hub</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-[3.5rem] px-12 py-8 outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-200 transition-all font-black text-slate-800 text-2xl shadow-sm appearance-none cursor-pointer">
                {INDIAN_DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-8">
              <label className="block text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 ml-4">Expedition Tenure (Days)</label>
              <input type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-[3.5rem] px-12 py-8 outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-200 transition-all font-black text-slate-800 text-2xl shadow-sm" />
            </div>
            <div className="md:col-span-2 space-y-10 mt-6">
              <label className="block text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 ml-4">Expedition Archetypes</label>
              <div className="flex flex-wrap gap-5">
                {THEMES.map(theme => (
                  <button 
                    key={theme} 
                    onClick={() => toggleTheme(theme)}
                    className={`px-10 py-5 rounded-[2.5rem] text-sm font-black transition-all duration-700 border-2 ${selectedThemes.includes(theme) ? 'bg-orange-500 text-white border-orange-500 shadow-[0_24px_48px_-12px_rgba(255,153,51,0.6)]' : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200 hover:bg-orange-50/50'}`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
            <label className="block text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 mb-8 ml-4">Natural Language Protocol</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Unfold your travel vision... e.g. A 5-day spiritual immersion in Rishikesh focusing on ancient ashrams, Ganga Aarti, and local satvik cuisine." className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-[4.5rem] px-14 py-12 h-72 outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-200 font-medium text-slate-700 leading-relaxed shadow-inner text-2xl" />
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading} className="w-full mt-20 py-10 rounded-[4.5rem] font-black text-white text-3xl transition-all duration-1000 saffron-gradient hover:opacity-95 disabled:opacity-50 flex items-center justify-center shadow-[0_48px_96px_-24px_rgba(255,153,51,0.6)] active:scale-[0.98] uppercase tracking-[0.4em]">
          {loading ? (
             <span className="flex items-center space-x-8">
               <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span>Analyzing Historical Patterns...</span>
             </span>
          ) : "Initialize Expedition"}
        </button>
      </div>

      {itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-8 space-y-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-slate-100 pb-20">
              <div>
                <span className="text-orange-500 font-black uppercase tracking-[0.8em] text-[12px] mb-8 block">Operational Hub</span>
                <h3 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{itinerary.destination}</h3>
                <div className="flex items-center space-x-12 mt-12">
                  <div className="flex items-center space-x-6 bg-orange-50 px-10 py-4 rounded-full border border-orange-100 shadow-sm">
                    <span className="text-orange-600 font-black text-base uppercase tracking-[0.2em]">{itinerary.duration} Days in depth</span>
                  </div>
                  <span className="text-slate-300 h-12 w-px bg-slate-200"></span>
                  <p className="text-slate-400 font-bold text-lg tracking-tight italic">Logical AI timeline — user customization enabled.</p>
                </div>
              </div>
            </div>

            {itinerary.days.map((day, dIdx) => (
              <div key={dIdx} className="bg-white rounded-[6rem] p-20 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)] border-2 border-white relative overflow-hidden group/day transition-all duration-1000">
                <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-bl-[10rem] -z-10 group-hover/day:bg-orange-50/50 transition-colors duration-1000"></div>
                <div className="flex items-center space-x-12 mb-20">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black text-slate-300 uppercase tracking-[0.5em]">Phase</span>
                    <span className="text-9xl font-black text-slate-900 leading-none">0{day.day}</span>
                  </div>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                
                <div className="space-y-16">
                  {day.activities.map((activity, aIdx) => (
                    <div key={aIdx} className="bg-slate-50/40 rounded-[4.5rem] p-16 border-2 border-slate-100/50 group/item hover:border-orange-200 hover:bg-white transition-all duration-1000 relative shadow-sm hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)]">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-16">
                        <div className="flex-grow space-y-10 w-full">
                           <div className="flex flex-col md:flex-row md:items-center gap-10">
                             <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-3">Arrival:</span>
                                <input 
                                  type="time"
                                  value={activity.time.includes(':') ? (activity.time.match(/\d{2}:\d{2}/)?.[0] || "10:00") : "10:00"} 
                                  onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)} 
                                  className="bg-slate-900 text-white text-lg font-black px-10 py-5 rounded-[2rem] outline-none shadow-2xl cursor-pointer hover:bg-orange-600 transition-all duration-700" 
                                />
                             </div>
                             <input value={activity.location} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'location', e.target.value)} className="text-5xl font-black text-slate-900 outline-none w-full border-b-4 border-transparent focus:border-orange-500 bg-transparent transition-all tracking-tighter" />
                           </div>

                           <div className="flex flex-wrap gap-10 items-center">
                              <div className="flex items-center space-x-6 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tenure:</span>
                                <input value={activity.estimatedTime} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'estimatedTime', e.target.value)} className="text-orange-600 font-black text-base outline-none w-32 bg-transparent" />
                              </div>
                              <div className="flex items-center space-x-6 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Est. Capital:</span>
                                <input value={activity.estimatedCost} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'estimatedCost', e.target.value)} className="text-green-600 font-black text-base outline-none w-32 bg-transparent" />
                              </div>
                           </div>

                           <div className="space-y-10 pt-8">
                              <textarea rows={2} value={activity.description} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'description', e.target.value)} className="text-slate-500 text-xl w-full outline-none bg-transparent leading-relaxed no-scrollbar font-medium" />
                              <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-50 shadow-inner group/insight relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 saffron-gradient opacity-[0.05] rounded-bl-full"></div>
                                <div className="flex items-center space-x-5 mb-8 text-orange-500">
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 18.343a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
                                  <span className="text-[12px] font-black uppercase tracking-[0.4em]">Anthropological Insight</span>
                                </div>
                                <textarea rows={2} value={activity.culturalInsight} onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'culturalInsight', e.target.value)} className="text-2xl text-slate-800 italic w-full outline-none bg-transparent border-none leading-relaxed no-scrollbar font-bold tracking-tight" />
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col gap-8 flex-shrink-0 pt-20">
                           <div className="relative group/menu">
                              <button className="flex items-center justify-center space-x-5 bg-white text-slate-900 font-black text-[12px] uppercase tracking-[0.2em] px-10 py-6 rounded-[2rem] border-2 border-slate-100 shadow-2xl hover:bg-slate-50 transition-all duration-700">
                                <span>Relocate</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <div className="absolute top-full right-0 mt-6 bg-white rounded-[3rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] border border-slate-50 py-8 w-56 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-1000 transform translate-y-6 group-hover/menu:translate-y-0 z-50">
                                {itinerary.days.map((_, i) => (
                                  <button key={i} onClick={() => handleMoveToDay(dIdx, aIdx, i)} className={`w-full text-left px-10 py-5 text-[14px] font-black uppercase hover:bg-orange-50 hover:text-orange-600 transition-colors ${i === dIdx ? 'text-orange-500' : 'text-slate-400'}`}>Phase 0{i+1}</button>
                                ))}
                              </div>
                           </div>
                           <button onClick={() => handleRemoveActivity(dIdx, aIdx)} className="flex items-center justify-center bg-white text-red-400 px-10 py-6 rounded-[2rem] border-2 border-slate-100 shadow-2xl hover:bg-red-50 hover:text-red-600 transition-all duration-1000 group/trash">
                              <svg className="w-8 h-8 transition-transform group-hover/trash:scale-[1.3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-10 pb-20">
               <button onClick={() => onFinalize(itinerary)} className="bg-slate-900 text-white px-32 py-12 rounded-[5rem] font-black text-4xl shadow-[0_64px_128px_-32px_rgba(0,0,0,0.4)] hover:bg-orange-600 hover:-translate-y-4 transition-all duration-1000 active:scale-95 uppercase tracking-[0.5em]">Finalize Journey</button>
            </div>
          </div>

          {/* Discovery Panel - Increased height & better visibility */}
          <div className="lg:col-span-4 sticky top-28 h-[calc(100vh-140px)]">
            <div className="bg-white rounded-[5rem] p-14 border-2 border-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] h-full flex flex-col overflow-hidden relative group/extras">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-[120px] -z-10 opacity-70"></div>
              
              <h5 className="font-black text-slate-900 mb-14 uppercase tracking-[0.5em] text-xs flex items-center justify-between flex-shrink-0">
                <span>Expedition Library</span>
                <button onClick={() => fetchExtras(itinerary.destination)} className="text-slate-300 hover:text-orange-500 transition-all p-4 hover:bg-orange-50 rounded-full group/refresh">
                  <svg className="w-8 h-8 group-hover/refresh:rotate-180 transition-transform duration-1000" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </h5>
              
              <div className="space-y-10 overflow-y-auto pr-8 no-scrollbar flex-grow pb-32 scroll-smooth">
                {loadingExtras ? (
                  <div className="space-y-12">
                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-40 bg-slate-50/80 rounded-[4rem] animate-pulse"></div>)}
                  </div>
                ) : (
                  extraSuggestions.map((extra, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-slate-50/60 rounded-[4rem] overflow-hidden transition-all duration-1000 border-2 border-transparent hover:border-orange-200 cursor-pointer ${expandedExtraIdx === idx ? 'shadow-2xl bg-white' : 'hover:shadow-2xl hover:bg-white'}`}
                      onClick={() => setExpandedExtraIdx(expandedExtraIdx === idx ? null : idx)}
                    >
                      {expandedExtraIdx === idx ? (
                        <div className="animate-in fade-in zoom-in-95 duration-1000">
                           <div className="h-80 w-full relative group/img overflow-hidden">
                              <img 
                                src={`https://picsum.photos/seed/${extra.location.replace(/\s/g, '')}/1200/900`} 
                                className="w-full h-full object-cover brightness-[0.4] transition-transform duration-[4000ms] group-hover/img:scale-[1.3]" 
                                alt={extra.location} 
                                draggable="false"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                                 <h6 className="text-white font-black text-4xl text-center leading-[1] drop-shadow-2xl uppercase tracking-tighter mb-6">{extra.location}</h6>
                                 <div className="h-2 w-28 saffron-gradient rounded-full"></div>
                              </div>
                           </div>
                           <div className="p-12 space-y-10">
                              <p className="text-lg text-slate-600 leading-relaxed font-bold tracking-tight">{extra.description}</p>
                              <div className="bg-orange-50/80 backdrop-blur-md p-10 rounded-[3rem] italic text-base text-orange-900 border-2 border-orange-100 shadow-inner leading-relaxed font-semibold">
                                 <span className="font-black uppercase tracking-[0.4em] text-[11px] block mb-6 opacity-60">Insider Heritage</span>
                                 "{extra.culturalInsight}"
                              </div>
                              <div className="flex gap-5">
                                <span className="text-[12px] font-black bg-slate-900 text-white px-7 py-3 rounded-2xl uppercase shadow-2xl shadow-slate-900/40">{extra.estimatedTime}</span>
                                <span className="text-[12px] font-black bg-green-100 text-green-700 px-7 py-3 rounded-2xl uppercase tracking-wider">{extra.estimatedCost}</span>
                              </div>
                              
                              <div className="pt-10 border-t-2 border-slate-50">
                                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-3">Assign Location to phase:</label>
                                 <div className="grid grid-cols-1 gap-4">
                                    {itinerary.days.map((_, i) => (
                                      <button 
                                        key={i} 
                                        onClick={(e) => { e.stopPropagation(); handleAddFromExtras(extra, i); }} 
                                        className="w-full text-left px-10 py-6 text-sm font-black uppercase text-slate-600 hover:bg-orange-600 hover:text-white rounded-[2rem] transition-all duration-700 border-2 border-slate-100 hover:border-orange-600 flex items-center justify-between group/addbtn shadow-sm"
                                      >
                                        <span>Phase 0{i+1}</span>
                                        <svg className="w-6 h-6 opacity-0 group-hover/addbtn:opacity-100 transition-all duration-700 translate-x-6 group-hover/addbtn:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                      </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="p-10 flex items-center justify-between group/summary">
                           <div className="flex items-center space-x-8">
                             <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden bg-slate-200 flex-shrink-0 shadow-2xl group-hover/summary:shadow-orange-500/40 transition-all duration-1000">
                                <img src={`https://picsum.photos/seed/${extra.location.replace(/\s/g, '')}/300/300`} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/summary:scale-[1.4]" alt="" />
                             </div>
                             <div>
                               <h6 className="font-black text-slate-900 text-xl group-hover/summary:text-orange-600 transition-colors duration-700 leading-tight mb-3 tracking-tighter">{extra.location}</h6>
                               <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{extra.estimatedTime} immersion</span>
                             </div>
                           </div>
                           <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-300 border-2 border-slate-100 group-hover/summary:bg-orange-600 group-hover/summary:text-white group-hover/summary:border-orange-600 transition-all duration-700 shadow-2xl scale-90 group-hover/summary:scale-110">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                           </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-14 bg-gradient-to-t from-white via-white/98 to-transparent pt-40">
                 <button onClick={() => onFinalize(itinerary)} className="w-full py-8 saffron-gradient text-slate-900 font-black rounded-[3.5rem] transition-all duration-1000 hover:-translate-y-2 active:scale-95 shadow-[0_48px_96px_-16px_rgba(255,153,51,0.6)] uppercase tracking-[0.5em] text-sm border-2 border-white">
                    Confirm Itinerary
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
