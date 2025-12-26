
import React, { useState } from 'react';

interface IndiaMapProps {
  onSelectDestination: (dest: string) => void;
}

const MAP_HOTSPOTS = [
  { name: "Ladakh (Moonland)", top: "11.5%", left: "48.2%" },
  { name: "Amritsar (Golden Temple)", top: "20.2%", left: "34.5%" },
  { name: "Jaipur (Pink City)", top: "37.5%", left: "36.2%" },
  { name: "Varanasi (Spiritual Capital)", top: "43.8%", left: "64.1%" },
  { name: "Udaipur (City of Lakes)", top: "46.2%", left: "31.5%" },
  { name: "Hampi (Vijayanagara Ruins)", top: "70.5%", left: "43.5%" },
  { name: "Mysuru (Palace City)", top: "82.2%", left: "46.2%" },
  { name: "Kochi (Queen of Arabian Sea)", top: "89.5%", left: "44.1%" },
];

const IndiaMap: React.FC<IndiaMapProps> = ({ onSelectDestination }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="py-12 bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl px-6">
        <div className="relative w-full aspect-[4/5] md:aspect-square bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
          <div className="relative w-full h-full flex items-center justify-center select-none">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/India_location_map.svg/1000px-India_location_map.svg.png" 
              className={`w-full h-full object-contain p-6 md:p-10 transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              alt="Map of India"
              draggable="false"
              onLoad={() => setImgLoaded(true)}
            />
            
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {imgLoaded && (
              <div className="absolute inset-0 pointer-events-none">
                {MAP_HOTSPOTS.map((spot) => (
                  <div 
                    key={spot.name}
                    style={{ top: spot.top, left: spot.left }}
                    className="absolute z-30 pointer-events-auto"
                  >
                    <button 
                      onClick={() => onSelectDestination(spot.name)}
                      className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 focus:outline-none group"
                      aria-label={`Explore ${spot.name}`}
                    >
                      <div className="w-5 h-5 md:w-8 md:h-8 bg-orange-500 border-2 md:border-4 border-white rounded-full shadow-lg transition-all group-hover:bg-slate-900 group-hover:scale-125"></div>
                      
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-xl z-50">
                        {spot.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndiaMap;
