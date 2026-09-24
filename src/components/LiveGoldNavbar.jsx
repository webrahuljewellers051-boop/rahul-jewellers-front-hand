import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUp, ArrowDown, Wifi, WifiOff } from 'lucide-react';
import './LiveGoldNavbar.css';

const API_KEY = import.meta.env.VITE_FCS_API_KEY;

const WS_URL = 'wss://ws-v4.fcsapi.com/ws';

const GOLD_SYMBOL = 'XAUUSD';
const USD_INR_SYMBOL = 'USDINR';

const TROY_OUNCE_GRAMS = 31.1034768;

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export default function LiveGoldNavbar() {
  const [goldPrice, setGoldPrice] = useState(null);
  const [usdInr, setUsdInr] = useState(null);

  const [connected, setConnected] = useState(false);

  const [status, setStatus] = useState(
    'Connecting to gold market...'
  );

  const [lastUpdated, setLastUpdated] = useState(null);

  const [movement, setMovement] = useState(0);

  const previousPrice = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimer = useRef(null);
  const stopped = useRef(false);

  useEffect(() => {
    if (!API_KEY) {
      console.error(
        'VITE_FCS_API_KEY is missing'
      );

      setStatus('FCS KEY MISSING');

      return;
    }

    function connect() {
      if (stopped.current) {
        return;
      }

      console.log(
        'Connecting to FCS WebSocket...'
      );

      setStatus('Connecting...');

      const socket = new WebSocket(
        `${WS_URL}?access_key=${encodeURIComponent(
          API_KEY
        )}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        console.log(
          'WebSocket connection opened'
        );

        setStatus('Authenticating...');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          console.log(
            'FCS:',
            data
          );

          /*
           * Successful authentication
           */
          if (
            data.type === 'welcome' ||
            data.welcome?.type === 'welcome'
          ) {
            console.log(
              'FCS authentication successful'
            );

            setConnected(true);

            setStatus('LIVE GOLD FEED');

            /*
             * Subscribe to XAUUSD
             */
            socket.send(
              JSON.stringify({
                type: 'join_symbol',
                symbol: GOLD_SYMBOL,
                timeframe: '1'
              })
            );

            /*
             * Subscribe to USDINR
             */
            socket.send(
              JSON.stringify({
                type: 'join_symbol',
                symbol: USD_INR_SYMBOL,
                timeframe: '1'
              })
            );

            return;
          }

          /*
           * Server error
           */
          if (data.type === 'error') {
            console.error(
              'FCS ERROR:',
              data.message
            );

            setConnected(false);

            setStatus(
              data.message ||
                'FCS connection rejected'
            );

            return;
          }

          /*
           * Price message
           */
          if (data.type === 'price') {
            const symbol = String(
              data.symbol || ''
            ).toUpperCase();

            const prices = data.prices || {};

            const current =
              Number(prices.c) ||
              Number(prices.a) ||
              Number(prices.b);

            if (!current || current <= 0) {
              return;
            }

            /*
             * GOLD
             */
            if (
              symbol.includes('XAUUSD')
            ) {
              console.log(
                'XAUUSD:',
                current
              );

              setGoldPrice(current);

              setLastUpdated(
                new Date()
              );
            }

            /*
             * USD / INR
             */
            if (
              symbol.includes('USDINR')
            ) {
              console.log(
                'USDINR:',
                current
              );

              setUsdInr(current);

              setLastUpdated(
                new Date()
              );
            }
          }
        } catch (error) {
          console.error(
            'FCS JSON error:',
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error(
          'FCS WebSocket error:',
          error
        );

        setConnected(false);

        setStatus(
          'Connection error'
        );
      };

      socket.onclose = () => {
        console.log(
          'FCS WebSocket closed'
        );

        setConnected(false);

        if (stopped.current) {
          return;
        }

        setStatus(
          'Reconnecting...'
        );

        reconnectTimer.current =
          setTimeout(
            connect,
            5000
          );
      };
    }

    connect();

    return () => {
      stopped.current = true;

      clearTimeout(
        reconnectTimer.current
      );

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  /*
   * Calculate 24K gold INR/gram
   *
   * XAUUSD = USD price per troy ounce
   * USDINR = INR per USD
   */
  const gold24K =
    Number.isFinite(goldPrice) &&
    Number.isFinite(usdInr)
      ? (goldPrice * usdInr) /
        TROY_OUNCE_GRAMS
      : null;

  /*
   * Detect price movement
   */
  useEffect(() => {
    if (!Number.isFinite(gold24K)) {
      return;
    }

    if (
      previousPrice.current !== null
    ) {
      if (
        gold24K >
        previousPrice.current
      ) {
        setMovement(1);
      } else if (
        gold24K <
        previousPrice.current
      ) {
        setMovement(-1);
      } else {
        setMovement(0);
      }
    }

    previousPrice.current =
      gold24K;
  }, [gold24K]);

  return (
    <div
      className="gold-rate-bar"
      role="status"
      aria-label="Live 24K gold rate"
    >
      <div className="gold-rate-marquee">

        <div className="gold-rate-content">

          {/* LIVE GOLD */}
          <div className="gold-rate-brand">

            <span
              className={`gold-live-dot ${
                connected
                  ? 'is-live'
                  : ''
              }`}
            />

            <span>
              LIVE GOLD RATE
            </span>

          </div>

          <span className="gold-separator" />

          {/* ONLY 24K */}
          <div className="gold-rate-item">

            <span className="gold-purity">
              24K
            </span>

            <strong>
              {formatINR(
                gold24K
              )}
            </strong>

            <span className="gold-unit">
              / g
            </span>

          </div>

          <span className="gold-separator" />

          {/* MOVEMENT */}
          <div
            className={`gold-movement ${
              movement > 0
                ? 'up'
                : movement < 0
                ? 'down'
                : ''
            }`}
          >

            {movement > 0 ? (
              <ArrowUp size={14} />
            ) : movement < 0 ? (
              <ArrowDown size={14} />
            ) : (
              <Activity size={14} />
            )}

            <span>
              {movement > 0
                ? 'RISING'
                : movement < 0
                ? 'FALLING'
                : 'LIVE MARKET'}
            </span>

          </div>

          <span className="gold-separator" />

          {/* CONNECTION */}
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

          {/* UPDATE */}
          <span className="gold-update">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString(
                  'en-IN'
                )}`
              : status}
          </span>

        </div>

      </div>
    </div>
  );
}