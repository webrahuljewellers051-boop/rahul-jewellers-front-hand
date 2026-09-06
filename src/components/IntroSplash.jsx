import React, { useEffect, useState } from 'react';
import { Crown, Sparkles } from 'lucide-react';

export default function IntroSplash({ onFinish }) {
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    // Timer to start slide-up transition after 2 seconds
    const timer = setTimeout(() => {
      setAnimatingOut(true);
      setTimeout(onFinish, 600); // Wait for transition to complete
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-stone-950 flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
      animatingOut ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className="relative flex flex-col items-center space-y-4 text-center px-4">
        {/* Glowing aura */}
        <div className="absolute -inset-10 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-600/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Animated Crown Icon */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 p-1 shadow-2xl animate-bounce">
          <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center text-amber-400">
            <Crown className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Store Title with Shimmer Animation */}
        <div className="relative space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 bg-clip-text text-transparent uppercase">
            RAHUL JEWELLERS
          </h1>
          <p className="text-[10px] text-amber-500/90 font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Sheoganj Exclusive Collection <Sparkles className="w-3 h-3 text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  );
}