import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff
} from "lucide-react";

import "./LiveGoldNavbar.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://rahul-jewellers-backend-jlr0.onrender.com";

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `₹${Math.round(
    value
  ).toLocaleString("en-IN")}`;
}

export default function LiveGoldNavbar() {
  const [price, setPrice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [direction, setDirection] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const previous = useRef(null);

  useEffect(() => {
    let eventSource = null;
    let fallbackInterval = null;

    // REST Polling function as primary / backup fetch loop
    const fetchGoldRateRest = async () => {
      try {
        const response = await fetch(`${API_URL}/api/gold-rate`);
        const data = await response.json();
        if (data.success && data.priceInrPerGram) {
          const newPrice = Number(data.priceInrPerGram);
          if (Number.isFinite(newPrice)) {
            if (Number.isFinite(previous.current)) {
              if (newPrice > previous.current) setDirection(1);
              else if (newPrice < previous.current) setDirection(-1);
              else setDirection(0);
            }
            previous.current = newPrice;
            setPrice(newPrice);
            setConnected(data.connected === true);
            setLastUpdated(new Date());
          }
        }
      } catch (err) {
        console.error("Rest gold rate fetch error:", err);
      }
    };

    fetchGoldRateRest();

    // Fallback interval polling loop every 15 seconds to ensure live continuity
    fallbackInterval = setInterval(fetchGoldRateRest, 15000);

    // Connect via Server-Sent Events (SSE) for real-time live streaming
    try {
      eventSource = new EventSource(`${API_URL}/api/gold-rate/stream`);

      eventSource.onopen = () => {
        console.log("✅ Rahul Jewellers 22K gold stream connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "status") {
            setConnected(data.connected === true);
            return;
          }

          if (data.type !== "gold") {
            return;
          }

          const newPrice = Number(data.priceInrPerGram);

          if (!Number.isFinite(newPrice)) {
            return;
          }

          if (Number.isFinite(previous.current)) {
            if (newPrice > previous.current) {
              setDirection(1);
            } else if (newPrice < previous.current) {
              setDirection(-1);
            } else {
              setDirection(0);
            }
          }

          previous.current = newPrice;
          setPrice(newPrice);
          setConnected(data.connected === true);
          setLastUpdated(new Date());
        } catch (error) {
          console.error("Gold stream error:", error);
        }
      };

      eventSource.onerror = () => {
        console.error("Gold stream disconnected");
        setConnected(false);
      };
    } catch (err) {
      console.warn("SSE connection error:", err);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  return (
    <div className="gold-rate-bar" role="status">
      <div className="gold-rate-marquee">
        <div className="gold-rate-content">
          <div className="gold-rate-brand">
            <span className={`gold-live-dot ${connected ? "is-live" : ""}`} />
            <span>LIVE GOLD RATE</span>
          </div>

          <span className="gold-separator" />

          {/* EXCLUSIVE 22K DISPLAY */}
          <div className="gold-rate-item">
            <span className="gold-purity">22K</span>
            <strong>{formatINR(price)}</strong>
            <span className="gold-unit">/g</span>
          </div>

          <span className="gold-separator" />

          <div
            className={`gold-movement ${
              direction > 0 ? "up" : direction < 0 ? "down" : ""
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

          <div className={`gold-connection ${connected ? "online" : "offline"}`}>
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{connected ? "LIVE" : "OFFLINE"}</span>
          </div>

          <span className="gold-update">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}`
              : "Connecting..."}
          </span>
        </div>
      </div>
    </div>
  );
}