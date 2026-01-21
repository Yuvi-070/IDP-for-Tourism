import React, { useState, useEffect } from 'react';
import { supabase, createBookingRequest, getMyBookings } from '../services/supabaseClient';
import { Booking } from '../types';

// Extended Guide interface for internal use
interface GuideData {
  id: string;
  name: string;
  location: string;
  specialty: string[];
  languages: string[];
  rating: number; // For DB guides, we might default or store this
  verified: boolean;
  imageUrl: string;
  bio: string;
  pricePerDay: number;
}

const GuideMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [guides, setGuides] = useState<GuideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user ID to prevent self-booking
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // 1. Fetch real guides from DB
      const { data, error } = await supabase.from('guides').select('*');
      if (error) throw error;
      
      const dbGuides: GuideData[] = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        location: g.location,
        specialty: g.specialty || [],
        languages: g.languages || ['English'],
        rating: 4.5, 
        verified: g.verified,
        imageUrl: g.image_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300',
        bio: g.bio,
        pricePerDay: g.price_per_day
      }));

      setGuides(dbGuides);

      // 2. Fetch existing bookings to show status
      const bookings = await getMyBookings('user');
      setUserBookings(bookings);

    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (guideId: string) => {
    setRequesting(guideId);
    try {
      await createBookingRequest(guideId);
      await fetchData(); // Refresh status
      alert("Protocol Request Transmitted. Awaiting Guide Approval.");
    } catch (error: any) {
      console.error(error);
      alert("Request failed: " + error.message);
    } finally {
      setRequesting(null);
    }
  };
  
  const filteredGuides = guides.filter(guide => 
    guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBookingStatus = (guideId: string) => {
    const booking = userBookings.find(b => b.guide_id === guideId);
    return booking ? booking.status : null;
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-slate-950 min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-20 gap-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-3 bg-pink-500/10 px-4 py-2 rounded-full mb-6 border border-pink-500/20">
             <span className="text-pink-500 font-black uppercase text-[10px] tracking-widest">Master Vault</span>
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tighter leading-none">Verified <span className="textile-gradient">Storytellers</span></h2>
          <p className="text-slate-400 font-bold text-lg sm:text-2xl italic leading-relaxed">
            The final human link. Curated local experts verified for heritage depth and safety.
          </p>
        </div>
        <div className="relative w-full xl:w-[500px]">
          <input 
            type="text" 
            placeholder="Filter by city, specialty, or dialect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-slate-900/60 border-2 border-white/5 rounded-[2rem] focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none transition shadow-2xl text-white font-bold"
          />
          <svg className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 font-bold animate-pulse">Synchronizing Guide Database...</div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-[3rem] border border-white/5">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Active Nodes</h3>
             <p className="text-slate-500 mt-2">No verified guides match your specific filter coordinates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
          {filteredGuides.map((guide) => {
            const status = getBookingStatus(guide.id);
            const isSelf = guide.id === currentUserId;
            
            return (
              <div key={guide.id} className="group bg-slate-900/40 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl hover:border-pink-500/30 transition-all duration-1000 flex flex-col h-full hover:-translate-y-6">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={guide.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125 opacity-70 group-hover:opacity-100" 
                    alt={guide.name} 
                  />
                  <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white flex items-center space-x-2 border border-white/10 shadow-2xl">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span>{guide.rating} Logic</span>
                  </div>
                  {guide.verified && (
                    <div className="absolute top-6 left-6 bg-pink-600 text-white p-2 rounded-full shadow-[0_0_20px_#ec4899] border border-pink-400" title="Verified Master">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
                
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{guide.location} Cycle</span>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">{guide.languages.join(' • ')}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter group-hover:text-pink-500 transition-colors duration-500">{guide.name}</h3>
                  <p className="text-slate-400 text-base font-bold italic mb-8 flex-grow leading-relaxed">"{guide.bio}"</p>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    {guide.specialty.map(s => (
                      <span key={s} className="bg-white/5 text-slate-400 text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
                    <div>
                      <span className="text-2xl font-black text-white tracking-tighter">₹{guide.pricePerDay}</span>
                      <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest"> / Cycle</span>
                    </div>
                    {status === 'approved' ? (
                       <div className="bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                         Connected
                       </div>
                    ) : status === 'pending' ? (
                       <div className="bg-amber-500/10 text-amber-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                         Request Sent
                       </div>
                    ) : (
                      <button 
                        onClick={() => handleBook(guide.id)}
                        disabled={requesting === guide.id || isSelf}
                        className={`text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isSelf ? 'bg-slate-700 hover:bg-slate-700' : 'bg-pink-600 hover:bg-pink-500'}`}
                      >
                        {isSelf ? 'Your Node' : (requesting === guide.id ? 'Sending...' : 'Book Protocol')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuideMarketplace;