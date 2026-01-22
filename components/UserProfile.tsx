import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, date_of_birth')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      alert("First Name is required to initialize your Neural Identity.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updates = {
        id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      alert("Identity Matrix Updated Successfully.");
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Accessing Bio-Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-24 sm:px-6 lg:px-8 bg-slate-950 min-h-screen">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-8 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-purple-500/10 px-4 py-2 rounded-full mb-6 border border-purple-500/20">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-purple-400 font-black uppercase text-[10px] tracking-widest">Traveler Identity Node</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter">My <span className="textile-gradient">Profile</span></h2>
            <p className="text-slate-400 font-bold italic">
              Complete your bio-data to enable AI synthesis and secure guide protocols.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 ml-2">First Name *</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange}
                  placeholder="e.g. Aditi"
                  className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:border-pink-500/50 outline-none text-white font-bold transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:border-purple-500/50 outline-none text-white font-bold transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Comm Link (Mobile)</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:border-purple-500/50 outline-none text-white font-bold transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Inception Date (DOB)</label>
              <input 
                type="date" 
                name="date_of_birth" 
                value={formData.date_of_birth} 
                onChange={handleChange}
                className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:border-purple-500/50 outline-none text-white font-bold transition-all placeholder:text-slate-700 [color-scheme:dark]"
              />
            </div>

            <div className="pt-8 flex justify-center">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-white text-slate-950 px-12 py-5 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Encrypting Data...' : 'Save Identity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;