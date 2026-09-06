import React from 'react';
import { MessageCircle } from 'lucide-react';

const STORE_PHONE = '9950091024';

export default function FloatingWhatsApp() {
  const handleChatClick = () => {
    const msg = encodeURIComponent("Namaste Rahul Jewellers (Sheoganj), I would like to inquire about your jewelry collections and schemes.");
    window.open(`https://wa.me/91${STORE_PHONE}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleChatClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}