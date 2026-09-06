import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to Rahul Jewellers (Sheoganj). How can I assist you with our gold schemes or jewelry collections today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/support/chat`, { message: userText }, requestConfig);
      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please reach us directly on WhatsApp at +91 9950091024.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
          title="Chat with AI Support"
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      ) : (
        <div className="bg-white w-80 sm:w-96 h-[480px] rounded-3xl border-2 border-stone-900 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 text-amber-400 p-4 flex justify-between items-center border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-white">Rahul Jewellers AI</h3>
                <p className="text-[9px] text-amber-400/80 font-mono">Online • Sheoganj Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[75%] leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-amber-900 text-white rounded-br-none' 
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-stone-400 italic text-[11px]">
                <Bot className="w-3.5 h-3.5 animate-spin text-amber-600" /> Assistant is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask about schemes, gold prices..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 bg-amber-900 hover:bg-stone-900 text-white rounded-xl transition cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}