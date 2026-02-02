
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Planner from './components/Planner';
import GuideMarketplace from './components/GuideMarketplace';
import ChatInterface from './components/ChatInterface';
import VerificationForm from './components/VerificationForm';
import GuideProfile from './components/GuideProfile';
import UserProfile from './components/UserProfile';
import IndiaMap from './components/IndiaMap';
import TripDetails from './components/TripDetails';
import AuthPage from './components/AuthPage';
import History from './components/History';
import { Itinerary } from './types';
import { supabase, saveItineraryToDB } from './services/supabaseClient';
import { mergeItineraries } from './services/geminiService';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [preselectedDest, setPreselectedDest] = useState<string | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [editingDbId, setEditingDbId] = useState<string | undefined>(undefined);
  const [finalItinerary, setFinalItinerary] = useState<Itinerary | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'guide'>('user');

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If Supabase takes too long (e.g. project paused/network issue), 
    // force stop loading so user isn't stuck.
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Auth initialization timed out. Forcing app load.");
        setLoading(false);
      }
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await checkUserProfile(session.user.id, session.user.email);
          }
        }
      } catch (e) {
        console.warn("Auth initialization failed (likely network or config):", e);
      } finally {
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        if (session) {
          setShowAuth(false);
          setIsGuest(false);
          await checkUserProfile(session.user.id, session.user.email);
        }
        if (event === 'SIGNED_OUT') {
          setIsGuest(false);
          setShowAuth(false);
          setActiveTab('home');
          setUserRole('user');
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserProfile = async (userId: string, email?: string) => {
    try {
      // 1. Fetch Profile Role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      // Auto-create profile if missing (fixes foreign key errors)
      if ((error && error.code === 'PGRST116') || !profile) {
          console.log("Profile missing, creating new user profile...");
          if (email) {
              const { error: insertError } = await supabase.from('profiles').insert([
                  { id: userId, email: email, role: 'user' }
              ]);
              if (!insertError) {
                  setUserRole('user');
                  return;
              }
          }
      }

      if (profile) {
        setUserRole(profile.role);
        
        // 2. If Guide, check if details exist
        if (profile.role === 'guide') {
           const { data: guideData } = await supabase
             .from('guides')
             .select('id')
             .eq('id', userId)
             .single();
           
           if (!guideData) {
             // Force verification if no guide data found
             setActiveTab('verification');
           }
        }
      }
    } catch (e) {
      console.error("Profile check failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error", error);
    }
    // Explicitly clear all session state to ensure UI reflects logout immediately
    setSession(null);
    setIsGuest(false);
    setActiveTab('home');
    setUserRole('user');
  };

  const handleMapSelect = (dest: string) => {
    setPreselectedDest(dest);
    setEditingItinerary(null); 
    setEditingDbId(undefined);
    setActiveTab('planner');
  };

  const handleFinalize = (itinerary: Itinerary) => {
    setFinalItinerary(itinerary);
    setActiveTab('details');
  };

  const handleHistorySelect = (itinerary: Itinerary) => {
    setFinalItinerary(itinerary);
    setActiveTab('details');
  };

  const handleEditItinerary = (itinerary: Itinerary, dbId: string) => {
    setEditingItinerary(itinerary);
    setEditingDbId(dbId);
    setActiveTab('planner');
  };

  const handleMergeItineraries = async (itineraries: Itinerary[]) => {
    setIsMerging(true);
    try {
      const mergedPlan = await mergeItineraries(itineraries);
      if (mergedPlan) {
        if (session?.user) {
           await saveItineraryToDB(session.user.id, mergedPlan);
        }
        setEditingItinerary(mergedPlan);
        setEditingDbId(undefined); 
        setActiveTab('planner');
      }
    } catch (error) {
      alert("Failed to merge itineraries. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="bg-slate-950">
            <Hero onGetStarted={() => setActiveTab('planner')} onOpenChat={() => setActiveTab('chat')} />
            
            <section className="py-24 sm:py-32 bg-slate-950 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 md:mb-20 gap-8">
                  <div className="max-w-3xl">
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-6">Quick Start <span className="textile-gradient">Nodes</span></h2>
                    <p className="text-slate-500 font-bold text-lg sm:text-2xl italic leading-relaxed">Instant synthesis for Bharat's most iconic cultural coordinates.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                  {[
                    { name: "Jaipur (Pink City)", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800" },
                    { name: "Varanasi (Spiritual Capital)", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800" },
                    { name: "Ladakh (Moonland)", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=800" },
                    { name: "Kochi (Queen of Arabian Sea)", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800" },
                    { name: "Hampi (Ancient Ruins)", img: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&q=80&w=800" },
                    { name: "Munnar (Tea Estates)", img: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=800" },
                    { name: "Udaipur (City of Lakes)", img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800" },
                    { name: "Amritsar (Golden Temple)", img: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800" }
                  ].map((city) => (
                    <button 
                      key={city.name}
                      onClick={() => handleMapSelect(city.name)}
                      className="group relative h-64 sm:h-80 md:h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 border border-white/5 hover:border-pink-500/50 hover:-translate-y-4"
                    >
                      <img 
                        src={city.img} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-100" 
                        alt={city.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-left">
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.4em] block mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Deploy Logic</span>
                        <h4 className="text-white font-black text-xl sm:text-2xl tracking-tighter leading-tight group-hover:text-pink-500 transition-colors">{city.name.split(' (')[0]}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <IndiaMap onSelectDestination={handleMapSelect} />
          </div>
        );
      case 'planner':
        return <Planner initialDestination={preselectedDest} initialItinerary={editingItinerary} dbId={editingDbId} onFinalize={handleFinalize} onProfileMissing={() => setActiveTab('user-profile')} />;
      case 'details':
        return finalItinerary ? (
          <TripDetails 
            itinerary={finalItinerary} 
            onBack={() => setActiveTab('planner')} 
            onBookGuide={() => setActiveTab('guides')} 
          />
        ) : (
          <Planner onFinalize={handleFinalize} onProfileMissing={() => setActiveTab('user-profile')} />
        );
      case 'history':
        return <History onSelectItinerary={handleHistorySelect} onEditItinerary={handleEditItinerary} onMergeItineraries={handleMergeItineraries} />;
      case 'guides':
        return <GuideMarketplace />;
      case 'chat':
        return <ChatInterface />;
      case 'verification':
        return <VerificationForm onComplete={() => setActiveTab('guides')} />;
      case 'guide-profile':
        return <GuideProfile />;
      case 'user-profile':
        return <UserProfile />;
      default:
        return <Hero onGetStarted={() => setActiveTab('planner')} onOpenChat={() => setActiveTab('chat')} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 mb-8 relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-600 to-orange-500 animate-spin blur-md opacity-50"></div>
            <div className="absolute inset-0 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10">
               <span className="text-2xl font-black text-white">L</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">Initializing System</h2>
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-0"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Establishing Neural Handshake...</p>
        </div>
      </div>
    );
  }

  if (isMerging) {
    return (
       <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="text-center relative z-10">
             <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest">Merging Neural Pathways...</h2>
             <p className="text-slate-500 mt-2 font-bold italic">Synthesizing combined itinerary.</p>
          </div>
       </div>
    )
  }

  // Force Auth if no session and not in guest mode
  if (!session && !isGuest && showAuth) {
    return <AuthPage onGuestLogin={() => { setIsGuest(true); setShowAuth(false); }} />;
  }
  
  if (!session && !isGuest && activeTab === 'home' && !showAuth) {
      return <AuthPage onGuestLogin={() => setIsGuest(true)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      session={session}
      onLoginClick={() => setShowAuth(true)}
      userRole={userRole}
      onLogout={handleLogout}
    >
      {showAuth && !session ? (
        <div className="fixed inset-0 z-[200] bg-slate-950">
          <AuthPage onGuestLogin={() => { setIsGuest(true); setShowAuth(false); }} />
          <button 
            onClick={() => setShowAuth(false)} 
            className="absolute top-6 right-6 text-white p-4 bg-white/10 rounded-full"
          >
            ✕
          </button>
        </div>
      ) : renderContent()}
    </Layout>
  );
};

export default App;
