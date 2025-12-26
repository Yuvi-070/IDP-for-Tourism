
import React from 'react';

const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-[70vh] sm:min-h-screen flex items-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1920" 
          className="w-full h-full object-cover brightness-[0.2] scale-105"
          alt="Taj Mahal Night"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-5xl">
          <div className="inline-flex items-center space-x-3 bg-pink-500/10 backdrop-blur-md border border-pink-500/20 text-pink-400 px-5 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">Revolutionizing Last-Mile Discovery</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.85] tracking-tighter">
            Witness Bharat <br/>
            <span className="textile-gradient">Refined.</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl font-bold italic">
            Where enterprise-grade AI intuition meets the lived history of India's most profound local storytellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-orange-500 hover:scale-105 text-white px-10 py-5 sm:py-7 rounded-full font-black text-sm sm:text-xl transition-all shadow-[0_20px_50px_rgba(236,72,153,0.4)] active:scale-95 whitespace-nowrap uppercase tracking-[0.3em]"
            >
              Start Blueprint
            </button>
            <button className="w-full sm:w-auto bg-white/5 backdrop-blur-md hover:bg-white/10 text-white border border-white/10 px-10 py-5 sm:py-7 rounded-full font-black text-sm sm:text-xl transition-all active:scale-95 whitespace-nowrap uppercase tracking-[0.3em]">
              Access Vault
            </button>
          </div>
        </div>
      </div>
      
      {/* Visual Accents */}
      <div className="absolute bottom-10 right-10 hidden xl:flex items-center space-x-12 opacity-30">
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-white leading-none tracking-tighter">245+</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Heritage Nodes</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-white leading-none tracking-tighter">12K</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Masters</span>
          </div>
      </div>
    </section>
  );
};

export default Hero;
