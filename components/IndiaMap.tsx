
import React, { useState } from 'react';

interface IndiaMapProps {
  onSelectDestination: (dest: string) => void;
}

const MAP_HOTSPOTS = [
  { name: "Ladakh (Moonland)", top: "11%", left: "48%" },
  { name: "Amritsar (Golden Temple)", top: "20%", left: "34%" },
  { name: "Jaipur (Pink City)", top: "37%", left: "36%" },
  { name: "Varanasi (Spiritual Capital)", top: "43%", left: "64%" },
  { name: "Udaipur (City of Lakes)", top: "46%", left: "31%" },
  { name: "Hampi (Vijayanagara Ruins)", top: "70%", left: "43%" },
  { name: "Mysuru (Palace City)", top: "82%", left: "46%" },
  { name: "Kochi (Queen of Arabian Sea)", top: "89%", left: "44%" },
];

const IndiaMap: React.FC<IndiaMapProps> = ({ onSelectDestination }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Dynamic background accents */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-orange-100/40 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100/30 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-5/12">
            <div className="inline-flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl shadow-lg border border-slate-100 mb-10 transform -rotate-1">
              <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-sm"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Interactive Geography</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tighter">
              Explore the <span className="text-orange-500">Soul of Bharat</span>
            </h2>
            <p className="text-slate-600 text-xl leading-relaxed mb-12 font-medium max-w-xl">
              India's heritage is deeply rooted in its geography. Select a historical hub on our map to instantly initialize an AI-curated expedition plan.
            </p>
            <div className="grid grid-cols-2 gap-5">
              {MAP_HOTSPOTS.map(spot => (
                <button 
                  key={spot.name}
                  onClick={() => onSelectDestination(spot.name)}
                  className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 text-left group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/5 rounded-bl-full transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                  <span className="text-sm font-black text-slate-700 group-hover:text-orange-600 transition flex items-center justify-between">
                    {spot.name.split(' ')[0]}
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-7/12 relative w-full flex justify-center py-10 min-h-[850px]">
            {/* Glassmorphic Map Container */}
            <div className="relative w-full max-w-[700px] h-[850px] bg-white rounded-[5.5rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] p-12 md:p-16 border-8 border-slate-50 flex items-center justify-center overflow-visible transition-all duration-1000 hover:scale-[1.01] hover:shadow-orange-500/5">
               <div className="relative w-full h-full flex items-center justify-center overflow-visible select-none">
                  {/* High Resolution India Map from Wikimedia - Direct SVG for maximum clarity */}
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e0/India_location_map.svg" 
                    className={`w-full h-full object-contain transition-all duration-1000 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    alt="Map of India"
                    draggable="false"
                    onLoad={() => setImgLoaded(true)}
                  />
                  
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Map Labels Overlay */}
                  {imgLoaded && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {MAP_HOTSPOTS.map((spot) => (
                        <div 
                          key={spot.name}
                          style={{ top: spot.top, left: spot.left }}
                          className="absolute group z-30 pointer-events-auto"
                        >
                          <button 
                            onClick={() => onSelectDestination(spot.name)}
                            className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                          >
                            {/* Pulsing Aura */}
                            <span className="absolute w-20 h-20 bg-orange-500/20 rounded-full animate-ping group-hover:bg-orange-500/40"></span>
                            
                            {/* Main Marker */}
                            <div className="relative w-12 h-12 bg-orange-500 border-[6px] border-white rounded-full shadow-[0_12px_24px_rgba(255,153,51,0.4)] transition-all duration-700 group-hover:scale-[1.5] group-hover:rotate-[15deg] group-hover:bg-orange-600 group-hover:shadow-orange-500/60 flex items-center justify-center">
                               <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner"></div>
                            </div>
                          </button>
                          
                          {/* Tooltip Styling */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-10 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-black px-7 py-4 rounded-[1.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-50 transform translate-y-4 group-hover:translate-y-0 tracking-[0.2em] uppercase border border-white/10">
                            {spot.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-slate-900/95"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
            
            {/* Floating Context Labels */}
            <div className="absolute top-[15%] left-[10%] text-slate-300 font-black text-[9px] uppercase tracking-[0.6em] -rotate-12 pointer-events-none select-none">Northern Frontiers</div>
            <div className="absolute bottom-[20%] right-[5%] text-slate-300 font-black text-[9px] uppercase tracking-[0.6em] rotate-90 pointer-events-none select-none">Eastern Ghats</div>
            <div className="absolute bottom-[10%] left-[15%] text-slate-300 font-black text-[9px] uppercase tracking-[0.6em] pointer-events-none select-none">Indian Ocean</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndiaMap;
