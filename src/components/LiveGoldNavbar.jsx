
import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff
} from 'lucide-react';

import './LiveGoldNavbar.css';

// New production API
const API_URL = String(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.rahuljewellerSHEOGANJ.com'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function validDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

export default function LiveGoldNavbar() {
  const [price, setPrice] = useState(null);
  const [displayEnabled, setDisplayEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [direction, setDirection] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const previousPrice = useRef(null);
  const latestRateVersion = useRef(null);

  useEffect(() => {
    let stopped = false;
    let stream = null;
    let streamOpen = false;
    let pollingTimer = null;
    let restInFlight = false;

    const pendingRequests = new Set();

    function applyGoldRate(data) {
      if (!data || data.success !== true) {
        return;
      }

      // Ignore older REST responses after a newer SSE update.
      const updatedAt = validDate(data.goldLastUpdated);

      const version = updatedAt
        ? updatedAt.getTime()
        : null;

      if (
        version !== null &&
        latestRateVersion.current !== null &&
        version < latestRateVersion.current
      ) {
        return;
      }

      if (version !== null) {
        latestRateVersion.current = version;
      }

      const newPrice = Number(data.priceInrPerGram);

      const showRate =
        data.enabled === true &&
        Number.isFinite(newPrice) &&
        newPrice > 0;

      setDisplayEnabled(showRate);

      // Admin OFF: hide the entire gold rate bar.
      if (!showRate) {
        previousPrice.current = null;
        setPrice(null);
        setDirection(0);
        setLastUpdated(null);
        return;
      }

      if (previousPrice.current === null) {
        setDirection(0);
      } else if (newPrice > previousPrice.current) {
        setDirection(1);
      } else if (newPrice < previousPrice.current) {
        setDirection(-1);
      } else {
        setDirection(0);
      }

      previousPrice.current = newPrice;

      setPrice(newPrice);

      setLastUpdated(
        updatedAt || validDate(data.timestamp)
      );
    }

    async function fetchGoldRateRest() {
      if (stopped || restInFlight) {
        return;
      }

      restInFlight = true;

      const controller = new AbortController();

      pendingRequests.add(controller);

      const timeout = setTimeout(() => {
        controller.abort();
      }, 12000);

      try {
        const response = await fetch(
          `${API_URL}/api/gold-rate`,
          {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gold rate request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (stopped) {
          return;
        }

        if (data?.success !== true) {
          throw new Error(
            'Invalid gold rate response'
          );
        }

        applyGoldRate(data);
        setConnected(true);
      } catch (error) {
        if (!stopped && !streamOpen) {
          setConnected(false);
        }
      } finally {
        clearTimeout(timeout);
        pendingRequests.delete(controller);
        restInFlight = false;
      }
    }

    function startPolling() {
      if (stopped || pollingTimer !== null) {
        return;
      }

      pollingTimer = setInterval(
        fetchGoldRateRest,
        15000
      );
    }

    function stopPolling() {
      if (pollingTimer !== null) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }

    // Initial REST request
    fetchGoldRateRest();

    // Polling is the fallback when SSE is unavailable.
    startPolling();

    if (typeof EventSource !== 'undefined') {
      try {
        stream = new EventSource(
          `${API_URL}/api/gold-rate/stream`
        );

        stream.onopen = () => {
          if (stopped) return;

          streamOpen = true;
          setConnected(true);

          // SSE connected: no need for REST polling.
          stopPolling();
        };

        stream.onmessage = event => {
          if (stopped) return;

          try {
            const data = JSON.parse(event.data);

            if (data.type === 'status') {
              return;
            }

            if (
              data.type &&
              data.type !== 'gold'
            ) {
              return;
            }

            applyGoldRate(data);
          } catch (error) {
            console.warn(
              'Invalid gold rate stream message:',
              error
            );
          }
        };

        stream.onerror = () => {
          if (stopped) return;

          streamOpen = false;
          setConnected(false);

          // EventSource retries automatically.
          // REST polling works until it reconnects.
          startPolling();
        };
      } catch (error) {
        startPolling();
      }
    }

    return () => {
      stopped = true;

      stopPolling();

      if (stream) {
        stream.close();
      }

      pendingRequests.forEach(controller => {
        controller.abort();
      });

      pendingRequests.clear();
    };
  }, []);

  // No blank space when Admin turns the rate OFF.
  if (!displayEnabled || price === null) {
    return null;
  }

  return (
    <div className="gold-rate-bar" role="status">
      <div className="gold-rate-marquee">
        <div className="gold-rate-content">

          <div className="gold-rate-brand">
            <span
              className={
                `gold-live-dot ${
                  connected ? 'is-live' : ''
                }`
              }
            />

            <span>22K GOLD RATE</span>
          </div>

          <span className="gold-separator" />

          <div className="gold-rate-item">
            <span className="gold-purity">
              22K
            </span>

            <strong>
              {formatINR(price)}
            </strong>

            <span className="gold-unit">
              /g
            </span>
          </div>

          <span className="gold-separator" />

          <div
            className={
              `gold-movement ${
                direction > 0
                  ? 'up'
                  : direction < 0
                    ? 'down'
                    : ''
              }`
            }
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
                  : 'STORE RATE'}
            </span>
          </div>

          <span className="gold-separator" />

          <div
            className={
              `gold-connection ${
                connected ? 'online' : 'offline'
              }`
            }
          >
            {connected ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            <span>
              {connected
                ? 'PUBLISHED'
                : 'OFFLINE'}
            </span>
          </div>

          <span className="gold-update">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString(
                  'en-IN',
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )}`
              : 'Update time unavailable'}
          </span>

        </div>
      </div>
    </div>
  );
}
