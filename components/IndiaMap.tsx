
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

  const getSpotImage = (name: string, category: string) => {
    const cleanName = name.split(' (')[0].replace(/ /g, ',');
    return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800&q=80&sig=${encodeURIComponent(cleanName)}`;
  };

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
        <div className="flex flex-wrap justify-center gap-4 mb-24 sm:mb-32">
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

        {/* Dynamic Discovery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 md:gap-12">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-900/40 rounded-[2.5rem] aspect-[4/5] animate-pulse border border-white/5"></div>
            ))
          ) : (
            spots.map((spot, i) => (
              <div 
                key={i}
                onMouseEnter={() => fetchSummary(spot.name)}
                className="group bg-slate-900/40 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl hover:border-pink-500/30 transition-all duration-1000 flex flex-col h-full hover:-translate-y-6"
              >
                {/* Image Section */}
                <div className="relative h-72 sm:h-80 overflow-hidden">
                  <img 
                    src={getSpotImage(spot.name, spot.category)} 
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125 opacity-70 group-hover:opacity-100" 
                    alt={spot.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute top-8 right-8">
                    <a 
                      href={spot.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-white/5 backdrop-blur-md p-4 rounded-full text-white border border-white/20 hover:bg-pink-600 hover:border-pink-500 transition-all shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </a>
                  </div>
                  <div className="absolute bottom-8 left-8 flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-60">Maps Grounded</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-10 flex flex-col flex-grow">
                  <div className="mb-8">
                    <h4 className="text-3xl font-black text-white mb-3 tracking-tighter group-hover:text-pink-500 transition-colors duration-500">
                      {spot.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500/50">{spot.category} Segment</span>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-slate-400 text-base font-bold leading-relaxed italic mb-10">
                      {summaries[spot.name] || "Analyzing local specificities and verified heritage data streams..."}
                    </p>
                  </div>

                  <button 
                    onClick={() => onSelectDestination(spot.name)}
                    className="w-full py-6 bg-white/5 hover:bg-pink-600 text-white border border-white/10 hover:border-pink-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all duration-700"
                  >
                    Initiate Odyssey
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
