
import React, { useState, useEffect, useRef } from 'react';
import { chatWithLocalAI, translateText } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: 'Namaste! I am your AI concierge for BharatYatra. How can I help you explore India today?',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithLocalAI(input, "General India Tourism");
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
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
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-[70vh]">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden h-full border border-gray-100">
        <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 saffron-gradient rounded-full flex items-center justify-center font-bold">BY</div>
            <div>
              <h3 className="font-bold">BharatYatra Concierge</h3>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-400">Always online for you</span>
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-gray-100'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.translatedText && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 italic text-xs opacity-80">
                    <span className="block font-bold uppercase mb-1">Translation:</span>
                    {msg.translatedText}
                  </div>
                )}
                <div className={`text-[10px] mt-2 opacity-50 flex items-center space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'ai' && (
                    <div className="hidden group-hover:flex space-x-2 transition">
                      <button onClick={() => handleTranslate(msg.id, 'Hindi')} className="hover:text-orange-500 font-bold">Hindi</button>
                      <button onClick={() => handleTranslate(msg.id, 'French')} className="hover:text-orange-500 font-bold">French</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about local customs, hidden gems, or safety..."
              className="w-full pl-6 pr-20 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 bg-slate-900 hover:bg-orange-600 text-white px-6 py-2 rounded-xl transition font-bold"
            >
              Send
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-xs text-slate-400 font-medium overflow-x-auto whitespace-nowrap pb-2">
            <span>Suggestions:</span>
            <button onClick={() => setInput("What are the must-try foods in Jaipur?")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition">Jaipur Food</button>
            <button onClick={() => setInput("Tell me about the history of the Taj Mahal.")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition">Taj Mahal History</button>
            <button onClick={() => setInput("How to respectfully visit a temple?")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition">Temple Etiquette</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
