
import React, {
  useEffect,
  useRef,
  useState
} from 'react';

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

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://api.rahuljewellerSHEOGANJ.com'
).replace(/\/+$/, '');

const DEFAULT_CONTACTS = [
  '9950091024',
  '9461452322'
];

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 30000
};

const validPhone = phone =>
  /^[6-9]\d{9}$/.test(String(phone || ''));

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        'नमस्ते! Rahul Jewellers SHEOGANJ में आपका स्वागत है। Jewellery Collection, Gold Scheme या Payment के बारे में मैं आपकी क्या सहायता कर सकता हूँ?'
    }
  ]);

  const [inputMessage, setInputMessage] =
    useState('');

  const [loading, setLoading] = useState(false);

  const [showWhatsAppHandoff, setShowWhatsAppHandoff] =
    useState(false);

  const [contactNumbers, setContactNumbers] =
    useState(DEFAULT_CONTACTS);

  const chatEndRef = useRef(null);
  const latestUserMessageRef = useRef('Hello');

  useEffect(() => {
    let active = true;

    axios.get(
      `${API}/api/store/settings`,
      requestConfig
    ).then(response => {
      const phones =
        response.data?.settings?.contactNumbers;

      if (
        active &&
        Array.isArray(phones) &&
        phones.length > 0
      ) {
        const valid = phones.filter(validPhone);

        if (valid.length) {
          setContactNumbers(valid);
        }
      }
    }).catch(() => {
      // Keep the known store numbers as fallback.
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const openForScheme = event => {
      setIsOpen(true);

      setInputMessage(
        String(
          event.detail?.message ||
          'I need help with my Gold Scheme.'
        )
      );
    };

    window.addEventListener(
      'rj-open-support',
      openForScheme
    );

    return () => {
      window.removeEventListener(
        'rj-open-support',
        openForScheme
      );
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages, loading, isOpen]);

  async function handleSendMessage(event) {
    event.preventDefault();

    const text = inputMessage.trim();

    if (!text || loading) return;

    latestUserMessageRef.current = text;

    setInputMessage('');

    setMessages(previous => [
      ...previous,
      {
        sender: 'user',
        text
      }
    ]);

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/support/chat`,
        {
          message: text
        },
        requestConfig
      );

      if (
        response.data?.success &&
        response.data?.reply
      ) {
        setMessages(previous => [
          ...previous,
          {
            sender: 'bot',
            text: response.data.reply
          }
        ]);
      } else {
        throw new Error(
          'Assistant response unavailable.'
        );
      }

      setShowWhatsAppHandoff(true);
    } catch {
      setMessages(previous => [
        ...previous,
        {
          sender: 'bot',
          text:
            'अभी AI Assistant उपलब्ध नहीं है। आप हमारी टीम से WhatsApp या फोन पर सीधे संपर्क कर सकते हैं।'
        }
      ]);

      setShowWhatsAppHandoff(true);
    } finally {
      setLoading(false);
    }
  }

  function whatsappUrl(phone) {
    const message =
      'Namaste Rahul Jewellers SHEOGANJ,\n\n' +
      'I need assistance with:\n' +
      latestUserMessageRef.current;

    return (
      `https://wa.me/91${phone}` +
      `?text=${encodeURIComponent(message)}`
    );
  }

  function openWhatsApp(phone) {
    window.open(
      whatsappUrl(phone),
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[999] font-sans">

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Rahul Jewellers support"
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#d9bd83] shadow-2xl hover:scale-105 transition-transform"
          style={{
            background:
              'linear-gradient(145deg,#d8bd83,#a47b43)'
          }}
        >
          <MessageSquare
            size={27}
            className="text-[#1b1110]"
          />
        </button>
      )}

      {isOpen && (
        <div
          className="flex flex-col h-[min(560px,calc(100dvh-110px))] w-[min(370px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-[#c9a76b]/40 shadow-2xl"
          style={{
            background: '#130e0f'
          }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#c9a76b]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#c9a76b]/10 flex items-center justify-center">
                <Bot
                  size={22}
                  className="text-[#d9bd83]"
                />
              </div>

              <div>
                <h3 className="text-sm font-black text-[#ead9b6]">
                  Rahul Jewellers
                </h3>

                <p className="text-[10px] text-[#c9a76b] tracking-wider">
                  SHEOGANJ · AI SUPPORT
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-2 text-[#ead9b6]"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex items-center gap-2 border-b border-[#c9a76b]/10 px-4 py-2">
            <Sparkles
              size={13}
              className="text-[#d9bd83]"
            />

            <p className="text-[10px] text-[#b9a88d]">
              Jewellery · 12+1 Gold Scheme · Support
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Bot
                    size={18}
                    className="shrink-0 text-[#d9bd83] mt-2"
                  />
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-6 whitespace-pre-wrap ${
                    message.sender === 'user'
                      ? 'bg-[#b89558] text-[#1b1110]'
                      : 'bg-[#24191a] text-[#ead9b6] border border-[#c9a76b]/20'
                  }`}
                >
                  {message.text}
                </div>

                {message.sender === 'user' && (
                  <User
                    size={18}
                    className="shrink-0 text-[#d9bd83] mt-2"
                  />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#d9bd83]">
                <Bot
                  size={17}
                  className="animate-pulse"
                />
                Assistant is typing...
              </div>
            )}

            {showWhatsAppHandoff && (
              <div className="border border-[#c9a76b]/25 bg-[#211718] rounded-2xl p-3 space-y-3">
                <p className="text-xs text-[#ead9b6] font-bold">
                  Talk Directly to Our Team
                </p>

                {contactNumbers.map(phone => (
                  <button
                    key={phone}
                    type="button"
                    onClick={() =>
                      openWhatsApp(phone)
                    }
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl p-3 text-xs font-bold"
                  >
                    <MessageCircle size={16} />
                    WhatsApp {phone}
                  </button>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 p-3 border-t border-[#c9a76b]/20"
          >
            <input
              type="text"
              maxLength={1500}
              placeholder="Ask about jewellery or schemes..."
              value={inputMessage}
              onChange={event =>
                setInputMessage(event.target.value)
              }
              className="min-w-0 flex-1 rounded-xl border border-[#c9a76b]/25 bg-[#100b0c] px-3 py-3 text-xs text-[#ead9b6] outline-none"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !inputMessage.trim()
              }
              aria-label="Send message"
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#d8bd83] text-[#1b1110] disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>

          <div className="flex justify-center gap-3 pb-3 text-[10px] text-[#c9a76b]">
            {contactNumbers.map(phone => (
              <a
                key={phone}
                href={`tel:+91${phone}`}
                className="flex items-center gap-1"
              >
                <Phone size={11} />
                {phone}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
