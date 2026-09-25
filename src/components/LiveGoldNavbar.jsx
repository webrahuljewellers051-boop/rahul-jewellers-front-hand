import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff,
} from 'lucide-react';

import './LiveGoldNavbar.css';

const GOLD_API =
  'https://api.gold-api.com/price/XAU/INR';

const TROY_OUNCE_GRAMS =
  31.1034768;

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(
    value
  ).toLocaleString('en-IN')}`;
}

function extractPrice(data) {
  const value =
    data?.price ??
    data?.value ??
    data?.data?.price;

  const number =
    Number(value);

  if (
    Number.isFinite(number) &&
    number > 0
  ) {
    return number;
  }

  return null;
}

export default function LiveGoldNavbar() {
  const [price, setPrice] =
    useState(null);

  const [direction, setDirection] =
    useState(0);

  const [connected, setConnected] =
    useState(false);

  const [status, setStatus] =
    useState(
      'Loading gold rate...'
    );

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const timerRef =
    useRef(null);

  const previousPriceRef =
    useRef(null);

  const fetchGoldRate =
    useCallback(async () => {
      try {
        setStatus(
          'Updating gold rate...'
        );

        const response =
          await fetch(
            `${GOLD_API}?_=${Date.now()}`,
            {
              method: 'GET',
              cache: 'no-store',
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          'Gold API:',
          data
        );

        /*
         * XAU/INR is INR per troy ounce.
         */
        const ouncePrice =
          extractPrice(data);

        if (!ouncePrice) {
          throw new Error(
            'Invalid gold price'
          );
        }

        /*
         * Convert INR/troy-ounce
         * to INR/gram.
         */
        const gramPrice =
          ouncePrice /
          TROY_OUNCE_GRAMS;

        if (
          !Number.isFinite(
            gramPrice
          ) ||
          gramPrice <= 0
        ) {
          throw new Error(
            'Invalid gram price'
          );
        }

        /*
         * Detect movement.
         */
        const previous =
          previousPriceRef.current;

        if (
          Number.isFinite(
            previous
          )
        ) {
          if (
            gramPrice >
            previous
          ) {
            setDirection(1);
          } else if (
            gramPrice <
            previous
          ) {
            setDirection(-1);
          } else {
            setDirection(0);
          }
        }

        previousPriceRef.current =
          gramPrice;

        setPrice(
          gramPrice
        );

        setConnected(
          true
        );

        setStatus(
          'LIVE GOLD FEED'
        );

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          'Gold API error:',
          error
        );

        setConnected(
          false
        );

        setStatus(
          'Gold feed unavailable'
        );
      }
    }, []);

  useEffect(() => {
    fetchGoldRate();

    timerRef.current =
      window.setInterval(
        fetchGoldRate,
        10000
      );

    return () => {
      window.clearInterval(
        timerRef.current
      );
    };
  }, [fetchGoldRate]);

  return (
    <div
      className="gold-rate-bar"
      role="status"
      aria-label="Live 24K gold rate"
    >
      <div className="gold-rate-marquee">

        <div className="gold-rate-content">

          {/* LIVE GOLD RATE */}

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

          {/* 24K ONLY */}

          <div className="gold-rate-item">

            <span className="gold-purity">
              24K
            </span>

            <strong>
              {formatINR(
                price
              )}
            </strong>

            <span className="gold-unit">
              /g
            </span>

          </div>

          <span className="gold-separator" />

          {/* MOVEMENT */}

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