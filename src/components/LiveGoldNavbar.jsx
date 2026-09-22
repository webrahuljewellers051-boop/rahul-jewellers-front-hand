import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

const WS_URL = 'wss://ws-v4.fcsapi.com/';
const WS_KEY = import.meta.env.VITE_FCS_API_KEY;

export default function LiveGoldNavbar() {
  const [gold24k, setGold24k] = useState(null);
  const [gold22k, setGold22k] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!WS_KEY) {
      console.error("VITE_FCS_API_KEY is missing from environment variables.");
      return;
    }

    // Connect with the WebSocket key using standard query parameter or custom socket protocol configuration
    const ws = new WebSocket(`${WS_URL}?access_key=${WS_KEY}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected to FCS API WebSocket");

      // Subscribe to XAUUSD (Gold vs US Dollar) with timeframe '1D' or '60'
      const subscribeMessage = JSON.stringify({
        type: 'join_symbol',
        symbol: 'XAUUSD',
        timeframe: '60'
      });
      ws.send(subscribeMessage);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if message contains price updates
        if (data.type === 'prices' || data.type === 'price' || data.prices) {
          const priceObj = data.prices || data;
          const currentPricePerOunce = priceObj.c || priceObj.price;

          if (currentPricePerOunce) {
            // Gold rates from XAUUSD are typically per troy ounce (31.1034768 grams)
            const pricePerGram24K = currentPricePerOunce / 31.1034768;
            const pricePerGram22K = pricePerGram24K * (22 / 24);

            setGold24k(Math.round(pricePerGram24K));
            setGold22k(Math.round(pricePerGram22K));
            setLastUpdated(new Date().toLocaleTimeString());
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from FCS API WebSocket");
    };

    // Cleanup connection on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
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

        {/* Real-Time WebSocket Ticker Banner */}
        <div className="flex items-center gap-4 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/20 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span>Live WebSocket Rates (Per Gram):</span>
          </div>

          {!isConnected || !gold24k ? (
            <div className="text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting to live stream...</span>
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

          {lastUpdated && isConnected && (
            <span className="text-[9px] text-emerald-400 hidden sm:inline">
              ● Live ({lastUpdated})
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