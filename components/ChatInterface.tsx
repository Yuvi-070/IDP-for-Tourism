
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Expand height to wrap text
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col h-[95vh] bg-slate-950">
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media (max-width: 640px) {
          .chat-glass { border-radius: 2rem !important; height: 100% !important; }
          .message-container { padding: 1rem !important; flex: 1 !important; }
          .bubble-padding { padding: 1.25rem !important; }
          .header-padding { padding: 1.25rem !important; }
          .input-padding { padding: 1rem !important; }
          .ai-bubble, .user-bubble { max-width: 95% !important; }
        }
      `}</style>
      
      <div className="chat-glass rounded-[3rem] sm:rounded-[4rem] flex flex-col overflow-hidden h-full relative">
        {/* Header */}
        <div className="bg-slate-900/40 header-padding p-8 sm:p-14 flex items-center justify-between text-white border-b border-white/5 relative z-10 shrink-0">
          <div className="flex items-center space-x-4 sm:space-x-10">
            <div className="relative">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rani-pink-bg rounded-[0.75rem] sm:rounded-[1.5rem] flex items-center justify-center font-black text-lg sm:text-2xl shadow-3xl">
                LL
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-6 sm:h-6 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg"></div>
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-3xl tracking-tighter">AI <span className="textile-gradient">Concierge</span></h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-500">Neural Sync Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-8">
             <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Latency</span>
                <span className="text-xs font-black text-emerald-400 tracking-tight">Stable • 142ms</span>
             </div>
             <button className="text-slate-500 hover:text-white transition-all p-2 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                <svg className="w-4 h-4 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
             </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto message-container p-6 sm:p-14 md:p-20 space-y-8 sm:space-y-16 no-scrollbar relative z-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[80%] rounded-[1.5rem] sm:rounded-[3rem] bubble-padding p-6 sm:p-12 shadow-3xl relative transition-all duration-700 ${msg.sender === 'user' ? 'user-bubble text-white' : 'ai-bubble text-slate-100'}`}>
                
                {msg.sender === 'ai' && (
                  <div className="absolute -left-2 -top-2 sm:-left-6 sm:-top-6 w-8 h-8 sm:w-14 sm:h-14 rani-pink-bg rounded-lg sm:rounded-2xl flex items-center justify-center text-[7px] sm:text-[11px] font-black text-white border-2 border-slate-900 shadow-2xl">AI</div>
                )}

                {msg.imagePreview && (
                  <div className="mb-4 sm:mb-8 rounded-[1rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/10">
                    <img src={msg.imagePreview} alt="Uploaded marker" className="w-full h-auto max-h-[300px] sm:max-h-[500px] object-cover" />
                  </div>
                )}

                <div className="relative">
                  <p className="text-sm sm:text-xl md:text-2xl leading-relaxed font-bold italic tracking-tight pr-0 sm:pr-14 whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => handleSpeechOutput(msg.id, msg.text)}
                      className={`mt-3 sm:mt-0 sm:absolute right-0 top-0 p-2 sm:p-4 rounded-xl bg-white/5 border border-white/10 transition-all ${isPlaying === msg.id ? 'text-pink-500 scale-110' : 'text-slate-500 hover:text-pink-500'}`}
                    >
                      <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${isPlaying === msg.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>

                {msg.translatedText && (
                  <div className="mt-6 pt-6 sm:mt-10 sm:pt-10 border-t border-white/10 text-sm sm:text-xl md:text-2xl text-orange-400 font-bold italic tracking-tight relative">
                    <span className="block font-black uppercase mb-3 sm:mb-6 text-[8px] sm:text-[11px] tracking-[0.4em] text-pink-500">Translation:</span>
                    <p className="break-words">{msg.translatedText}</p>
                  </div>
                )}

                <div className={`mt-6 pt-6 sm:mt-8 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${msg.sender === 'user' ? 'text-white/40' : 'text-slate-600'}`}>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <div className="flex bg-black/40 rounded-full px-4 py-1.5 border border-white/5 flex-grow sm:flex-grow-0">
                        <input 
                          type="text" 
                          placeholder="Translate..."
                          value={customLanguage[msg.id] || ''}
                          onChange={(e) => setCustomLanguage(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleTranslate(msg.id)}
                          className="bg-transparent border-none outline-none text-[8px] sm:text-[10px] font-black uppercase text-white placeholder:text-slate-700 w-full sm:w-24"
                        />
                        <button onClick={() => handleTranslate(msg.id)} className="ml-2 text-pink-500 hover:scale-110 transition-all font-black">
                          {msg.isTranslating ? '...' : '→'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="ai-bubble rounded-[1.5rem] px-8 py-5 border border-white/5 flex items-center space-x-4">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="input-padding p-6 sm:p-12 bg-slate-900/60 border-t border-white/10 relative z-10 backdrop-blur-3xl shrink-0">
          <div className="relative flex items-end space-x-3 sm:space-x-8 max-w-5xl mx-auto">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] border-2 transition-all flex items-center justify-center flex-shrink-0 mb-0.5 ${selectedImage ? 'bg-pink-600 border-pink-500 text-white shadow-3xl' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30 hover:text-white'}`}
            >
              <svg className="w-6 h-6 sm:w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            
            <div className="relative flex-grow flex items-end">
              <textarea 
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={selectedImage ? "Synthesize visual data..." : "Ask your cultural guide..."}
                className="w-full pl-6 pr-24 sm:pl-10 sm:pr-40 py-4 sm:py-7 bg-black/40 border-2 border-white/10 rounded-[1.5rem] sm:rounded-[3rem] focus:border-pink-500 transition-all text-sm sm:text-xl font-bold text-white placeholder:text-slate-800 outline-none resize-none overflow-y-auto no-scrollbar min-h-[56px] sm:min-h-[72px]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !selectedImage}
                className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 bg-white text-slate-950 hover:bg-pink-500 hover:text-white transition-all px-6 sm:px-12 py-2 sm:py-4 rounded-xl sm:rounded-[2rem] font-black uppercase text-[8px] sm:text-[11px] tracking-widest shadow-2xl active:scale-95 disabled:opacity-0"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
