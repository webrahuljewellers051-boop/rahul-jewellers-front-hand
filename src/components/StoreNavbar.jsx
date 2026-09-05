import React from 'react';
import { Crown, Phone, Info, HelpCircle } from 'lucide-react';

export default function StoreNavbar() {
  return (
    <div className="bg-stone-900 text-amber-400 text-xs py-2 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono tracking-wider border-b border-amber-500/30">
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-white uppercase tracking-widest">RAHUL JEWELLERS (SHEOGANJ)</span>
      </div>
      
      <div className="flex items-center gap-5 text-[11px] font-sans">
        <a href="#about" className="hover:text-white transition flex items-center gap-1 text-stone-300">
          <Info className="w-3.5 h-3.5 text-amber-500" /> About Us
        </a>
        <a href="#contact" className="hover:text-white transition flex items-center gap-1 text-stone-300">
          <Phone className="w-3.5 h-3.5 text-amber-500" /> Contact
        </a>
        <a href="#support" className="hover:text-white transition flex items-center gap-1 text-stone-300">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Support
        </a>
      </div>
    </div>
  );
}