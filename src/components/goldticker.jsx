import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';

export default function GoldTicker({ rate24K = "1,58,390", rate22K = "1,45,190" }) {
  return (
    <div className="bg-zinc-950/90 border-b border-amber-500/20 px-4 py-2 text-[11px] font-semibold flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> 
        <span>Sheoganj Today Rate</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-zinc-300">
          <span className="text-zinc-500">24K:</span>
          <span className="font-mono text-amber-300 font-bold">₹{rate24K}</span>
        </div>

        <div className="flex items-center gap-1 text-zinc-300">
          <span className="text-zinc-500">22K:</span>
          <span className="font-mono text-amber-300 font-bold">₹{rate22K}</span>
        </div>

        <span className="hidden sm:flex items-center gap-0.5 text-emerald-400 text-[10px]">
          <TrendingUp className="w-3 h-3" /> Live
        </span>
      </div>
    </div>
  );
}