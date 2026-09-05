import React from 'react';
import { Crown } from 'lucide-react';

export default function GoldTicker() {
  return (
    <div className="bg-stone-900 text-amber-400 text-xs py-2 px-6 flex justify-between items-center font-mono tracking-wider border-b border-amber-500/30">
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-white uppercase tracking-widest">RAHUL JEWELLERS (SHEOGANJ)</span>
      </div>
      <div className="text-stone-400 text-[11px] font-sans">
        Official Store & Scheme Portal
      </div>
    </div>
  );
}