import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff,
} from 'lucide-react';

import './LiveGoldNavbar.css';

const API_KEY = import.meta.env.VITE_FCS_API_KEY;

const WS_URL = 'wss://ws-v4.fcsapi.com/ws';

// FCS symbols
const GOLD_SYMBOL = 'FLC:XAUUSD';
const INR_SYMBOL = 'FLC:USDINR';

const TIMEFRAME = '1';

// 1 troy ounce = 31.1034768 grams
const TROY_OUNCE_GRAMS = 31.1034768;

const formatINR = (value) => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const getCurrentPrice = (data) => {
  const value =
    data?.prices?.c ??
    data?.prices?.a ??
    data?.prices?.b;

  const number = Number(value);

  if (Number.isFinite(number) && number > 0) {
    return number;
  }

  return null;
};

export default function LiveGoldNavbar() {
  const [goldUsd, setGoldUsd] = useState(null);
  const [usdInr, setUsdInr] = useState(null);

  const [previous24k, setPrevious24k] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [connected, setConnected] = useState(false);

  const [connectionMessage, setConnectionMessage] =
    useState('Connecting to FCS…');

  const [direction, setDirection] = useState(0);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!API_KEY) {
      console.error(
        'VITE_FCS_API_KEY is missing. Add it to your Vercel Environment Variables.'
      );

      setConnectionMessage('FCS KEY MISSING');

      return undefined;
    }

    const connect = () => {
      if (stoppedRef.current) {
        return;
      }

      setConnectionMessage('Connecting to FCS…');

      try {
        const socket = new WebSocket(
          `${WS_URL}?access_key=${encodeURIComponent(API_KEY)}`
        );

        socketRef.current = socket;

        socket.onopen = () => {
          console.log('FCS WebSocket connected');

          setConnectionMessage('Authenticating…');
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            console.log('FCS WebSocket message:', data);

            /*
             * FCS authentication / welcome message
             */
            if (
              data.type === 'welcome' ||
              data.welcome?.type === 'welcome'
            ) {
              console.log('FCS WebSocket authenticated');

              setConnected(true);
              setConnectionMessage('LIVE FEED');

              reconnectCountRef.current = 0;

              /*
               * Subscribe to Gold / USD
               */
              socket.send(
                JSON.stringify({
                  type: 'join_symbol',
                  symbol: GOLD_SYMBOL,
                  timeframe: TIMEFRAME,
                })
              );

              /*
               * Subscribe to USD / INR
               */
              socket.send(
                JSON.stringify({
                  type: 'join_symbol',
                  symbol: INR_SYMBOL,
                  timeframe: TIMEFRAME,
                })
              );

              return;
            }

            /*
             * FCS error message
             */
            if (data.type === 'error') {
              console.error(
                'FCS WebSocket error:',
                data.message
              );

              setConnected(false);

              setConnectionMessage(
                data.message || 'FCS rejected connection'
              );

              return;
            }

            /*
             * We only process price messages
             */
            if (data.type !== 'price') {
              return;
            }

            const symbol = String(
              data.symbol || ''
            ).toUpperCase();

            const price = getCurrentPrice(data);

            if (!price) {
              return;
            }

            /*
             * XAU/USD
             */
            if (symbol.includes('XAUUSD')) {
              console.log(
                'Gold USD price:',
                price
              );

              setGoldUsd(price);
              setLastUpdated(new Date());
            }

            /*
             * USD/INR
             */
            else if (symbol.includes('USDINR')) {
              console.log(
                'USD INR price:',
                price
              );

              setUsdInr(price);
              setLastUpdated(new Date());
            }
          } catch (error) {
            console.error(
              'FCS message parsing error:',
              error
            );
          }
        };

        socket.onerror = (error) => {
          console.error(
            'FCS WebSocket connection error:',
            error
          );

          setConnected(false);

          setConnectionMessage(
            'Connection error'
          );
        };

        socket.onclose = () => {
          console.log(
            'FCS WebSocket disconnected'
          );

          setConnected(false);

          if (stoppedRef.current) {
            return;
          }

          setConnectionMessage(
            'Reconnecting…'
          );

          /*
           * Exponential reconnect delay
           *
           * 5 sec
           * 10 sec
           * 15 sec
           * ...
           * maximum 30 sec
           */
          reconnectCountRef.current += 1;

          const delay = Math.min(
            5000 * reconnectCountRef.current,
            30000
          );

          reconnectTimerRef.current =
            window.setTimeout(
              connect,
              delay
            );
        };
      } catch (error) {
        console.error(
          'Unable to create FCS WebSocket:',
          error
        );

        setConnected(false);

        setConnectionMessage(
          'Unable to connect'
        );

        reconnectCountRef.current += 1;

        const delay = Math.min(
          5000 * reconnectCountRef.current,
          30000
        );

        reconnectTimerRef.current =
          window.setTimeout(
            connect,
            delay
          );
      }
    };

    connect();

    return () => {
      stoppedRef.current = true;

      window.clearTimeout(
        reconnectTimerRef.current
      );

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  /*
   * Calculate 24K gold price in INR per gram.
   *
   * XAUUSD = USD price of one troy ounce of gold
   * USDINR = INR value of one USD
   *
   * INR per gram =
   * (XAUUSD × USDINR) / 31.1034768
   */
  const gold24k =
    Number.isFinite(goldUsd) &&
    Number.isFinite(usdInr)
      ? (goldUsd * usdInr) /
        TROY_OUNCE_GRAMS
      : null;

  /*
   * 22K = 22 / 24 of 24K
   */
  const gold22k =
    Number.isFinite(gold24k)
      ? gold24k * (22 / 24)
      : null;

  /*
   * 18K = 18 / 24 of 24K
   */
  const gold18k =
    Number.isFinite(gold24k)
      ? gold24k * (18 / 24)
      : null;

  /*
   * Detect whether gold price is moving
   * up or down.
   */
  useEffect(() => {
    if (!Number.isFinite(gold24k)) {
      return;
    }

    if (Number.isFinite(previous24k)) {
      if (gold24k > previous24k) {
        setDirection(1);
      } else if (gold24k < previous24k) {
        setDirection(-1);
      } else {
        setDirection(0);
      }
    }

    setPrevious24k(gold24k);
  }, [gold24k, previous24k]);

  const items = [
    ['24K', gold24k],
    ['22K', gold22k],
    ['18K', gold18k],
  ];

  return (
    <div
      className="gold-rate-bar"
      role="status"
      aria-label="Live FCS gold rates"
    >
      <div className="gold-rate-marquee">
        <div className="gold-rate-content">

          {/* LIVE GOLD RATE */}
          <div className="gold-rate-brand">
            <span
              className={`gold-live-dot ${
                connected ? 'is-live' : ''
              }`}
            />

            <span>
              LIVE GOLD RATE
            </span>
          </div>

          {/* GOLD RATES */}
          {items.map(
            ([purity, rate]) => (
              <React.Fragment key={purity}>

                <span className="gold-separator" />

                <div className="gold-rate-item">

                  <span className="gold-purity">
                    {purity}
                  </span>

                  <strong>
                    {formatINR(rate)}
                  </strong>

                  <span className="gold-unit">
                    /g
                  </span>

                </div>

              </React.Fragment>
            )
          )}

          {/* MARKET MOVEMENT */}
          <span className="gold-separator" />

          <div
            className={`gold-movement ${
              direction > 0
                ? 'up'
                : direction < 0
                ? 'down'
                : ''
            }`}
          >
            {direction > 0 ? (
              <ArrowUp size={14} />
            ) : direction < 0 ? (
              <ArrowDown size={14} />
            ) : (
              <Activity size={14} />
            )}

            <span>
              {direction > 0
                ? 'RISING'
                : direction < 0
                ? 'FALLING'
                : 'LIVE MARKET'}
            </span>
          </div>

          {/* CONNECTION STATUS */}
          <span className="gold-separator" />

          <div
            className={`gold-connection ${
              connected
                ? 'online'
                : 'offline'
            }`}
          >
            {connected ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            <span>
              {connected
                ? 'LIVE'
                : 'OFFLINE'}
            </span>
          </div>

          {/* LAST UPDATE */}
          <span className="gold-update">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString(
                  'en-IN'
                )}`
              : connectionMessage}
          </span>

        </div>
      </div>
    </div>
  );
}