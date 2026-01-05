
import React, { useState, useEffect } from 'react';

const images = [
  "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1920", // Taj Mahal
  "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1920", // Ladakh
  "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=1920", // Varanasi
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1920"  // Kerala
];

const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Scoped style to decrease film grain on Hero only */}
      <style>{`
        .noise-overlay {
          opacity: 0.01 !important;
        }
      `}</style>

      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={img} 
              className="w-full h-full object-cover brightness-[0.45] scale-110 transition-transform duration-[10000ms] ease-out"
              style={{ transform: idx === currentImageIndex ? 'scale(1) rotate(0deg)' : 'scale(1.1) rotate(-1deg)' }}
              alt="Scenic India"
            />
          </div>
        ))}
        {/* lightened gradients to show more of the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 w-full">
        <div className="max-w-6xl">
          <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-2.5 rounded-full mb-10 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Last Mile Solutions</span>
          </div>
          
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-white mb-10 leading-[0.8] tracking-[-0.04em]">
            Witness Bharat <br/>
            <span className="textile-gradient italic">Refined.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-400 mb-14 leading-relaxed max-w-3xl font-medium tracking-tight">
            Where <span className="text-white">AI precision</span> meets the <span className="text-white italic">lived heritage</span> of India's most profound local storytellers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <button 
              onClick={onGetStarted}
              className="group relative w-full sm:w-auto bg-white text-slate-950 px-12 py-6 sm:py-7 rounded-full font-black text-sm sm:text-xl transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)] active:scale-95 whitespace-nowrap uppercase tracking-[0.3em] overflow-hidden hover:pr-16"
            >
              <span className="relative z-10">Start Blueprint</span>
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>
            </button>
            <button className="w-full sm:w-auto bg-white/5 backdrop-blur-3xl hover:bg-white/10 text-white border border-white/10 px-12 py-6 sm:py-7 rounded-full font-black text-sm sm:text-xl transition-all active:scale-95 whitespace-nowrap uppercase tracking-[0.3em]">
              Access Vault
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-16 right-16 hidden xl:block space-y-20 opacity-20">
          <div className="flex flex-col items-end border-r-4 border-pink-500 pr-8">
            <span className="text-6xl font-black text-white leading-none tracking-tighter">245+</span>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Active Nodes</span>
          </div>
          <div className="flex flex-col items-end border-r-4 border-orange-500 pr-8">
            <span className="text-6xl font-black text-white leading-none tracking-tighter">12K</span>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Verified Masters</span>
          </div>
      </div>
    </section>
  );
};

export default Hero;
