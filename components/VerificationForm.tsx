
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface VerificationFormProps {
  onComplete?: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    bio: '',
    specialty: '',
    experience: '1-3 Years',
    price: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const guideData = {
        id: user.id,
        name: formData.name,
        location: formData.location,
        contact_number: formData.contact,
        bio: formData.bio,
        specialty: formData.specialty.split(',').map(s => s.trim()),
        price_per_day: parseFloat(formData.price),
        experience_years: formData.experience,
        languages: ['English', 'Hindi'], // Default for MVP
        verified: false // Requires admin approval realistically, set to false
      };

      const { error } = await supabase.from('guides').insert([guideData]);

      if (error) throw error;
      
      alert("Application Transmitted Successfully. Your node is now pending verification.");
      if (onComplete) onComplete();

    } catch (error: any) {
      console.error("Submission failed", error);
      alert("Transmission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Formal Designation</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="Full Legal Name" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Communication Link</label>
                <input required name="contact" value={formData.contact} onChange={handleChange} type="tel" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="+91 XXXX-XXXXXX" />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Geographic Specialty</label>
              <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="City Axis (e.g., Udaipur)" />
            </div>

            <div className="space-y-3">
               <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Expertise Tags (Comma Separated)</label>
               <input required name="specialty" value={formData.specialty} onChange={handleChange} type="text" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="History, Food, Architecture..." />
            </div>

            <div className="space-y-3">
               <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Narrative Bio</label>
               <textarea required name="bio" value={formData.bio} onChange={handleChange} className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all h-32" placeholder="Tell us about your heritage journey..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Seniority Tier</label>
                <select name="experience" value={formData.experience} onChange={handleChange} className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-black transition-all appearance-none cursor-pointer">
                  <option className="bg-slate-900" value="1-3 Years">1-3 Cycles (Years)</option>
                  <option className="bg-slate-900" value="4-8 Years">4-8 Cycles (Years)</option>
                  <option className="bg-slate-900" value="8+ Years">8+ Cycles (Years Master)</option>
                </select>
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Price Per Cycle (Day)</label>
                 <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none text-white font-bold transition-all" placeholder="₹ INR" />
              </div>
            </div>

            <button disabled={loading} className="w-full py-7 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-black text-lg uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50">
              {loading ? "Transmitting..." : "Transmit Application"}
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
