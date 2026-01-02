
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
      text: currentInput || 'Processing visual coordinate...',
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
    <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col h-[92vh] bg-slate-950">
      <style>{`
        .chat-glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
        }
        .ai-bubble {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.4);
        }
        .user-bubble {
          background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
          box-shadow: 0 20px 50px -10px rgba(236, 72, 153, 0.3);
        }
        .typing-pulse {
          animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      
      <div className="chat-glass rounded-[4rem] flex flex-col overflow-hidden h-full relative">
        {/* Header */}
        <div className="bg-slate-900/40 p-10 md:p-14 flex items-center justify-between text-white border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-10">
            <div className="relative">
              <div className="w-16 h-16 rani-pink-bg rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-3xl">
                LL
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg"></div>
            </div>
            <div>
              <h3 className="font-black text-3xl tracking-tighter">AI <span className="textile-gradient">Concierge</span></h3>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Neural Sync Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-8">
             <div className="hidden lg:flex flex-col items-end mr-8">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Latency</span>
                <span className="text-sm font-black text-emerald-400 tracking-tight">Stable • 142ms</span>
             </div>
             <button className="text-slate-500 hover:text-white transition-all p-4 bg-white/5 rounded-2xl border border-white/10">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 md:p-20 space-y-16 no-scrollbar relative z-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-[3rem] p-10 sm:p-14 shadow-3xl relative transition-all duration-700 hover:translate-y-[-4px] ${msg.sender === 'user' ? 'user-bubble text-white' : 'ai-bubble text-slate-100'}`}>
                
                {msg.sender === 'ai' && (
                  <div className="absolute -left-6 -top-6 w-14 h-14 rani-pink-bg rounded-2xl flex items-center justify-center text-[11px] font-black text-white border-4 border-slate-900 shadow-2xl">AI</div>
                )}

                {msg.imagePreview && (
                  <div className="mb-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                    <img src={msg.imagePreview} alt="Uploaded marker" className="w-full h-auto max-h-[600px] object-cover" />
                  </div>
                )}

                <div className="relative">
                  <p className="text-xl md:text-3xl leading-relaxed font-bold italic tracking-tight pr-14 whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => handleSpeechOutput(msg.id, msg.text)}
                      className={`absolute right-0 top-0 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all ${isPlaying === msg.id ? 'text-pink-500 scale-125' : 'text-slate-500 hover:text-pink-500'}`}
                    >
                      <svg className={`w-6 h-6 ${isPlaying === msg.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>

                {msg.translatedText && (
                  <div className="mt-12 pt-12 border-t border-white/10 text-xl md:text-3xl text-orange-400 font-bold italic tracking-tight relative pr-14">
                    <span className="block font-black uppercase mb-6 text-[11px] tracking-[0.5em] text-pink-500">Linguistic Bridge Node:</span>
                    {msg.translatedText}
                    <button 
                      onClick={() => handleSpeechOutput(msg.id + '_trans', msg.translatedText!)}
                      className={`absolute right-0 top-16 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all ${isPlaying === msg.id + '_trans' ? 'text-pink-500 scale-125' : 'text-slate-500 hover:text-pink-500'}`}
                    >
                      <svg className={`w-6 h-6 ${isPlaying === msg.id + '_trans' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className={`mt-10 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 ${msg.sender === 'user' ? 'text-white/40' : 'text-slate-600'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex bg-black/40 rounded-full px-6 py-2 border border-white/5">
                        <input 
                          type="text" 
                          placeholder="Search target language..."
                          value={customLanguage[msg.id] || ''}
                          onChange={(e) => setCustomLanguage(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleTranslate(msg.id)}
                          className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-white placeholder:text-slate-700 w-32"
                        />
                        <button 
                          onClick={() => handleTranslate(msg.id)}
                          className="ml-4 text-pink-500 hover:scale-125 transition-all"
                        >
                          {msg.isTranslating ? '...' : '→'}
                        </button>
                      </div>
                      <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                        <button onClick={() => { setCustomLanguage(prev => ({ ...prev, [msg.id]: 'Hindi' })); handleTranslate(msg.id); }} className="hover:text-pink-500 transition-colors">Hindi</button>
                        <button onClick={() => { setCustomLanguage(prev => ({ ...prev, [msg.id]: 'French' })); handleTranslate(msg.id); }} className="hover:text-pink-500 transition-colors">French</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="ai-bubble rounded-[2.5rem] px-10 py-8 border border-white/5 flex items-center space-x-6">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full typing-pulse"></div>
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full typing-pulse delay-75"></div>
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full typing-pulse delay-150"></div>
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Synthesizing Narrative...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-10 md:p-14 bg-slate-900/60 border-t border-white/10 relative z-10 backdrop-blur-3xl">
          <div className="relative flex items-center space-x-8 max-w-7xl mx-auto">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] border-2 transition-all flex items-center justify-center flex-shrink-0 ${selectedImage ? 'bg-pink-600 border-pink-500 text-white shadow-3xl' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30 hover:text-white'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedImage ? "Execute image synthesis..." : "Access the cultural database..."}
                className="w-full pl-10 pr-56 py-8 md:py-10 bg-black/40 border-2 border-white/10 rounded-[3rem] focus:border-pink-500 transition-all text-xl md:text-3xl font-bold text-white placeholder:text-slate-800 shadow-inner outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !selectedImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-slate-950 hover:bg-pink-500 hover:text-white transition-all px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl active:scale-95 disabled:opacity-10"
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
