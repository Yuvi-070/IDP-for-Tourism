
import React from 'react';

const VerificationForm: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-slate-950">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="lg:w-1/2 p-12 md:p-24 flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none relative z-10">Ascend to <br/><span className="textile-gradient">Mastery.</span></h2>
          <p className="text-slate-400 text-lg md:text-2xl font-bold italic mb-12 leading-relaxed relative z-10">
            For the custodians of Bharat's history. Join our verified network of elite local storytellers.
          </p>
          
          <div className="space-y-10 relative z-10">
            <div className="flex items-start space-x-6 group">
              <div className="w-16 h-16 bg-pink-500/10 rounded-3xl flex items-center justify-center text-pink-500 flex-shrink-0 border border-pink-500/20 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700 shadow-2xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h4 className="text-white text-xl font-black tracking-tight mb-2">Sovereign Earnings</h4>
                <p className="text-slate-500 text-sm font-bold italic">Retain 92% of your synthesis value. Transparent ledgering.</p>
              </div>
            </div>
            <div className="flex items-start space-x-6 group">
              <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 flex-shrink-0 border border-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-700 shadow-2xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zM7 13a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h4 className="text-white text-xl font-black tracking-tight mb-2">Digital Identity Infrastructure</h4>
                <p className="text-slate-500 text-sm font-bold italic">Enterprise suite for booking, secure payments, and global reach.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 bg-slate-900/80 p-12 md:p-24 border-l border-white/5">
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Formal Designation</label>
                <input type="text" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="Full Legal Name" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Communication Link</label>
                <input type="tel" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="+91 XXXX-XXXXXX" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Geographic Specialty</label>
              <input type="text" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="City Axis (e.g., Udaipur)" />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Seniority Tier</label>
              <select className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-black transition-all appearance-none cursor-pointer">
                <option className="bg-slate-900">1-3 Cycles (Years)</option>
                <option className="bg-slate-900">4-8 Cycles (Years)</option>
                <option className="bg-slate-900">8+ Cycles (Years Master)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Credentials Portal (Aadhaar/Identity)</label>
              <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-pink-500/50 transition-all cursor-pointer bg-white/5 group">
                <svg className="w-12 h-12 text-slate-700 mx-auto mb-6 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Deploy Credentials / Scan Node</span>
              </div>
            </div>
            <button className="w-full py-7 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-black text-lg uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all transform active:scale-[0.98]">
              Transmit Application
            </button>
            <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest mt-8">
              Review Cycle: 48 Standard Hours. Security protocols active.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
