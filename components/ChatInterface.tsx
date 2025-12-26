
import React, { useState, useEffect, useRef } from 'react';
import { chatWithLocalAI, translateText, analyzeLocationImage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ImageMessage extends ChatMessage {
  imagePreview?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ImageMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; preview: string; mimeType: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: 'Namaste! I am your AI Journey Concierge. Upload a fragment of your visual reality or ask any cultural query to initiate deep-grounded analysis.',
        timestamp: new Date()
      }]);
    }
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

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    const currentInput = input;

    const userMsg: ImageMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentInput || 'Analyzing high-resolution visual node...',
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
        text: "Neural processing interrupt. Request re-initialization.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTranslate = async (msgId: string, language: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    try {
      const translated = await translateText(messages[msgIndex].text, language);
      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], translatedText: translated };
      setMessages(updatedMessages);
    } catch (error) {
      alert("Translation protocol failed.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 flex flex-col h-[85vh] bg-slate-950">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden h-full border border-white/5 relative">
        {/* Header */}
        <div className="bg-slate-900/80 p-6 md:p-8 flex items-center justify-between text-white flex-shrink-0 border-b border-white/5">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 saffron-gradient rounded-full flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">BY</div>
            <div>
              <h3 className="font-black text-base md:text-xl tracking-tighter">Journey Concierge <span className="text-pink-500">v2.5</span></h3>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_#ec4899]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Link: Storyteller</span>
              </div>
            </div>
          </div>
          <button className="text-slate-600 hover:text-pink-500 transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        {/* Message Pool */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 md:p-12 space-y-10 scroll-smooth no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative group ${msg.sender === 'user' ? 'bg-pink-600 text-white' : 'bg-slate-800/80 text-slate-200 border border-white/5'}`}>
                {msg.imagePreview && (
                  <div className="mb-8 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10">
                    <img src={msg.imagePreview} alt="Node snapshot" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}
                <p className="text-base md:text-xl leading-relaxed font-bold italic whitespace-pre-wrap">{msg.text}</p>
                {msg.translatedText && (
                  <div className="mt-8 pt-8 border-t border-white/10 italic text-sm md:text-lg opacity-80 text-orange-400 font-black tracking-tight">
                    <span className="block font-black uppercase mb-3 text-[10px] tracking-[0.4em] text-pink-500">Linguistic Bridge:</span>
                    {msg.translatedText}
                  </div>
                )}
                <div className={`text-[9px] font-black uppercase tracking-widest mt-6 flex items-center space-x-6 ${msg.sender === 'user' ? 'justify-end text-white/50' : 'justify-start text-slate-500'}`}>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-4 transition-opacity duration-500">
                      <button onClick={() => handleTranslate(msg.id, 'Hindi')} className="hover:text-pink-500 transition-colors">Hindi</button>
                      <button onClick={() => handleTranslate(msg.id, 'French')} className="hover:text-pink-500 transition-colors">French</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 rounded-[2rem] px-8 py-5 border border-white/5 flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Grounded Synthesis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Image Preview (Floating) */}
        {selectedImage && (
          <div className="absolute bottom-32 left-10 z-20 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900 p-3 rounded-[2rem] shadow-[0_0_50px_rgba(236,72,153,0.3)] border-2 border-pink-500 flex items-center space-x-6 pr-10">
              <img src={selectedImage.preview} className="w-20 h-20 object-cover rounded-2xl shadow-inner" alt="Preview" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visual Input Active</p>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Ready for Analysis</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 bg-white/5 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-8 md:p-12 bg-slate-900/40 border-t border-white/5 flex-shrink-0">
          <div className="relative flex items-center space-x-6">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 md:p-6 rounded-[1.5rem] border-2 transition-all flex-shrink-0 ${selectedImage ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_20px_#ec4899]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-pink-500/50 hover:text-pink-500'}`}
              title="Capture Heritage Marker"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedImage ? "Describe intent or execute analysis..." : "Query the cultural vault..."}
                className="w-full pl-8 pr-32 py-5 md:py-7 bg-white/5 border-2 border-white/10 rounded-[2rem] focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500/50 outline-none transition text-base md:text-xl font-bold text-white placeholder:text-slate-700"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !selectedImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-600 to-orange-500 hover:scale-105 disabled:opacity-20 disabled:hover:scale-100 text-white px-8 py-3 rounded-2xl transition-all font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl"
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
