
import React from 'react';

const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/id/1015/1920/1080" 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Indian Landscape"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-200 px-4 py-1.5 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-semibold uppercase tracking-wider">Solving the Last-Mile of Tourism</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover India through the <span className="text-orange-400">eyes of a local.</span>
          </h1>
          <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-2xl">
            BharatYatra bridges the gap between AI-driven planning and on-the-ground reality. Get a personalized itinerary and connect with verified local experts instantly.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={onGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-xl"
            >
              Plan Your Journey
            </button>
            <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition">
              Find a Local Guide
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
