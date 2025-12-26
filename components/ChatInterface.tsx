
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
        text: 'Namaste! I am your AI concierge for BharatYatra. You can ask me questions or upload a photo of any location to uncover its hidden stories. How can I help you explore India today?',
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
      text: currentInput || 'Analyzing this location...',
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
        response = await analyzeLocationImage(currentImage.base64, currentImage.mimeType) || 'I am sorry, I could not analyze this image.';
      } else {
        response = await chatWithLocalAI(currentInput, "General India Tourism") || 'I am sorry, I could not process your request.';
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
        text: "I encountered an error while exploring that for you. Please try again.",
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
      alert("Translation failed.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col h-[75vh] md:h-[80vh]">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden h-full border border-gray-100 relative">
        <div className="bg-slate-900 p-4 md:p-6 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-8 h-8 md:w-10 md:h-10 saffron-gradient rounded-full flex items-center justify-center font-bold text-sm md:text-base">BY</div>
            <div>
              <h3 className="font-bold text-sm md:text-base">BharatYatra Concierge</h3>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] md:text-xs text-slate-400">Expert Mode: Storyteller</span>
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm relative group ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-gray-100'}`}>
                {msg.imagePreview && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-inner border border-slate-700/20">
                    <img src={msg.imagePreview} alt="Uploaded location" className="w-full h-auto max-h-[300px] object-cover" />
                  </div>
                )}
                <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                {msg.translatedText && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50 italic text-xs md:text-sm opacity-80">
                    <span className="block font-black uppercase mb-2 text-[10px] tracking-widest text-orange-500">Translation:</span>
                    {msg.translatedText}
                  </div>
                )}
                <div className={`text-[9px] md:text-[10px] mt-3 opacity-50 flex items-center space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-bold">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="hidden group-hover:flex space-x-3 transition">
                      <button onClick={() => handleTranslate(msg.id, 'Hindi')} className="hover:text-orange-500 font-black uppercase tracking-tighter">Hindi</button>
                      <button onClick={() => handleTranslate(msg.id, 'French')} className="hover:text-orange-500 font-black uppercase tracking-tighter">French</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Exploring...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Image Preview (Toast-like) */}
        {selectedImage && (
          <div className="absolute bottom-24 md:bottom-28 left-4 md:left-8 z-20 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-2 rounded-2xl shadow-2xl border-2 border-orange-500 flex items-center space-x-3">
              <img src={selectedImage.preview} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl shadow-inner" alt="Preview" />
              <div className="pr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected View</p>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">Ready to analyze</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-6 h-6 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-8 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="relative flex items-center space-x-3 md:space-x-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 md:p-4 rounded-2xl border-2 transition-all flex-shrink-0 ${selectedImage ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'}`}
              title="Upload location photo"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedImage ? "Add comments or hit send..." : "Ask about local customs, hidden gems..."}
                className="w-full pl-5 pr-16 py-3 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl md:rounded-3xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white outline-none transition text-sm md:text-base font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() && !selectedImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-orange-600 disabled:opacity-30 disabled:hover:bg-slate-900 text-white px-5 py-2 rounded-xl md:rounded-2xl transition font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-4 text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            <span className="flex-shrink-0">Suggestions:</span>
            <button onClick={() => setInput("What are the must-try foods in Jaipur?")} className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-3 py-1 rounded-lg transition">Jaipur Food</button>
            <button onClick={() => setInput("Tell me about the history of the Taj Mahal.")} className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-3 py-1 rounded-lg transition">Taj Mahal History</button>
            <button onClick={() => setInput("How to respectfully visit a temple?")} className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-3 py-1 rounded-lg transition">Temple Etiquette</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
