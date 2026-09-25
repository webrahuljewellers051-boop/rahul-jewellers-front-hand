import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff,
} from "lucide-react";

import "./LiveGoldNavbar.css";

const GOLD_API =
  "https://api.gold-api.com/price/XAU";

const USD_INR_API =
  "https://api.frankfurter.dev/v2/rate/USD/INR";

const TROY_OUNCE_GRAMS = 31.1034768;

// Gold updates frequently.
// FX reference rates don't, so cache them.
const GOLD_REFRESH_MS = 10000;
const FX_REFRESH_MS = 60 * 60 * 1000;

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function extractGoldPrice(data) {
  console.log("RAW GOLD RESPONSE:", data);

  const candidates = [
    data?.price,
    data?.value,
    data?.data?.price,
    data?.data?.value,
  ];

  for (const value of candidates) {
    const number = Number(value);

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return number;
    }
  }

  return null;
}

function extractUsdInr(data) {
  console.log("RAW USD/INR RESPONSE:", data);

  const number = Number(data?.rate);

  if (
    Number.isFinite(number) &&
    number > 0
  ) {
    return number;
  }

  return null;
}

export default function LiveGoldNavbar() {
  const [price, setPrice] = useState(null);

  const [direction, setDirection] =
    useState(0);

  const [connected, setConnected] =
    useState(false);

  const [status, setStatus] =
    useState("Connecting...");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const previousPriceRef =
    useRef(null);

  const usdInrRef =
    useRef(null);

  const usdInrTimeRef =
    useRef(0);

  const timerRef =
    useRef(null);

  const fetchUsdInr =
    useCallback(async () => {
      const now = Date.now();

      // Reuse FX rate for 1 hour.
      if (
        usdInrRef.current &&
        now - usdInrTimeRef.current <
          FX_REFRESH_MS
      ) {
        return usdInrRef.current;
      }

      console.log(
        "Fetching USD/INR..."
      );

      const response =
        await fetch(
          `${USD_INR_API}?_=${now}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `USD/INR HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const rate =
        extractUsdInr(data);

      if (!rate) {
        throw new Error(
          "Invalid USD/INR response"
        );
      }

      usdInrRef.current = rate;
      usdInrTimeRef.current = now;

      return rate;
    }, []);

  const fetchGoldRate =
    useCallback(async () => {
      try {
        console.log(
          "================================"
        );

        console.log(
          "Fetching live gold rate..."
        );

        setStatus(
          "Updating..."
        );

        // Gold + cached FX
        const [
          goldResponse,
          usdInr,
        ] = await Promise.all([
          fetch(
            `${GOLD_API}?_=${Date.now()}`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),
          fetchUsdInr(),
        ]);

        if (!goldResponse.ok) {
          throw new Error(
            `Gold API HTTP ${goldResponse.status}`
          );
        }

        const goldData =
          await goldResponse.json();

        const goldUsd =
          extractGoldPrice(
            goldData
          );

        if (!goldUsd) {
          throw new Error(
            "Gold API returned no valid XAU price"
          );
        }

        /*
          Gold API:
          XAU = USD per troy ounce

          1 troy ounce =
          31.1034768 grams
        */

        const pricePerGram =
          (goldUsd * usdInr) /
          TROY_OUNCE_GRAMS;

        if (
          !Number.isFinite(
            pricePerGram
          ) ||
          pricePerGram <= 0
        ) {
          throw new Error(
            "Calculated gold price is invalid"
          );
        }

        const previous =
          previousPriceRef.current;

        if (
          Number.isFinite(previous)
        ) {
          if (
            pricePerGram > previous
          ) {
            setDirection(1);
          } else if (
            pricePerGram < previous
          ) {
            setDirection(-1);
          } else {
            setDirection(0);
          }
        }

        previousPriceRef.current =
          pricePerGram;

        setPrice(
          pricePerGram
        );

        setConnected(true);

        setStatus(
          "LIVE GOLD FEED"
        );

        setLastUpdated(
          new Date()
        );

        console.log(
          "XAU/USD:",
          goldUsd
        );

        console.log(
          "USD/INR:",
          usdInr
        );

        console.log(
          "24K INR/GRAM:",
          pricePerGram
        );

        console.log(
          "================================"
        );
      } catch (error) {
        console.error(
          "LIVE GOLD ERROR:",
          error
        );

        /*
          Do NOT erase the last valid
          price if we already received one.
        */

        if (
          Number.isFinite(
            previousPriceRef.current
          )
        ) {
          setConnected(false);

          setStatus(
            "Using last verified rate"
          );
        } else {
          setConnected(false);

          setStatus(
            "Gold feed unavailable"
          );
        }
      }
    }, [fetchUsdInr]);

  useEffect(() => {
    fetchGoldRate();

    timerRef.current =
      window.setInterval(
        fetchGoldRate,
        GOLD_REFRESH_MS
      );

    return () => {
      if (timerRef.current) {
        window.clearInterval(
          timerRef.current
        );
      }
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

          {/* BRAND */}
          <div className="gold-rate-brand">
            <span
              className={`gold-live-dot ${
                connected
                  ? "is-live"
                  : ""
              }`}
            />

            <span>
              LIVE GOLD RATE
            </span>
          </div>

          <span className="gold-separator" />

          {/* 24K PRICE */}
          <div className="gold-rate-item">
            <span className="gold-purity">
              24K
            </span>

            <strong>
              {formatINR(price)}
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
                ? "up"
                : direction < 0
                ? "down"
                : ""
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
                ? "RISING"
                : direction < 0
                ? "FALLING"
                : "LIVE MARKET"}
            </span>
          </div>

          <span className="gold-separator" />

          {/* CONNECTION */}
          <div
            className={`gold-connection ${
              connected
                ? "online"
                : "offline"
            }`}
          >
            {connected ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            <span>
              {connected
                ? "LIVE"
                : "OFFLINE"}
            </span>
          </div>

          {/* LAST UPDATE */}
          <span className="gold-update">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString(
                  "en-IN"
                )}`
              : status}
          </span>

        </div>
      </div>
    </div>
  );
}