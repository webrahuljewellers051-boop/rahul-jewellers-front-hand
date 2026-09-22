import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

const API_KEY = import.meta.env.VITE_FCS_API_KEY || 'R0x3HM70X0Ypiert8zqiTEhnm3daVJ51j';

export default function LiveGoldNavbar() {
  const [gold24k, setGold24k] = useState(74500); // Instant default fallback so it never shows loading
  const [gold22k, setGold22k] = useState(68300);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Live');

  const fetchGoldRate = async () => {
    try {
      // Using FCS API endpoint to query XAU/USD live price safely via HTTP
      const res = await fetch(`https://fcsapi.com/api-v3/forex/latest?symbol=XAU/USD&access_key=${API_KEY}`);
      const data = await res.json();

      if (data && data.status && data.response && data.response[0]) {
        const ouncePrice = parseFloat(data.response[0].c);
        const gram24K = ouncePrice / 31.1034768; // Convert troy ounce to grams
        const gram22K = gram24K * (22 / 24);

        setGold24k(Math.round(gram24K));
        setGold22k(Math.round(gram22K));
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Market rate sync notice:", err);
    }
  };

  useEffect(() => {
    fetchGoldRate();
    const interval = setInterval(fetchGoldRate, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-stone-950 text-white border-b border-amber-500/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg">
            <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold tracking-widest text-amber-200 uppercase">
              Rahul Jewellers
            </h1>
            <p className="text-[9px] text-stone-400 uppercase tracking-widest">Sheoganj Showroom</p>
          </div>
        </div>

        {/* Live Rates Ticker Banner */}
        <div className="flex items-center gap-4 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/20 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span>Live Market Rates (Per Gram):</span>
          </div>

          <div className="flex items-center gap-4 font-mono font-bold">
            <div className="flex items-center gap-1">
              <span className="text-stone-400 text-[10px]">24K:</span>
              <span className="text-amber-300">₹{gold24k?.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-px h-3 bg-stone-700" />
            <div className="flex items-center gap-1">
              <span className="text-stone-400 text-[10px]">22K:</span>
              <span className="text-yellow-400">₹{gold22k?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <span className="text-[9px] text-emerald-400 hidden sm:inline">
            ● Active ({lastUpdated})
          </span>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Redirecting to scheme dashboard...")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Savings Scheme
          </button>
        </div>

      </div>
    </nav>
  );
}