import React, { useState, useEffect } from 'react';

export default function LiveGoldNavbar() {
  const [goldRates, setGoldRates] = useState({
    carat24: null,
    carat22: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchGoldRates = async () => {
    const apiKey = import.meta.env.VITE_GOLD_API_KEY;
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }

    try {
      // Fetching 24k Gold (XAU in USD/INR or your preferred currency)
      const res24K = await fetch("https://www.goldapi.io/api/XAU/INR", {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json"
        }
      });
      const data24K = await res24K.json();

      // GoldAPI provides price_gram_24k, price_gram_22k, etc.
      if (data24K && data24K.price_gram_24k) {
        setGoldRates({
          carat24: data24K.price_gram_24k.toFixed(2),
          carat22: data24K.price_gram_22k ? data24K.price_gram_22k.toFixed(2) : (data24K.price_gram_24k * (22/24)).toFixed(2),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gold rates:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldRates();
    // Poll every 60 seconds to update rates automatically
    const interval = setInterval(fetchGoldRates, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-neutral-900 text-amber-400 py-1.5 px-4 text-xs font-semibold flex justify-between items-center border-b border-amber-500/20">
      <div className="flex items-center space-x-2">
        <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Live Rates</span>
        <span>(Per Gram):</span>
      </div>
      <div className="flex space-x-6">
        {loading ? (
          <span>Loading rates...</span>
        ) : (
          <>
            <div>
              <span className="text-gray-400 mr-1">24K:</span>
              <span className="text-white">₹ {goldRates.carat24 || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-400 mr-1">22K:</span>
              <span className="text-white">₹ {goldRates.carat22 || "N/A"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}