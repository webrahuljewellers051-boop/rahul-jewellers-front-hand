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

/*
 * Gold API
 *
 * XAU/INR = Gold price in INR per troy ounce
 *
 * 1 troy ounce = 31.1034768 grams
 */
const GOLD_API =
  'https://api.gold-api.com/price/XAU/INR';

const TROY_OUNCE_GRAMS = 31.1034768;

/*
 * Convert INR price per troy ounce
 * into INR price per gram.
 */
function convertToPerGram(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return value / TROY_OUNCE_GRAMS;
}

/*
 * Format Indian Rupee price.
 */
function formatINR(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(value).toLocaleString(
    'en-IN'
  )}`;
}

export default function LiveGoldNavbar() {
  const [price, setPrice] =
    useState(null);

  const [previousPrice, setPreviousPrice] =
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
          'Gold API response:',
          data
        );

        /*
         * Gold API normally returns
         * the current price as "price".
         *
         * The additional fallbacks make
         * the component more tolerant
         * of response changes.
         */
        const rawPrice =
          data?.price ??
          data?.value ??
          data?.data?.price;

        const ouncePrice =
          Number(rawPrice);

        if (
          !Number.isFinite(
            ouncePrice
          ) ||
          ouncePrice <= 0
        ) {
          throw new Error(
            'Invalid gold price received'
          );
        }

        /*
         * Convert:
         *
         * INR / troy ounce
         *
         * ↓
         *
         * INR / gram
         */
        const gramPrice =
          convertToPerGram(
            ouncePrice
          );

        if (
          !Number.isFinite(
            gramPrice
          ) ||
          gramPrice <= 0
        ) {
          throw new Error(
            'Invalid per-gram gold price'
          );
        }

        /*
         * Detect movement.
         */
        setPreviousPrice(
          (oldPrice) => {
            if (
              Number.isFinite(
                oldPrice
              )
            ) {
              if (
                gramPrice >
                oldPrice
              ) {
                setDirection(1);
              } else if (
                gramPrice <
                oldPrice
              ) {
                setDirection(-1);
              } else {
                setDirection(0);
              }
            }

            return gramPrice;
          }
        );

        /*
         * Save 24K price.
         */
        setPrice(
          gramPrice
        );

        /*
         * API is responding.
         */
        setConnected(
          true
        );

        setStatus(
          'LIVE GOLD FEED'
        );

        setLastUpdated(
          new Date()
        );

        console.log(
          '24K Gold:',
          gramPrice,
          'INR/gram'
        );
      } catch (error) {
        console.error(
          'Gold price error:',
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
    /*
     * Fetch immediately.
     */
    fetchGoldRate();

    /*
     * Refresh every 10 seconds.
     *
     * The API provides real-time prices
     * and currently documents its real-time
     * endpoint as having no request limit.
     */
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

          {/* =========================
              LIVE GOLD RATE
          ========================== */}

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

          {/* =========================
              24K GOLD ONLY
          ========================== */}

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

          {/* =========================
              PRICE MOVEMENT
          ========================== */}

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
              <ArrowUp
                size={14}
              />
            ) : direction < 0 ? (
              <ArrowDown
                size={14}
              />
            ) : (
              <Activity
                size={14}
              />
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

          {/* =========================
              CONNECTION STATUS
          ========================== */}

          <div
            className={`gold-connection ${
              connected
                ? 'online'
                : 'offline'
            }`}
          >

            {connected ? (
              <Wifi
                size={14}
              />
            ) : (
              <WifiOff
                size={14}
              />
            )}

            <span>
              {connected
                ? 'LIVE'
                : 'OFFLINE'}
            </span>

          </div>

          {/* =========================
              LAST UPDATE
          ========================== */}

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