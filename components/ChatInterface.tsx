
import React, { useState, useEffect, useRef } from 'react';
import { chatWithLocalAI, translateText, analyzeLocationImage } from '../services/geminiService';
import { supabase, getMyBookings, getMessages, sendMessage, getUserItineraries, updateBookingStatus } from '../services/supabaseClient';
import { ChatMessage, Booking, RealtimeMessage, Itinerary } from '../types';
import TripDetails from './TripDetails';

const ChatInterface: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string>('ai'); // 'ai' or booking_id
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<(ChatMessage | RealtimeMessage)[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; preview: string; mimeType: string } | null>(null);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [availableItineraries, setAvailableItineraries] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'user' | 'guide'>('user');
  const [userId, setUserId] = useState<string>('');
  
  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // State for viewing full itinerary details
  const [viewingItinerary, setViewingItinerary] = useState<Itinerary | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    initChat();
  }, []);

  // Fetch all bookings (approved AND pending)
  const initChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUserId(user.id);
        // Determine role via profile check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const role = profile?.role || 'user';
        setUserRole(role);

        await fetchBookings(role);
    }
  };

  const fetchBookings = async (role: 'user' | 'guide') => {
      const allBookings = await getMyBookings(role);
      // We now keep all bookings to show pending states
      setBookings(allBookings);
  };

  // Switch Session
  useEffect(() => {
    if (activeSession === 'ai') {
        // AI Intro
        setMessages([{
            id: 'welcome',
            sender: 'ai',
            text: 'Namaste! I am your AI Journey Concierge. Ask me anything about Indian heritage or travel.',
            timestamp: new Date()
        } as ChatMessage]);
    } else {
        // Check if session is valid (approved)
        const currentBooking = bookings.find(b => b.id === activeSession);
        if (currentBooking && currentBooking.status !== 'approved') {
            setMessages([]); // Clear messages for pending items
            return;
        }

        // Load Realtime History
        loadRealtimeMessages(activeSession);
        
        // Subscribe
        const channel = supabase
            .channel('chat_room')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${activeSession}` }, (payload) => {
                const newMsg = payload.new as RealtimeMessage;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }
  }, [activeSession, bookings]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const loadRealtimeMessages = async (bookingId: string) => {
      let msgs = await getMessages(bookingId);
      
      // Inject Disclaimer if it's a human chat
      const disclaimer: any = {
          id: 'system-disclaimer',
          sender: 'system', // treated specially in render
          content: '⚠️ SECURITY PROTOCOL: Do not enclose personal information (Bank Details, Home Address) until necessary for the active booking.',
          created_at: new Date().toISOString(),
          message_type: 'text'
      };

      setMessages([disclaimer, ...msgs]);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (isChatEnded) return;
    
    // Guard: Cannot chat if pending
    const currentBooking = bookings.find(b => b.id === activeSession);
    if (activeSession !== 'ai' && currentBooking?.status !== 'approved') {
        alert("Wait for the request to be accepted before messaging.");
        return;
    }

    const txt = input;
    setInput('');
    setSelectedImage(null);

    if (activeSession === 'ai') {
        // AI Logic (Existing)
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: txt, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        try {
            let response = '';
            if (selectedImage) {
                response = await analyzeLocationImage(selectedImage.base64, selectedImage.mimeType);
            } else {
                response = await chatWithLocalAI(txt, "General Concierge");
            }
            const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: 'ai', text: response, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    } else {
        // Realtime Logic
        try {
            await sendMessage(activeSession, txt, 'text');
        } catch (e) {
            alert("Failed to send message");
        }
    }
  };

  const handleShareItinerary = async () => {
      if (activeSession === 'ai') return alert("Only available in Human Chat");
      
      const histories = await getUserItineraries(userId);
      setAvailableItineraries(histories);
      setShowItineraryModal(true);
  };

  const confirmShareItinerary = async (itineraryData: Itinerary) => {
      try {
          await sendMessage(activeSession, `Shared Itinerary: ${itineraryData.destination}`, 'itinerary', itineraryData);
          setShowItineraryModal(false);
      } catch (e) {
          alert("Failed to share");
      }
  };

  const handleEndChat = async () => {
      if (activeSession === 'ai') return;
      const confirmEnd = window.confirm("Are you sure you want to disconnect this session?");
      if (!confirmEnd) return;

      try {
          const endMsg = "🚫 The chat session has been ended by the user.";
          await sendMessage(activeSession, endMsg, 'text');
      } catch (e) {
          console.error("Failed to end chat");
      }
  };

  const handleTranslate = async (msgId: string, content: string) => {
    const lang = prompt("Enter target language (e.g., Hindi, French):");
    if (!lang) return;

    try {
        const translated = await translateText(content, lang);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translatedText: translated } : m));
    } catch (e) {
        alert("Translation failed");
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent, bookingId: string) => {
      e.stopPropagation();
      try {
          await updateBookingStatus(bookingId, 'approved');
          // Refresh list locally
          setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
          setActiveSession(bookingId);
      } catch (error) {
          console.error(error);
          alert("Failed to accept.");
      }
  };

  // Check if the last message indicates chat ended
  const lastMessage = messages[messages.length - 1];
  // Fix: Safe access to content or text from union type ChatMessage | RealtimeMessage to resolve line 206 errors.
  const lastMsgString = lastMessage ? (
    'content' in lastMessage ? (lastMessage as RealtimeMessage).content : 
    'text' in lastMessage ? (lastMessage as ChatMessage).text : ""
  ) : "";
  const isChatEnded = activeSession !== 'ai' && lastMsgString.includes("chat session has been ended");

  const activeBookings = bookings.filter(b => b.status === 'approved');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  // Determine Chat Header Name
  const currentBooking = bookings.find(b => b.id === activeSession);
  
  const getPartnerName = (b: Booking) => {
      if (userRole === 'user') {
          return b.guide?.name || 'Guide';
      } else {
          // Guide viewing traveler
          if (b.traveler?.first_name) {
              return `${b.traveler.first_name} ${b.traveler.last_name || ''}`.trim();
          }
          return b.traveler?.email || 'Traveler';
      }
  };

  const chatPartnerName = activeSession === 'ai' 
      ? 'AI Concierge' 
      : (currentBooking 
          ? getPartnerName(currentBooking)
          : 'Secure Protocol Channel');

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 h-[90vh] flex gap-6 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <style>{`
         .chat-glass {
             background: rgba(15, 23, 42, 0.75);
             backdrop-filter: blur(24px);
             border: 1px solid rgba(255, 255, 255, 0.08);
             box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
         }
         .active-contact {
             background: linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, transparent 100%);
             border-left: 3px solid #ec4899;
         }
         .message-bubble-user {
             background: linear-gradient(135deg, #db2777 0%, #f97316 100%);
             box-shadow: 0 4px 15px rgba(219, 39, 119, 0.3);
         }
         .message-bubble-ai {
             background: rgba(255, 255, 255, 0.05);
             border: 1px solid rgba(255, 255, 255, 0.1);
             backdrop-filter: blur(10px);
         }
         .chat-scroll::-webkit-scrollbar { width: 4px; }
         .chat-scroll::-webkit-scrollbar-track { background: transparent; }
         .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
         .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(236,72,153,0.5); }
      `}</style>

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-6 overflow-y-auto transition-transform duration-300 ease-in-out chat-scroll
        md:static md:w-1/4 md:chat-glass md:rounded-[2.5rem] md:block md:bg-transparent md:backdrop-blur-none
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
         <div className="flex justify-between items-center md:hidden mb-8">
            <h3 className="text-white font-black uppercase tracking-widest text-xs">Neural Connections</h3>
            <button onClick={() => setShowMobileSidebar(false)} className="text-white bg-white/10 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         <div className="hidden md:block">
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 font-black uppercase tracking-widest text-xs mb-8">Neural Connections</h3>
         </div>
         
         <div className="space-y-4">
            <div 
                onClick={() => { setActiveSession('ai'); setShowMobileSidebar(false); }}
                className={`p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all flex items-center gap-4 group ${activeSession === 'ai' ? 'active-contact' : 'border border-transparent'}`}
            >
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-orange-500 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">AI</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">AI Concierge</div>
                    <div className="text-emerald-500 text-[10px] uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/5 my-6 mx-2"></div>
            
            {/* ACTIVE LIST */}
            {activeBookings.length > 0 && <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Active Protocols</div>}
            
            {activeBookings.map(b => {
                const partnerName = getPartnerName(b);
                return (
                    <div 
                        key={b.id}
                        onClick={() => { setActiveSession(b.id); setShowMobileSidebar(false); }}
                        className={`p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all flex items-center gap-4 ${activeSession === b.id ? 'active-contact' : 'border border-transparent'}`}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white/10">
                                {partnerName?.[0] || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-white font-bold text-sm truncate">{partnerName}</div>
                            <div className="text-slate-400 text-[10px] uppercase font-medium">Connected</div>
                        </div>
                    </div>
                )
            })}

            {/* PENDING LIST */}
            {pendingBookings.length > 0 && (
                <>
                    <div className="h-px bg-white/5 my-6 mx-2"></div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Pending Requests</div>
                    {pendingBookings.map(b => {
                        const partnerName = getPartnerName(b);
                        return (
                            <div 
                                key={b.id}
                                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-3"
                            >
                                <div className="flex items-center gap-3 opacity-70">
                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs border border-white/10">
                                        {partnerName?.[0] || '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-white font-bold text-xs truncate">{partnerName}</div>
                                        <div className="text-amber-500 text-[9px] uppercase">Awaiting Approval</div>
                                    </div>
                                </div>
                                {userRole === 'guide' && (
                                    <button 
                                        onClick={(e) => handleAcceptRequest(e, b.id)}
                                        className="w-full py-2 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                                    >
                                        Accept Protocol
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </>
            )}

            {bookings.length === 0 && <div className="text-slate-600 text-xs italic text-center py-4">No active protocols</div>}
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 chat-glass rounded-[2.5rem] flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md gap-4">
             <div className="flex items-center gap-4 flex-1 overflow-hidden">
                 <button onClick={() => setShowMobileSidebar(true)} className="md:hidden text-slate-400 hover:text-white transition-colors flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                 </button>
                 <div className="flex flex-col overflow-hidden">
                    <div className="text-white font-black uppercase tracking-widest text-sm truncate">
                        {chatPartnerName}
                    </div>
                    {activeSession === 'ai' && <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>Live Neural Link</div>}
                 </div>
             </div>
             
             {activeSession !== 'ai' && bookings.find(b=>b.id === activeSession)?.status === 'approved' && (
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={handleShareItinerary} 
                        className="bg-pink-600/10 text-pink-500 border border-pink-500/20 hover:bg-pink-600 hover:text-white p-2 md:px-5 md:py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"
                        title="Share Itinerary"
                     >
                         <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                         <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Share Itinerary</span>
                     </button>
                     <button 
                        onClick={handleEndChat}
                        disabled={isChatEnded}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white p-2 md:px-4 md:py-2.5 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="End Chat"
                     >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>
             )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 chat-scroll" ref={scrollRef}>
             {activeSession !== 'ai' && bookings.find(b=>b.id === activeSession)?.status === 'pending' ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 animate-pulse border border-amber-500/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Connection Pending</h3>
                    <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium">
                        {userRole === 'user' 
                         ? "Waiting for the guide to accept your secure protocol request." 
                         : "Please accept the request in the sidebar to begin transmission."}
                    </p>
                </div>
             ) : (
                 messages.map((m: any, idx) => {
                     const isMe = m.sender === 'user' || m.sender_id === userId;
                     const isSystem = m.sender === 'system' || m.id === 'system-disclaimer';
                     
                     if (isSystem) {
                         // Styled differently for System Messages / Disclaimers
                         return (
                             <div key={m.id || idx} className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
                                 <div className={`max-w-[90%] rounded-xl p-3 text-center border ${m.content?.includes("SECURITY") ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                     <p className="text-[10px] font-black uppercase tracking-wide">{m.content || m.text}</p>
                                 </div>
                             </div>
                         );
                     }

                     return (
                         <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                             <div className={`max-w-[85%] sm:max-w-[70%] rounded-[1.5rem] p-5 shadow-2xl relative ${isMe ? 'message-bubble-user text-white rounded-br-none' : 'message-bubble-ai text-slate-200 rounded-bl-none'}`}>
                                 {m.message_type === 'itinerary' ? (
                                     <div 
                                        className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer group relative overflow-hidden shadow-2xl"
                                        onClick={() => m.metadata && setViewingItinerary(m.metadata)}
                                     >
                                         <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/20 blur-xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                         <div className="flex justify-between items-start mb-3 relative z-10">
                                             <div className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Itinerary Shared</div>
                                             <div className="bg-white/10 text-white p-2 rounded-full group-hover:bg-pink-600 transition-colors">
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                             </div>
                                         </div>
                                         <div className="font-black text-xl mb-1 text-white relative z-10">{m.metadata?.destination}</div>
                                         <div className="text-xs text-slate-400 font-bold relative z-10">{m.metadata?.duration} Days • {m.metadata?.theme}</div>
                                     </div>
                                 ) : (
                                     <p className="text-sm font-medium leading-relaxed tracking-wide">{m.content || m.text}</p>
                                 )}
                                 
                                 {m.translatedText && (
                                     <div className="mt-3 pt-3 border-t border-white/20 text-xs italic text-orange-200 font-medium">
                                         {m.translatedText}
                                     </div>
                                 )}

                                 <div className={`mt-2 flex items-center gap-4 ${isMe ? 'justify-end text-pink-200/70' : 'justify-between text-slate-500'}`}>
                                     <span className="text-[9px] uppercase font-bold">{new Date(m.created_at || m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                     {!isMe && m.message_type !== 'itinerary' && (
                                         <button onClick={() => handleTranslate(m.id, m.content || m.text)} className="text-[9px] uppercase font-black hover:text-white transition-colors">Translate</button>
                                     )}
                                 </div>
                             </div>
                         </div>
                     )
                 })
             )}
             {isTyping && (
                 <div className="flex justify-start animate-in fade-in">
                     <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
                         <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                     </div>
                 </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900/40 border-t border-white/5 backdrop-blur-md">
              <div className="flex gap-4 items-center">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isChatEnded || (activeSession !== 'ai' && bookings.find(b=>b.id === activeSession)?.status !== 'approved')}
                    placeholder={
                        isChatEnded ? "Session Disconnected." :
                        activeSession !== 'ai' && bookings.find(b=>b.id === activeSession)?.status !== 'approved' ? "Waiting for acceptance..." : "Type your message..."
                    }
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:border-pink-500/50 focus:bg-black/60 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-inner"
                 />
                 <button 
                    onClick={handleSend} 
                    disabled={isChatEnded || (activeSession !== 'ai' && bookings.find(b=>b.id === activeSession)?.status !== 'approved')}
                    className="bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white p-4 rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                 >
                    <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
              </div>
          </div>
      </div>

      {/* Itinerary Modal */}
      {showItineraryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowItineraryModal(false)}></div>
              <div className="relative bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                  <h3 className="text-white font-black text-xl mb-6 uppercase tracking-tight">Share Blueprint</h3>
                  <div className="space-y-3">
                      {availableItineraries.map((it: any) => (
                          <div key={it.id} onClick={() => confirmShareItinerary(it.data)} className="p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                              <div>
                                  <div className="text-white font-bold mb-1">{it.data.destination}</div>
                                  <div className="text-slate-500 text-xs font-medium">{it.data.duration} Days • {new Date(it.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setShowItineraryModal(false)} className="mt-8 w-full py-4 bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Cancel</button>
              </div>
          </div>
      )}

      {/* Full View Itinerary Modal */}
      {viewingItinerary && (
        <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
            <TripDetails 
              itinerary={viewingItinerary} 
              onBack={() => setViewingItinerary(null)} 
              onBookGuide={() => setViewingItinerary(null)} 
              viewOnly={true}
            />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
