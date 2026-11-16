
import React, { useState } from 'react';
import {
  Crown, Phone, Info, HelpCircle, X, MapPin, Clock,
  ShieldCheck, MessageCircle, Instagram, Gem, Sparkles
} from 'lucide-react';

const GOLD = '#D6B875';

export default function StoreNavbar() {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  const modalContent = {
    about: {
      icon: Info,
      title: 'About Rahul Jewellers',
    },
    contact: {
      icon: Phone,
      title: 'Contact Showroom',
    },
    support: {
      icon: HelpCircle,
      title: 'Customer Support',
    },
  };

  const current = activeModal ? modalContent[activeModal] : null;
  const ModalIcon = current?.icon;

  return (
    <>
      <div className="relative z-50 bg-[#100b0d] border-b border-[#c6a15b]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 min-h-[43px] flex flex-wrap items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.19em] text-[#e8d5ad] uppercase">
              Rahul Jewellers
            </span>
            <span className="hidden sm:inline text-[#806c4a] text-[10px]">|</span>
            <span className="hidden sm:inline text-[9px] tracking-[0.2em] text-[#a9977d] uppercase">
              SHEOGANJ
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
            <button
              onClick={() => setActiveModal('about')}
              className="flex items-center gap-1.5 text-[#c9bda9] hover:text-[#f1d99e] transition"
            >
              <Info size={13} /> About
            </button>

            <button
              onClick={() => setActiveModal('contact')}
              className="flex items-center gap-1.5 text-[#c9bda9] hover:text-[#f1d99e] transition"
            >
              <Phone size={13} /> Contact
            </button>

            <button
              onClick={() => setActiveModal('support')}
              className="flex items-center gap-1.5 text-[#c9bda9] hover:text-[#f1d99e] transition"
            >
              <HelpCircle size={13} /> Support
            </button>

            <a
              href="https://instagram.com/rahuljewellers9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#d6a0b5] hover:text-white transition"
            >
              <Instagram size={13} /> Instagram
            </a>
          </div>
        </div>
      </div>

      {activeModal && current && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md bg-[#171012] border border-[#c6a15b]/40 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-[#76552f] via-[#e6cc91] to-[#76552f]" />

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-[#c6a15b]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c6a15b]/10 border border-[#c6a15b]/30 flex items-center justify-center">
                    <ModalIcon size={19} color={GOLD} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#a58b5b]">
                      Rahul Jewellers
                    </p>
                    <h3 className="font-serif-luxury text-xl text-[#f0dba9]">
                      {current.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full border border-[#c6a15b]/25 text-[#cbbd9f] hover:bg-[#c6a15b]/10 flex items-center justify-center"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {activeModal === 'about' && (
                <div className="space-y-4 text-sm leading-7 text-[#c9bca9]">
                  <div className="text-center py-3">
                    <Gem size={32} className="mx-auto mb-3" color={GOLD} />
                    <h4 className="font-serif-luxury text-2xl text-[#e8d19b]">
                      Timeless Elegance
                    </h4>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#9d8761] mt-1">
                      Trust • Purity • Craftsmanship
                    </p>
                  </div>

                  <p>
                    Located in the heart of Main Market, SHEOGANJ,
                    Rahul Jewellers is dedicated to bringing beautiful
                    jewellery and traditional Indian craftsmanship
                    to every special occasion.
                  </p>

                  <p>
                    Our collections include Gold, Polki, Kundan,
                    Diamond and Silver jewellery, with a focus on
                    timeless designs, quality and customer trust.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {['Gold Jewellery', 'Polki Designs', 'Kundan Collection', 'Diamond & Silver'].map((item) => (
                      <div
                        key={item}
                        className="p-3 text-center rounded-xl bg-[#24191a] border border-[#c6a15b]/20 text-[#e5d1a7] text-xs"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#24191a] border border-[#c6a15b]/20">
                    <MapPin size={18} color={GOLD} className="shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#b69b69]">
                        Showroom Address
                      </p>
                      <p className="text-[#eee0c5] mt-1">
                        Main Market, SHEOGANJ, Rajasthan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#24191a] border border-[#c6a15b]/20">
                    <Phone size={18} color={GOLD} className="shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#b69b69]">
                        Contact Numbers
                      </p>
                      <a href="tel:+919950091024" className="block text-[#eee0c5] mt-2">
                        +91 9950091024
                      </a>
                      <a href="tel:+919461452322" className="block text-[#eee0c5] mt-1">
                        +91 9461452322
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#24191a] border border-[#c6a15b]/20">
                    <div className="flex items-center gap-2 text-[#eee0c5]">
                      <Instagram size={17} color="#d6a0b5" />
                      Instagram
                    </div>
                    <a
                      href="https://instagram.com/rahuljewellers9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d6a0b5] text-xs"
                    >
                      @rahuljewellers9
                    </a>
                  </div>

                  <a
                    href="https://wa.me/919950091024?text=Namaste%20Rahul%20Jewellers,%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#176b45] hover:bg-[#208456] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={17} />
                    Chat on WhatsApp
                  </a>
                </div>
              )}

              {activeModal === 'support' && (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#24191a] border border-[#c6a15b]/20">
                    <Clock size={20} color={GOLD} />
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#b69b69]">
                        Customer Helping Hours
                      </p>
                      <p className="text-[#eee0c5] font-semibold mt-1">
                        10:00 AM – 6:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#24191a] border border-[#c6a15b]/20 space-y-3">
                    <div className="flex items-center gap-2 text-[#e8d19b] font-semibold text-xs">
                      <ShieldCheck size={17} />
                      Scheme & Payment Guidelines
                    </div>

                    <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed text-[#c9bca9]">
                      <li>Complete your monthly installment through your UPI app.</li>
                      <li>Keep your payment receipt screenshot safe.</li>
                      <li>Share your screenshot with your Customer ID and Month Number on WhatsApp.</li>
                      <li>Payment verification and passbook updates are handled by the store team.</li>
                    </ul>
                  </div>
                </div>
              )}

              <button
                onClick={closeModal}
                className="w-full py-3 rounded-xl border border-[#c6a15b]/40 text-[#e6cc91] hover:bg-[#c6a15b]/10 text-xs font-semibold tracking-widest uppercase transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
