
import React, { useState, useEffect } from 'react';
import { getIconicHotspots, getPlaceGrounding } from '../services/geminiService';

interface IndiaMapProps {
  onSelectDestination: (dest: string) => void;
}

interface DiscoverySpot {
  name: string;
  uri: string;
  category: string;
  summary?: string;
}

const IndiaMap: React.FC<IndiaMapProps> = ({ onSelectDestination }) => {
  const [spots, setSpots] = useState<DiscoverySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLens, setActiveLens] = useState('trending');
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const lenses = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'beach', label: 'Beaches', icon: '🏖️' },
    { id: 'mountain', label: 'Mountains', icon: '🏔️' },
    { id: 'temple', label: 'Temples', icon: '🪔' },
    { id: 'lake', label: 'Lakes', icon: '🛶' },
    { id: 'wildlife', label: 'Wildlife', icon: '🐅' }
  ];

  const fetchDiscoveryData = async (lensId: string) => {
    setLoading(true);
    try {
      const discoveredSpots = await getIconicHotspots(lensId);
      const validSpots = discoveredSpots.filter(s => s.name && s.name.length > 2);
      setSpots(validSpots.slice(0, 12));
    } catch (e) {
      console.error("Failed to fetch discovery data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (name: string) => {
    if (summaries[name]) return;
    try {
      const data = await getPlaceGrounding(`In 12 words: Why is ${name} a must-visit cultural spot?`);
      setSummaries(prev => ({ ...prev, [name]: data.text }));
    } catch (e) {
      // Fail silently
    }
  };

  useEffect(() => {
    fetchDiscoveryData(activeLens);
  }, [activeLens]);

  return (
    <section className="py-24 sm:py-48 bg-slate-950 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-32">
          <div className="inline-flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full mb-8 border border-white/10 shadow-xl">
            <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Grounded Intelligence Node</span>
          </div>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
            Discovery <span className="textile-gradient">Engine</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg sm:text-2xl max-w-3xl mx-auto leading-relaxed italic">
            Real-time validation of India's multi-layered topography. Filter by archetypal lenses.
          </p>
        </div>

        {/* Intelligence Filters (Lenses) */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 sm:mb-24">
          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-700 flex items-center space-x-4 border-2 ${
                activeLens === lens.id 
                ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-110' 
                : 'bg-white/5 text-slate-500 border-white/10 hover:border-pink-500/50 hover:text-slate-300'
              }`}
            >
              <span className="text-xl">{lens.icon}</span>
              <span>{lens.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Discovery Grid - Text Focused */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-900/40 rounded-[2rem] h-64 animate-pulse border border-white/5"></div>
            ))
          ) : (
            spots.map((spot, i) => (
              <div 
                key={i}
                onMouseEnter={() => fetchSummary(spot.name)}
                className="group bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl hover:border-pink-500/30 transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden"
              >
                {/* Subtle Glow background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[60px] pointer-events-none group-hover:bg-pink-500/10 transition-colors"></div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500/60 bg-pink-500/5 px-3 py-1 rounded-lg border border-pink-500/10">
                      {spot.category}
                    </span>
                    <button 
                      onClick={() => window.open(spot.uri, '_blank')}
                      className="text-slate-500 hover:text-pink-500 transition-colors p-1"
                      title="Open in Maps"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tighter group-hover:text-pink-500 transition-colors duration-300 leading-tight">
                      {spot.name}
                    </h4>
                  </div>
                  
                  <div className="min-h-[60px]">
                    <p className="text-slate-400 text-sm font-bold leading-relaxed italic">
                      {summaries[spot.name] || (
                        <span className="opacity-30">Hover to synthesize cultural insights...</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                   <button 
                     onClick={() => window.open(spot.uri, '_blank')}
                     className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center space-x-2 transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                     </svg>
                     <span>Explore Map</span>
                   </button>
                   
                   <button 
                    onClick={() => onSelectDestination(spot.name)}
                    className="bg-white/5 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-300 border border-white/5"
                   >
                    Select Node
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default IndiaMap;
