
import React, { useState, useEffect, useRef } from 'react';
import { chatWithLocalAI, translateText, analyzeLocationImage, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ImageMessage extends ChatMessage {
  imagePreview?: string;
  isTranslating?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ImageMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; preview: string; mimeType: string } | null>(null);
  const [customLanguage, setCustomLanguage] = useState<Record<string, string>>({}); // msgId -> language string
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: 'Namaste! I am your AI Journey Concierge. Whether you have a photo of a mysterious landmark or a complex cultural query, I am here to synthesize Bharat for you.',
        timestamp: new Date()
      }]);
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
          base64: base64String,
          preview: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeechOutput = async (id: string, text: string) => {
    if (isPlaying === id) return;
    setIsPlaying(id);

    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(null);
        source.start();
      } else {
        setIsPlaying(null);
      }
    } catch (error) {
      console.error("TTS failed", error);
      setIsPlaying(null);
    }
  };

  // Audio Processing Helpers
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    const currentInput = input;

    const userMsg: ImageMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentInput || 'Deconstructing visual node...',
      imagePreview: currentImage?.preview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      let response = '';
      if (currentImage) {
        response = await analyzeLocationImage(currentImage.base64, currentImage.mimeType) || 'Unable to resolve heritage markers.';
      } else {
        response = await chatWithLocalAI(currentInput, "General India Tourism Concierge") || 'Synthesis failure in cultural processing.';
      }

      const aiMsg: ImageMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ImageMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Neural processing interrupt. Requesting signal re-establishment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTranslate = async (msgId: string) => {
    const language = customLanguage[msgId];
    if (!language || !language.trim()) return;

    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    // Set loading state for this message
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTranslating: true } : m));

    try {
      const translated = await translateText(messages[msgIndex].text, language);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translatedText: translated, isTranslating: false } : m));
    } catch (error) {
      alert("Linguistic bridge failure.");
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTranslating: false } : m));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col h-[96vh] bg-slate-950">
      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .message-bubble-ai {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.4);
        }
        .message-bubble-user {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          box-shadow: 0 15px 40px -10px rgba(236, 72, 153, 0.3);
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #ec4899;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .input-bar-gradient {
          background: linear-gradient(to bottom, transparent, rgba(2, 6, 23, 0.8));
        }
      `}</style>
      
      <div className="glass-panel rounded-[3rem] shadow-2xl flex flex-col overflow-hidden h-full relative border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

        {/* Header */}
        <div className="bg-slate-900/30 p-8 md:p-10 flex items-center justify-between text-white flex-shrink-0 border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-14 h-14 saffron-gradient rounded-full flex items-center justify-center font-black text-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                LL
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-black text-xl md:text-2xl tracking-tighter">AI Journey <span className="textile-gradient">Concierge</span></h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Neural Synthesis Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden sm:flex flex-col items-end mr-6">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Latency</span>
                <span className="text-sm font-black text-emerald-400">Stable • 142ms</span>
             </div>
             <button className="text-slate-500 hover:text-pink-500 transition-all p-3 bg-white/5 rounded-full border border-white/5 shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
          </div>
        </div>

        {/* Message Pool */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 md:p-14 space-y-14 scroll-smooth no-scrollbar relative z-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[75%] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl relative group transition-all duration-700 hover:scale-[1.005] ${msg.sender === 'user' ? 'message-bubble-user text-white' : 'message-bubble-ai text-slate-100'}`}>
                
                {msg.sender === 'ai' && (
                  <div className="absolute -left-5 -top-5 w-12 h-12 saffron-gradient rounded-full flex items-center justify-center text-[11px] font-black text-white border-4 border-slate-900 shadow-2xl">AI</div>
                )}

                {msg.imagePreview && (
                  <div className="mb-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 relative group/img">
                    <img src={msg.imagePreview} alt="Node snapshot" className="w-full h-auto max-h-[500px] object-cover" />
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                  </div>
                )}

                <div className="relative">
                  <p className="text-lg md:text-2xl leading-relaxed font-bold italic whitespace-pre-wrap tracking-tight pr-12">
                    {msg.sender === 'ai' ? (
                      <span className="relative">
                        <span className="absolute -left-6 top-0 text-pink-500 text-4xl opacity-30">"</span>
                        {msg.text}
                        <span className="absolute -right-6 bottom-0 text-pink-500 text-4xl opacity-30">"</span>
                      </span>
                    ) : msg.text}
                  </p>
                  
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => handleSpeechOutput(msg.id, msg.text)}
                      className={`absolute right-0 top-0 p-3 rounded-full bg-white/5 border border-white/10 transition-all ${isPlaying === msg.id ? 'text-pink-500 scale-125' : 'text-slate-500 hover:text-pink-500'}`}
                      title="Listen to original"
                    >
                      <svg className={`w-5 h-5 ${isPlaying === msg.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>

                {msg.translatedText && (
                  <div className="mt-10 pt-10 border-t border-white/10 italic text-base md:text-xl text-orange-400 font-bold tracking-tight relative pr-12">
                    <span className="block font-black uppercase mb-4 text-[11px] tracking-[0.5em] text-pink-500">Linguistic Bridge Node:</span>
                    {msg.translatedText}
                    <button 
                      onClick={() => handleSpeechOutput(msg.id + '_trans', msg.translatedText!)}
                      className={`absolute right-0 top-14 p-3 rounded-full bg-white/5 border border-white/10 transition-all ${isPlaying === msg.id + '_trans' ? 'text-pink-500 scale-125' : 'text-slate-500 hover:text-pink-500'}`}
                      title="Listen to translation"
                    >
                      <svg className={`w-5 h-5 ${isPlaying === msg.id + '_trans' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className={`text-[10px] font-black uppercase tracking-widest mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${msg.sender === 'user' ? 'justify-end text-white/40' : 'text-slate-600'}`}>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative flex items-center bg-white/5 rounded-full px-4 py-1 border border-white/10">
                        <input 
                          type="text" 
                          placeholder="Search language..."
                          value={customLanguage[msg.id] || ''}
                          onChange={(e) => setCustomLanguage(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleTranslate(msg.id)}
                          className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-white placeholder:text-slate-700 w-24 sm:w-32"
                        />
                        <button 
                          onClick={() => handleTranslate(msg.id)}
                          disabled={msg.isTranslating}
                          className="ml-2 text-pink-500 hover:text-pink-400 transition-colors disabled:opacity-30"
                        >
                          {msg.isTranslating ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                          )}
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => { setCustomLanguage(prev => ({ ...prev, [msg.id]: 'Hindi' })); handleTranslate(msg.id); }} className="hover:text-pink-500 transition-all">Hindi</button>
                        <button onClick={() => { setCustomLanguage(prev => ({ ...prev, [msg.id]: 'Tamil' })); handleTranslate(msg.id); }} className="hover:text-pink-500 transition-all">Tamil</button>
                        <button onClick={() => { setCustomLanguage(prev => ({ ...prev, [msg.id]: 'French' })); handleTranslate(msg.id); }} className="hover:text-pink-500 transition-all">French</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="message-bubble-ai rounded-[2rem] px-8 py-6 border border-white/5 flex items-center space-x-6">
                <div className="flex space-x-2">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] ml-2">Synthesizing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="absolute bottom-40 left-12 z-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-2 border-pink-500 flex items-center space-x-6 pr-10">
              <div className="relative">
                <img src={selectedImage.preview} className="w-24 h-24 object-cover rounded-[1rem] shadow-inner border border-white/10" alt="Preview" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rani-pink-bg rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-xl">IMG</div>
              </div>
              <div className="max-w-[180px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Visual Ingested</p>
                <p className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Ready for Scan</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 bg-white/5 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all border border-white/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-8 md:p-12 bg-slate-900/50 border-t border-white/5 flex-shrink-0 relative z-10 input-bar-gradient">
          <div className="relative flex items-center space-x-6 max-w-6xl mx-auto">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] border-2 transition-all flex items-center justify-center flex-shrink-0 ${selectedImage ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_40px_#ec4899]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-pink-500/50 hover:text-pink-500'}`}
                title="Ingest Visual Marker"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedImage ? "Execute visual synthesis..." : "Access the cultural vault..."}
                className="w-full pl-8 pr-44 sm:pr-56 py-6 md:py-8 bg-white/5 border-2 border-white/10 rounded-[2.5rem] focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500/50 outline-none transition text-lg md:text-2xl font-bold text-white placeholder:text-slate-800 shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !selectedImage}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-600 to-orange-500 hover:scale-[1.03] disabled:opacity-10 disabled:hover:scale-100 text-white px-8 sm:px-12 py-3.5 sm:py-4.5 rounded-[1.8rem] transition-all font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-xl"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
