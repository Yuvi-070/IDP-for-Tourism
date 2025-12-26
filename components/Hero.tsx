
import React from 'react';

const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-[60vh] sm:h-[75vh] md:h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1920" 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Taj Mahal"
        />
      </div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-200 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-6 md:mb-8">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-orange-500"></span>
            <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider">Solving the Last-Mile of Tourism</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
            Discover India through the <span className="text-orange-400">eyes of a local.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 mb-8 md:mb-10 leading-relaxed max-w-2xl font-medium">
            BharatYatra bridges the gap between AI-driven planning and on-the-ground reality. Get a personalized itinerary and connect with verified local experts instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 md:py-4 rounded-full font-bold text-sm md:text-lg transition shadow-xl active:scale-95 whitespace-nowrap"
            >
              Plan Your Journey
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-3.5 md:py-4 rounded-full font-bold text-sm md:text-lg transition active:scale-95 whitespace-nowrap">
              Find a Local Guide
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
