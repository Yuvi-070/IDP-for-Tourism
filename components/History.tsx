
import React, { useEffect, useState } from 'react';
import { getRecentItineraries, deleteItinerary, supabase } from '../services/supabaseClient';
import { Itinerary } from '../types';

interface HistoryProps {
  onSelectItinerary: (itinerary: Itinerary) => void;
  onEditItinerary?: (itinerary: Itinerary, dbId: string) => void;
  onMergeItineraries?: (itineraries: Itinerary[]) => void;
}

const History: React.FC<HistoryProps> = ({ onSelectItinerary, onEditItinerary, onMergeItineraries }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const data = await getRecentItineraries(user.id);
      setPlans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (!id) return;

    if (window.confirm("Permanently delete this plan? This cannot be undone.")) {
      // 1. Optimistic Update
      const originalPlans = [...plans];
      setPlans(prev => prev.filter(p => String(p.id) !== id));
      
      if (selectedIds.has(id)) {
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }

      // 2. Server Request
      try {
        const { success, error } = await deleteItinerary(id);
        
        if (!success) {
          console.error("Delete failed:", error);
          alert(`Failed to delete plan. Error: ${error?.message}`);
          // Revert UI on failure
          setPlans(originalPlans);
        }
      } catch (err) {
        console.error(err);
        setPlans(originalPlans);
      }
    }
  };

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  const handleMerge = () => {
    if (!onMergeItineraries) return;
    const selectedPlans = plans.filter(p => selectedIds.has(String(p.id))).map(p => p.data as Itinerary);
    if (selectedPlans.length < 2) {
      alert("Please select at least 2 itineraries to merge.");
      return;
    }
    onMergeItineraries(selectedPlans);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 font-black text-sm uppercase tracking-widest">Retrieving Neural Archives...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter">My Recent <span className="textile-gradient">Plans</span></h2>
            <p className="text-slate-400 font-bold text-lg italic">Your last synthesized expeditions from the user_history.</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={toggleSelectionMode}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border transition-all ${selectionMode ? 'bg-pink-600 text-white border-pink-500' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}
             >
                {selectionMode ? 'Cancel Selection' : 'Select to Merge'}
             </button>
             {selectionMode && selectedIds.size >= 2 && (
               <button 
                 onClick={handleMerge}
                 className="bg-white text-slate-950 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg animate-in fade-in zoom-in"
               >
                 Merge {selectedIds.size} Plans
               </button>
             )}
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 p-20 text-center">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">No Recent History</h3>
            <p className="text-slate-500 font-medium">Generate your first itinerary to populate this matrix.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((record) => {
              const itinerary: Itinerary = record.data;
              const recordId = String(record.id); 
              const isSelected = selectedIds.has(recordId);
              const isMerged = itinerary.isMerged;

              return (
                <div 
                  key={recordId}
                  onClick={selectionMode ? (e) => toggleSelection(e, recordId) : undefined}
                  className={`group bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 text-left border hover:bg-slate-900/60 transition-all duration-500 flex flex-col h-full relative overflow-hidden ${
                    isSelected ? 'border-pink-500 ring-4 ring-pink-500/20' : isMerged ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/5 hover:border-pink-500/30'
                  } ${selectionMode ? 'cursor-pointer' : ''}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] transition-colors pointer-events-none ${isMerged ? 'bg-purple-500/20' : 'bg-pink-500/5 group-hover:bg-pink-500/10'}`}></div>
                  
                  {selectionMode && (
                    <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-pink-500 border-pink-500' : 'border-slate-500'}`}>
                       {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  )}

                  {!selectionMode && (
                     <button 
                       onClick={(e) => handleDelete(e, recordId)}
                       className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all z-20 cursor-pointer bg-slate-900/50 hover:shadow-lg border border-transparent hover:border-red-500/20"
                       title="Delete Plan"
                       type="button"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  )}
                  
                  <div className="relative z-10 flex-grow cursor-pointer" onClick={() => !selectionMode && onSelectItinerary(itinerary)}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2">
                        <span className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/5">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                        {isMerged && (
                          <span className="bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-purple-500/20">
                            Merged
                          </span>
                        )}
                      </div>
                      <span className="text-pink-500 font-black text-xs uppercase tracking-widest mr-8">{itinerary.duration} Days</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-pink-400 transition-colors">{itinerary.destination}</h3>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Start: {itinerary.startingLocation}</div>
                    
                    <div className="flex flex-wrap gap-2">
                       {itinerary.theme.split(',').slice(0, 2).map((t, i) => (
                         <span key={i} className="text-[9px] font-black uppercase bg-slate-950/50 text-slate-400 px-2 py-1 rounded border border-white/5">{t.trim()}</span>
                       ))}
                       {itinerary.theme.split(',').length > 2 && <span className="text-[9px] font-black uppercase bg-slate-950/50 text-slate-400 px-2 py-1 rounded border border-white/5">+{itinerary.theme.split(',').length - 2}</span>}
                    </div>
                  </div>

                  {!selectionMode && (
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10 w-full gap-2">
                      <button 
                        onClick={() => onEditItinerary && onEditItinerary(itinerary, recordId)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all"
                      >
                        Modify Plan
                      </button>
                      <button 
                        onClick={() => onSelectItinerary(itinerary)}
                        className="flex-1 bg-pink-600/10 hover:bg-pink-600/20 text-pink-500 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-pink-500/10 transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
