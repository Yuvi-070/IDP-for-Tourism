
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
  const [featuredIdx, setFeaturedIdx] = useState(0);

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
    setFeaturedIdx(0);
    try {
      const discoveredSpots = await getIconicHotspots(lensId);
      setSpots(discoveredSpots.slice(0, 12));
    } catch (e) {
      console.error("Failed to fetch discovery data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData(activeLens);
  }, [activeLens]);

  const handleSpotHover = async (index: number) => {
    setFeaturedIdx(index);
    const spotName = spots[index].name;
    if (summaries[spotName]) return;
    try {
      const data = await getPlaceGrounding(`In 10 words: What makes ${spotName} a must-visit?`);
      setSummaries(prev => ({ ...prev, [spotName]: data.text }));
    } catch (e) {
      // Fail silently
    }
  };

  const getSpotImage = (name: string) => {
    return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1200&q=80&sig=${encodeURIComponent(name)}`;
    // Note: In a real app, you'd fetch specific images. Using Unsplash source or search is a good proxy.
    // For specific themes we can vary the fallback.
  };

  const featuredSpot = spots[featuredIdx];

  return (
    <section className="py-24 sm:py-32 bg-white overflow-hidden relative">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center space-x-3 bg-orange-50 px-4 py-2 rounded-full mb-8 border border-orange-100">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_12px_#f97316]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Travel Intelligence Live</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
            Real-time <span className="text-orange-500">Expedition Lenses</span>
          </h2>
          <p className="text-slate-500 font-medium text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Removing static maps for real-time visual discovery. Gemini analyzes live data to pinpoint Bharat's most compelling destinations.
          </p>
        </div>

        {/* Intelligence Filters (Lenses) */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16 sm:mb-20">
          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              className={`px-5 sm:px-8 py-3 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center space-x-3 border-2 ${
                activeLens === lens.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
              }`}
            >
              <span className="text-base sm:text-lg">{lens.icon}</span>
              <span>{lens.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* LEFT: Live Insights Result List */}
          <div className="lg:col-span-4 order-2 lg:order-1 h-full">
            <div className="bg-slate-900 text-white rounded-[3rem] p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/5 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 saffron-gradient opacity-10 rounded-bl-full blur-3xl"></div>
              
              <div className="relative z-10 mb-8 sm:mb-10">
                <h3 className="text-3xl font-black tracking-tighter mb-4">Discovery Engine</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Grounding live visitor data for {activeLens} nodes.
                </p>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto no-scrollbar pr-1 flex-grow">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/5 h-20 rounded-2xl animate-pulse border border-white/5"></div>
                  ))
                ) : (
                  spots.map((spot, i) => (
                    <div 
                      key={i} 
                      onMouseEnter={() => handleSpotHover(i)}
                      className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 border ${
                        featuredIdx === i 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                        : 'bg-white/5 hover:bg-white/10 text-white border-transparent'
                      } flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${featuredIdx === i ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                          0{i + 1}
                        </div>
                        <div>
                          <h5 className="font-black text-sm tracking-tight">{spot.name.split(' (')[0]}</h5>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${featuredIdx === i ? 'text-white/80' : 'text-slate-500'}`}>Verified Spot</span>
                        </div>
                      </div>
                      <a href={spot.uri} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-all ${featuredIdx === i ? 'text-white hover:bg-white/20' : 'text-slate-500 hover:text-orange-500'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <button onClick={() => fetchDiscoveryData(activeLens)} className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-white transition-colors">Re-analyze Lens</button>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Discovery Spotlight (Place Images) */}
          <div className="lg:col-span-8 order-1 lg:order-2 h-full">
            <div className="flex flex-col h-full space-y-8">
              {/* Featured Spot Detail Card */}
              <div className="relative group/spotlight rounded-[3rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 flex flex-col min-h-[500px] flex-grow">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Visual Context...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      key={featuredSpot?.name}
                      src={`https://source.unsplash.com/1200x800/?${encodeURIComponent(featuredSpot?.name || 'India')},landmark`} 
                      className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover/spotlight:scale-105 transition-all duration-[2000ms] animate-in fade-in zoom-in-95" 
                      alt={featuredSpot?.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1200";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                    
                    <div className="absolute top-8 left-8">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                        Currently Featured
                      </div>
                    </div>

                    <div className="mt-auto p-10 sm:p-14 relative z-10 text-white">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                        <div className="max-w-xl">
                          <h4 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 leading-none">
                            {featuredSpot?.name}
                          </h4>
                          <p className="text-sm sm:text-lg font-bold opacity-90 leading-relaxed mb-6 italic">
                            {summaries[featuredSpot?.name] || "Exploring the unique cultural tapestry and geographical significance of this location..."}
                          </p>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                               <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Verified Integrity</span>
                            </div>
                            <span className="h-4 w-px bg-white/20"></span>
                            <div className="flex items-center space-x-2">
                               <span className="text-orange-400 text-lg">🗺️</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Live Grounding</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onSelectDestination(featuredSpot?.name || 'India')}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_15px_40px_rgba(249,115,22,0.4)] active:scale-95 flex-shrink-0"
                        >
                          Initialize Odyssey
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Discovery Gallery (Small Previews) */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 h-24 sm:h-32">
                 {!loading && spots.slice(0, 6).map((spot, i) => (
                    <button 
                      key={i}
                      onClick={() => setFeaturedIdx(i)}
                      className={`relative rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 group/thumb ${
                        featuredIdx === i ? 'border-orange-500 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={`https://source.unsplash.com/400x400/?${encodeURIComponent(spot.name)},landmark`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-125" 
                        alt={spot.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=400";
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover/thumb:bg-transparent transition-colors"></div>
                    </button>
                 ))}
                 {loading && Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-100 rounded-xl sm:rounded-2xl animate-pulse"></div>
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IndiaMap;
