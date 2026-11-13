
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  MessageCircle,
  Sparkles,
  Phone
} from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';
const STORE_PHONE = '9950091024';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to Rahul Jewellers, Sheoganj. How may I assist you with our jewellery collections or gold scheme today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWhatsAppHandoff, setShowWhatsAppHandoff] = useState(false);

  const chatEndRef = useRef(null);
  const latestUserMessageRef = useRef('Hello');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();

    latestUserMessageRef.current = userText;

    setInputMessage('');
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userText }
    ]);

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/support/chat`,
        { message: userText },
        requestConfig
      );

      if (res.data.success) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: res.data.reply }
        ]);

        setMessages(prev => {
          if (prev.filter(m => m.sender === 'user').length >= 2) {
            setShowWhatsAppHandoff(true);
          }
          return prev;
        });
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: 'I could not process your request right now. Please contact our support team on WhatsApp.'
          }
        ]);
        setShowWhatsAppHandoff(true);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I am having trouble connecting right now. Our WhatsApp support team will be happy to help you.'
        }
      ]);
      setShowWhatsAppHandoff(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppTransfer = () => {
    const lastUserQuery = latestUserMessageRef.current || 'Hello';

    const message = `Namaste Rahul Jewellers, I was chatting with your AI assistant and would like human support regarding: "${lastUserQuery}"`;

    const waUrl = `https://wa.me/91${STORE_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-[999] font-sans sm:bottom-6 sm:right-6">

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Chat with Rahul Jewellers"
          aria-label="Open customer support chat"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full border border-[#d9bd83]/70 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(145deg, #d8bd83, #a47b43)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}
        >
          <MessageSquare className="h-7 w-7 text-[#1b1110]" />

          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[#171011] bg-emerald-500" />
          </span>

          <span className="pointer-events-none absolute bottom-[72px] right-0 w-max rounded-lg border border-[#c9a76b]/30 bg-[#171011] px-3 py-2 text-[10px] font-semibold tracking-wide text-[#ead9b6] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            Chat with us
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="flex h-[min(560px,calc(100dvh-110px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border shadow-2xl"
          style={{
            background: '#130e0f',
            borderColor: 'rgba(201,167,107,0.42)',
            boxShadow: '0 20px 70px rgba(0,0,0,0.5)'
          }}
        >

          {/* Header */}
          <div
            className="relative flex items-center justify-between border-b px-4 py-4"
            style={{
              background: 'linear-gradient(120deg, #241718, #120d0e)',
              borderColor: 'rgba(201,167,107,0.22)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border"
                style={{
                  background: 'rgba(201,167,107,0.12)',
                  borderColor: 'rgba(201,167,107,0.45)'
                }}
              >
                <Bot className="h-5 w-5 text-[#d9bd83]" />
              </div>

              <div>
                <h3 className="font-serif-luxury text-sm font-semibold tracking-wide text-[#ead9b6]">
                  Rahul Jewellers
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-[9px] tracking-wide text-[#c9a76b]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  AI ASSISTANT · SHEOGANJ
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 text-[#b7a58a] transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Welcome Strip */}
          <div className="flex items-center gap-2 border-b px-4 py-2"
            style={{
              background: '#1b1415',
              borderColor: 'rgba(201,167,107,0.14)'
            }}
          >
            <Sparkles className="h-3 w-3 text-[#d9bd83]" />
            <p className="text-[9px] tracking-wide text-[#b9a88d]">
              Your personal jewellery assistance
            </p>
          </div>

          {/* Messages */}
          <div
            className="flex-1 space-y-4 overflow-y-auto p-4"
            style={{ background: '#130e0f' }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'bot' && (
                  <div
                    className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      background: '#261a19',
                      borderColor: 'rgba(201,167,107,0.3)'
                    }}
                  >
                    <Bot className="h-4 w-4 text-[#d9bd83]" />
                  </div>
                )}

                <div
                  className="max-w-[80%] rounded-2xl px-3.5 py-3 text-xs leading-6 shadow-sm"
                  style={
                    m.sender === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #b89558, #8d6938)',
                          color: '#1b1110',
                          borderBottomRightRadius: '5px'
                        }
                      : {
                          background: '#24191a',
                          color: '#e6d9c2',
                          border: '1px solid rgba(201,167,107,0.16)',
                          borderBottomLeftRadius: '5px'
                        }
                  }
                >
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div
                    className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: '#a47b43' }}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-[10px] italic text-[#b9a88d]">
                <Bot className="h-4 w-4 animate-pulse text-[#d9bd83]" />
                Assistant is typing...
              </div>
            )}

            {/* WhatsApp Support */}
            {showWhatsAppHandoff && (
              <div className="pt-2">
                <div
                  className="rounded-2xl border p-3 text-center"
                  style={{
                    background: '#1b1713',
                    borderColor: 'rgba(201,167,107,0.22)'
                  }}
                >
                  <p className="mb-3 text-[10px] leading-5 text-[#c9b99d]">
                    Need personal assistance? Connect directly with our showroom team.
                  </p>

                  <button
                    onClick={handleWhatsAppTransfer}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold tracking-wide text-white transition hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #168c58, #086b40)'
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    CHAT ON WHATSAPP
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t p-3"
            style={{
              background: '#1c1415',
              borderColor: 'rgba(201,167,107,0.2)'
            }}
          >
            <input
              type="text"
              placeholder="Ask about jewellery or schemes..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-xs text-[#ead9b6] outline-none placeholder:text-[#887b6b] focus:border-[#c9a76b]"
              style={{
                background: '#100b0c',
                borderColor: 'rgba(201,167,107,0.25)'
              }}
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #d8bd83, #a47b43)',
                color: '#1b1110'
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Brand */}
          <div
            className="flex items-center justify-center gap-1.5 pb-2 text-[8px] tracking-[1.5px] text-[#8f7c60]"
            style={{ background: '#1c1415' }}
          >
            <Sparkles className="h-2.5 w-2.5" />
            POWERED BY RAHUL JEWELLERS
          </div>
        </div>
      )}
    </div>
  );
}
