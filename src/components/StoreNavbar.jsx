import React, { useState } from 'react';
import { Crown, Phone, Info, HelpCircle, X, MapPin, Clock, ShieldCheck, MessageCircle } from 'lucide-react';

export default function StoreNavbar() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <div className="bg-stone-900 text-amber-400 text-xs py-2 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono tracking-wider border-b border-amber-500/35 relative z-30">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold text-white uppercase tracking-widest text-[11px] sm:text-xs">RAHUL JEWELLERS (SHEOGANJ)</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] font-sans">
          <button 
            type="button"
            onClick={() => setActiveModal('about')}
            className="hover:text-white transition flex items-center gap-1.5 text-stone-300 cursor-pointer py-1 px-1.5 rounded active:bg-stone-800"
          >
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" /> About Us
          </button>
          <button 
            type="button"
            onClick={() => setActiveModal('contact')}
            className="hover:text-white transition flex items-center gap-1.5 text-stone-300 cursor-pointer py-1 px-1.5 rounded active:bg-stone-800"
          >
            <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Contact
          </button>
          <button 
            type="button"
            onClick={() => setActiveModal('support')}
            className="hover:text-white transition flex items-center gap-1.5 text-stone-300 cursor-pointer py-1 px-1.5 rounded active:bg-stone-800"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Support
          </button>
        </div>
      </div>

      {/* About Us Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-stone-800 relative my-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-base uppercase text-stone-900">About Rahul Jewellers</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-stone-100 rounded-xl text-stone-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-stone-600">
              <p>
                Nestled in the vibrant heart of the <strong>Main Market, Sheoganj</strong>, Rahul Jewellers has stood for decades as a beacon of trust, royal elegance, and uncompromised purity. 
              </p>
              <p>
                Founded with a passion for preserving traditional Indian craftsmanship, our showroom is a cherished destination for families celebrating life's most precious milestones. We specialize in 100% BIS hallmarked gold jewelry, majestic Kundan sets, intricate bridal collections, silver articles, and antique kadas.
              </p>
              <p>
                Every ornament we craft carries a promise of authenticity, transparent pricing, and timeless beauty designed to become your family's treasured heirloom for generations.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-stone-800 relative my-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-base uppercase text-stone-900">Contact Showroom</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-stone-100 rounded-xl text-stone-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900 uppercase">Showroom Address</p>
                  <p className="text-stone-600 font-medium">Main Market, Sheoganj, Rajasthan</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 uppercase">Helpline Numbers</p>
                  <p className="font-mono font-bold text-amber-900">+91 9950091024</p>
                  <p className="font-mono font-bold text-amber-900">+91 9461452322</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.open('https://wa.me/919950091024?text=Namaste%20Rahul%20Jewellers,%20I%20have%20an%20inquiry.', '_blank')}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-stone-800 relative my-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-base uppercase text-stone-900">Customer Support & Guidelines</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <Clock className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <p className="font-bold text-amber-950 uppercase text-[10px]">Customer Helping Hours</p>
                  <p className="font-bold text-stone-900 text-sm font-mono">10:00 AM to 6:00 PM</p>
                </div>
              </div>

              <div className="space-y-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 font-medium">
                <p className="font-bold text-stone-900 uppercase text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Scheme & Payment Guidelines:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
                  <li>For monthly gold savings scheme payments, complete your transaction via UPI and save the receipt screenshot.</li>
                  <li>Send your payment screenshot immediately on WhatsApp along with your Customer ID and Month Number for passbook updates.</li>
                  <li>Verification and digital passbook updates are completed within regular helping hours.</li>
                  <li>For any discrepancies or support queries, reach out directly to our helpline numbers.</li>
                </ul>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}