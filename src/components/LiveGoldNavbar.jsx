import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowDown, ArrowUp, CircleDollarSign, Wifi, WifiOff } from 'lucide-react';

const API_KEY = import.meta.env.VITE_FCS_API_KEY;
const WS_URL = 'wss://ws-v4.fcsapi.com/ws';

const OUNCE_TO_GRAMS = 31.1034768;

const FALLBACK = {
  usdGold: null,
  usdInr: null,
  gold24k: 74500,
  gold22k: 68300,
  gold18k: 55875,
};

const money = (value, decimals = 0) =>
  Number.isFinite(value)
    ? `₹${Math.round(value).toLocaleString('en-IN')}`
    : '—';

export default function LiveGoldNavbar() {
  const [usdGold, setUsdGold] = useState(FALLBACK.usdGold);
  const [usdInr, setUsdInr] = useState(FALLBACK.usdInr);
  const [last24k, setLast24k] = useState(FALLBACK.gold24k);
  const [last22k, setLast22k] = useState(FALLBACK.gold22k);
  const [last18k, setLast18k] = useState(FALLBACK.gold18k);

  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [direction, setDirection] = useState(0);
  const previous24k = useRef(FALLBACK.gold24k);

  useEffect(() => {
    if (!API_KEY) {
      console.warn('VITE_FCS_API_KEY is not configured. Gold ticker is using fallback values.');
      return undefined;
    }

    let socket;
    let heartbeat;
    let reconnectTimer;
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      try {
        socket = new WebSocket(`${WS_URL}?access_key=${encodeURIComponent(API_KEY)}`);

        socket.onopen = () => {
          setConnected(true);

          // Stream both XAU/USD and USD/INR. This lets us display an
          // approximate international gold price converted to INR.
          socket.send(JSON.stringify({
            type: 'join_symbol',
            symbol: 'XAUUSD',
            timeframe: '60',
          }));

          socket.send(JSON.stringify({
            type: 'join_symbol',
            symbol: 'USDINR',
            timeframe: '60',
          }));

          heartbeat = window.setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const symbol = String(data.symbol || data.ticker || '').toUpperCase();
            const close = Number(data?.prices?.c ?? data?.active?.c ?? data?.price);

            if (!Number.isFinite(close)) return;

            if (symbol.includes('XAUUSD')) {
              setUsdGold(close);
            } else if (symbol.includes('USDINR')) {
              setUsdInr(close);
            }

            setLastUpdated(new Date());
          } catch (error) {
            console.error('Gold ticker message error:', error);
          }
        };

        socket.onerror = () => {
          setConnected(false);
        };

        socket.onclose = () => {
          setConnected(false);
          window.clearInterval(heartbeat);

          if (!stopped) {
            reconnectTimer = window.setTimeout(connect, 5000);
          }
        };
      } catch (error) {
        console.error('Gold ticker connection error:', error);
        setConnected(false);
      }
    };

    connect();

    return () => {
      stopped = true;
      window.clearInterval(heartbeat);
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const rates = useMemo(() => {
    if (Number.isFinite(usdGold) && Number.isFinite(usdInr)) {
      // XAUUSD = USD per troy ounce.
      // Convert to INR per 10g and then to INR per gram.
      const perGram24k = (usdGold * usdInr) / OUNCE_TO_GRAMS;
      return {
        gold24k: perGram24k,
        gold22k: perGram24k * (22 / 24),
        gold18k: perGram24k * (18 / 24),
      };
    }

    return {
      gold24k: last24k,
      gold22k: last22k,
      gold18k: last18k,
    };
  }, [usdGold, usdInr, last24k, last22k, last18k]);

  useEffect(() => {
    if (!Number.isFinite(rates.gold24k)) return;

    if (rates.gold24k > previous24k.current) setDirection(1);
    else if (rates.gold24k < previous24k.current) setDirection(-1);

    previous24k.current = rates.gold24k;
    setLast24k(rates.gold24k);
    setLast22k(rates.gold22k);
    setLast18k(rates.gold18k);
  }, [rates.gold24k, rates.gold22k, rates.gold18k]);

  const items = [
    { label: '24K', value: rates.gold24k },
    { label: '22K', value: rates.gold22k },
    { label: '18K', value: rates.gold18k },
  ];

  return (
    <div className="gold-ticker-shell" role="status" aria-label="Live gold rates">
      <div className="gold-ticker-track">
        <div className="gold-ticker-brand">
          <span className="gold-ticker-live-dot" />
          <span>LIVE GOLD RATE</span>
        </div>

        {items.map((item) => (
          <React.Fragment key={item.label}>
            <span className="gold-ticker-divider" />
            <div className="gold-ticker-rate">
              <span className="gold-ticker-purity">{item.label}</span>
              <strong>{money(item.value)}</strong>
              <span className="gold-ticker-unit">/ g</span>
            </div>
          </React.Fragment>
        ))}

        <span className="gold-ticker-divider" />

        <div className={`gold-ticker-move ${direction > 0 ? 'up' : direction < 0 ? 'down' : ''}`}>
          {direction > 0 ? <ArrowUp size={13} /> : direction < 0 ? <ArrowDown size={13} /> : <Activity size={13} />}
          <span>MARKET MOVING</span>
        </div>

        <span className="gold-ticker-divider" />

        <div className={`gold-ticker-status ${connected ? 'online' : ''}`}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{connected ? 'LIVE FEED' : 'RECONNECTING'}</span>
        </div>

        <span className="gold-ticker-divider" />

        <div className="gold-ticker-time">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Connecting to market feed…'}
        </div>

        {/* Duplicate content creates a seamless marquee on wide screens. */}
        <span className="gold-ticker-divider ticker-duplicate" />
        <div className="gold-ticker-brand ticker-duplicate">
          <CircleDollarSign size={14} />
          <span>RAHUL JEWELLERS</span>
        </div>
      </div>
    </div>
  );
}
