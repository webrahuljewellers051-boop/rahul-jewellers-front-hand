import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOLD_API_KEY; 
const CURRENCY = 'INR'; // Change to USD, EUR, etc., as needed

export default function LiveGoldNavbar() {
  const [gold24k, setGold24k] = useState(null);
  const [gold22k, setGold22k] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchGoldRates = async () => {
    try {
      const response = await fetch(`https://www.goldapi.io/api/price/XAU/${CURRENCY}`, {
        method: 'GET',
        headers: {
          'x-access-token': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // GoldAPI returns price per troy ounce. 1 troy ounce = 31.1034768 grams.
      // Price per gram for 24K:
      const pricePerGram24K = data.price_gram_24k || (data.price / 31.1034768);
      
      // 22K calculation (approx 91.67% purity)
      const pricePerGram22K = pricePerGram24K * (22 / 24);

      setGold24k(Math.round(pricePerGram24K));
      setGold22k(Math.round(pricePerGram22K));
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch live gold rates:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGoldRates();

    // Auto-update every 5 minutes (300,000 ms) to respect API quotas
    const interval = setInterval(fetchGoldRates, 300000);
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

        {/* Live Gold Ticker Banner */}
        <div className="flex items-center gap-4 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/20 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span>Live Rates (Per Gram):</span>
          </div>

          {loading ? (
            <div className="text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching live rates...</span>
            </div>
          ) : (
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
          )}

          {lastUpdated && !loading && (
            <span className="text-[9px] text-stone-500 hidden sm:inline">
              (Updated: {lastUpdated})
            </span>
          )}
        </div>

        {/* Navigation Actions / Links */}
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