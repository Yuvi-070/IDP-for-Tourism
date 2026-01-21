
import React, { useState, useEffect, useRef } from 'react';
import { supabase, getMyBookings, updateBookingStatus } from '../services/supabaseClient';
import { Guide, Booking } from '../types';
import VerificationForm from './VerificationForm'; // Import Verification Form for re-initialization

const GuideProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [showInit, setShowInit] = useState(false);
  
  // File refs
  const profileImageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGuideProfile();
  }, []);

  const fetchGuideProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') console.error("Error fetching guide:", error);

      if (data) {
        setGuide({
            id: data.id,
            name: data.name,
            location: data.location,
            bio: data.bio,
            pricePerDay: data.price_per_day,
            experience: data.experience_years, 
            specialty: data.specialty || [],
            languages: data.languages || [],
            imageUrl: data.image_url,
            verified: data.verified,
            rating: 4.5,
            verification_document_url: data.verification_document_url
        } as any);
        fetchRequests();
      } else {
        setGuide(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
      const bookings = await getMyBookings('guide');
      setRequests(bookings);
  };

  const handleRequestAction = async (bookingId: string, status: 'approved' | 'rejected') => {
      try {
          await updateBookingStatus(bookingId, status);
          fetchRequests(); // Refresh
      } catch (error) {
          alert("Action failed.");
      }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!guide) return;
    setGuide({ ...guide, [field]: value });
  };

  const handleArrayChange = (field: 'specialty' | 'languages', value: string) => {
      if (!guide) return;
      setGuide({ ...guide, [field]: value.split(',').map(s => s.trim()) });
  }

  const uploadFile = async (file: File, pathFolder: string): Promise<string | null> => {
     try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${pathFolder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('guide-docs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('guide-docs').getPublicUrl(filePath);
        return data.publicUrl;
     } catch (error) {
         console.error("Upload error:", error);
         alert("Upload failed. Please try again.");
         return null;
     }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !guide) return;
      const file = e.target.files[0];
      setSaving(true);
      
      const publicUrl = await uploadFile(file, 'avatars');
      if (publicUrl) {
          setGuide({ ...guide, imageUrl: publicUrl });
      }
      setSaving(false);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !guide) return;
    const file = e.target.files[0];
    setSaving(true);

    const publicUrl = await uploadFile(file, 'verification');
    if (publicUrl) {
        setGuide({ ...guide, verification_document_url: publicUrl });
        alert("Document uploaded. Please click 'Save Configuration' to submit for review.");
    }
    setSaving(false);
  };

  const handleSave = async () => {
      if (!guide) return;
      setSaving(true);
      try {
        const updates = {
            name: guide.name,
            location: guide.location,
            bio: guide.bio,
            price_per_day: guide.pricePerDay,
            image_url: guide.imageUrl,
            specialty: guide.specialty,
            languages: guide.languages,
            verification_document_url: guide.verification_document_url,
        };

        const { error } = await supabase
            .from('guides')
            .update(updates)
            .eq('id', guide.id);

        if (error) throw error;
        await fetchGuideProfile();
        alert("Profile Node Updated.");
      } catch (err) {
          console.error("Update failed", err);
          alert("Failed to update profile.");
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Accessing Node Data...</div>;
  }

  // Allow re-creation if guide data is missing (deleted)
  if (!guide) {
      if (showInit) {
          return <VerificationForm onComplete={() => { setShowInit(false); fetchGuideProfile(); }} />;
      }
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
              <div className="bg-slate-900/50 p-10 rounded-[2rem] border border-white/10 text-center max-w-md">
                   <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   </div>
                   <h3 className="text-xl font-black uppercase mb-4">Node Configuration Missing</h3>
                   <p className="text-slate-400 mb-8">Your guide profile data appears to be missing or deleted from the main ledger.</p>
                   <button 
                    onClick={() => setShowInit(true)}
                    className="w-full py-4 bg-pink-600 hover:bg-pink-500 rounded-xl text-white font-black uppercase tracking-widest shadow-lg transition-all"
                   >
                       Re-Initialize Node
                   </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                <div>
                   <div className="inline-flex items-center space-x-3 bg-pink-500/10 px-4 py-2 rounded-full mb-6 border border-pink-500/20">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                        <span className="text-pink-500 font-black uppercase text-[10px] tracking-widest">Expert Control Panel</span>
                   </div>
                   <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">My <span className="textile-gradient">Node</span></h2>
                </div>
                {guide.verified ? (
                    <div className="bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-xl border border-emerald-500/20 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Verified Master
                    </div>
                ) : (
                    <div className="bg-amber-500/10 text-amber-400 px-6 py-3 rounded-xl border border-amber-500/20 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         Pending Verification
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* INCOMING REQUESTS PANEL */}
                <div className="lg:col-span-12 glass-panel-heavy rounded-[2.5rem] p-8 mb-8">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Incoming Protocol Requests</h3>
                    {requests.length === 0 ? (
                        <p className="text-slate-500 italic text-sm">No pending transmission requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {requests.map(req => (
                                <div key={req.id} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-white font-bold">{req.traveler?.email || 'Unknown Traveler'}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            req.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 
                                            'bg-amber-500/10 text-amber-400'
                                        }`}>
                                            {req.status}
                                        </div>
                                    </div>
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => handleRequestAction(req.id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Accept</button>
                                            <button onClick={() => handleRequestAction(req.id, 'rejected')} className="flex-1 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Decline</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Left Column: Avatar & Docs */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Avatar Card */}
                    <div className="glass-panel-heavy rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                        <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white/10 shadow-2xl mb-6 group-hover:border-pink-500/50 transition-all">
                            <img src={guide.imageUrl || "https://placehold.co/400"} alt="Profile" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => profileImageRef.current?.click()}>
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Update</span>
                            </div>
                        </div>
                        <input type="file" ref={profileImageRef} className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                        <h3 className="text-xl font-black text-white">{guide.name}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{guide.location}</p>
                    </div>

                    {/* Document Verification Card */}
                    <div className="glass-panel-heavy rounded-[2.5rem] p-8 relative overflow-hidden">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Identity Matrix</h4>
                        
                        {guide.verification_document_url ? (
                             <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 mb-4">
                                 <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                     <span className="text-[10px] font-black uppercase tracking-widest">Document Uploaded</span>
                                 </div>
                                 <a href={guide.verification_document_url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 hover:text-white underline block truncate">View Document</a>
                             </div>
                        ) : (
                            <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Missing Citizenship Proof</span>
                            </div>
                        )}

                        <input type="file" ref={docRef} className="hidden" accept="image/*,.pdf" onChange={handleDocUpload} />
                        <button 
                            onClick={() => docRef.current?.click()}
                            disabled={saving}
                            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            {guide.verification_document_url ? "Replace Document" : "Upload Adhaar / ID"}
                        </button>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-8 glass-panel-heavy rounded-[2.5rem] p-8 sm:p-12">
                     <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 pb-4 border-b border-white/5">Metadata Configuration</h4>
                     
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
                                <input type="text" value={guide.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Base Location</label>
                                <input type="text" value={guide.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Narrative Bio</label>
                             <textarea rows={4} value={guide.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none leading-relaxed" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Rate (INR / Day)</label>
                                <input type="number" value={guide.pricePerDay} onChange={(e) => handleInputChange('pricePerDay', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Languages (Comma Sep)</label>
                                <input type="text" value={guide.languages.join(', ')} onChange={(e) => handleArrayChange('languages', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Specialties (Comma Sep)</label>
                             <input type="text" value={guide.specialty.join(', ')} onChange={(e) => handleArrayChange('specialty', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-sm focus:border-pink-500 transition-colors outline-none" />
                        </div>
                     </div>

                     <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                         <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                             {saving ? 'Syncing...' : 'Save Configuration'}
                         </button>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GuideProfile;
