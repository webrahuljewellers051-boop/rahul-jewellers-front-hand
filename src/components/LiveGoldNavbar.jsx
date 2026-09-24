import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

const API_KEY = import.meta.env.VITE_FCS_API_KEY || 'R0x3HM70X0Ypiert8zqiTEhnm3daVJ51j';
const WS_URL = 'wss://ws-v4.fcsapi.com/ws';

export default function LiveGoldNavbar() {
  const [gold24k, setGold24k] = useState(745000); // डिफ़ॉल्ट फॉलबैक प्रति 10 ग्राम
  const [gold22k, setGold22k] = useState(683000); // डिफ़ॉल्ट फॉलबैक प्रति 10 ग्राम
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let ws = null;
    let heartbeatTimer = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}?access_key=${API_KEY}`);

        ws.onopen = () => {
          setIsConnected(true);
          console.log("Connected to FCS API WebSocket Server");

          // गोल्ड सिंबल ज्वाइन करें (उदाहरण: XAUUSD या CURRENCY:XAUUSD)
          ws.send(JSON.stringify({
            type: "join_symbol",
            symbol: "XAUUSD",
            timeframe: "60"
          }));

          // कनेक्शन जीवंत रखने के लिए पिंग भेजें
          heartbeatTimer = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // लाइव प्राइस डेटा हैंडल करना
            if (data.type === "price" && data.prices && data.prices.c) {
              const ouncePrice = parseFloat(data.prices.c);
              
              // 1 ट्रॉय औंस = 31.1034768 ग्राम, प्रति 10 ग्राम की गणना
              const pricePer10Gram24K = (ouncePrice / 31.1034768) * 10;
              const pricePer10Gram22K = pricePer10Gram24K * (22 / 24);

              setGold24k(Math.round(pricePer10Gram24K));
              setGold22k(Math.round(pricePer10Gram22K));
              setLastUpdated(new Date().toLocaleTimeString());
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

        ws.onclose = () => {
          setIsConnected(false);
          clearInterval(heartbeatTimer);
          // 5 सेकंड बाद पुनः कनेक्ट करने का प्रयास
          setTimeout(connectWebSocket, 5000);
        };
      } catch (e) {
        console.error("Connection initialization error:", e);
      }
    };

    connectWebSocket();

    return () => {
      clearInterval(heartbeatTimer);
      if (ws) ws.close();
    };
  }, []);

  return (
    <nav className="bg-stone-950 text-white border-b border-amber-500/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* ब्रांड लोगो और शीर्षक */}
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

        {/* लाइव वेब सॉकेट रेट्स टिकर (प्रति 10 ग्राम) */}
        <div className="flex items-center gap-4 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/20 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span>Live WebSocket Gold Rates (Per 10 Gram):</span>
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

          <span className={`text-[9px] hidden sm:inline ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isConnected ? `● Live WebSocket (${lastUpdated || 'Connected'})` : '○ Connecting...'}
          </span>
        </div>

        {/* नेविगेशन एक्शन */}
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