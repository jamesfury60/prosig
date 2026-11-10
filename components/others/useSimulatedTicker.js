// components/useSimulatedTicker.js
"use client";

import { useEffect, useState } from "react";

/**
 * Simulates a live-ticking price for markets with no free real-time API
 * available (precious metals, equities). Runs a small random walk off a
 * realistic base price entirely client-side after mount, so it never
 * touches SSR/hydration.
 *
 * Swap this out for a real feed once you have API credentials, e.g.:
 *   - Metals: metals-api.com, GoldAPI.io
 *   - Stocks: Finnhub, Twelve Data, Alpha Vantage (all have free tiers
 *     that just need a signup + API key)
 */
export function useSimulatedTicker(
  basePrice,
  { volatility = 0.0015, intervalMs = 4000 } = {},
) {
  const [price, setPrice] = useState(basePrice);
  const [changePct, setChangePct] = useState(0);

  useEffect(() => {
    const openPrice = basePrice;

    const interval = setInterval(() => {
      setPrice((prev) => {
        const drift = (Math.random() - 0.48) * volatility * prev;
        const next = Math.max(0.01, prev + drift);
        setChangePct(((next - openPrice) / openPrice) * 100);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [basePrice, volatility, intervalMs]);

  return { price, changePct };
}
