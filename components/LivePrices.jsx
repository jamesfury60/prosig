// components/LivePrices.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TrendingUp, TrendingDown } from "lucide-react";

const COINS = [
  {
    id: "tether-gold",
    symbol: "XAUT",
    pair: "XAUT/USDT",
    color: "#D4AF37",
    glyph: "Ŧ",
    tag: "Trending",
    tagStyle: "gold",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    pair: "DOGE/USDT",
    color: "#C2A633",
    glyph: "Ð",
    tag: "New",
    tagStyle: "gray",
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    pair: "BTC/USDT",
    color: "#F7931A",
    glyph: "₿",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    pair: "ETH/USDT",
    color: "#FFFFFF",
    textColor: "#0f172a",
    glyph: "Ξ",
  },
  {
    id: "solana",
    symbol: "SOL",
    pair: "SOL/USDT",
    color: "#14F195",
    textColor: "#0f172a",
    glyph: "◎",
  },
  {
    id: "hyperliquid",
    symbol: "HYPE",
    pair: "HYPE/USDT",
    color: "#1a1a1a",
    glyph: "H",
  },
];

const IDS = COINS.map((c) => c.id).join(",");
const CACHE_KEY = "cv_live_prices_grid_v1";

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable — non-fatal
  }
}

async function fetchPrices() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: { ids: IDS, vs_currencies: "usd", include_24hr_change: true },
        timeout: 8000,
      },
    );
    writeCache(data);
    return data;
  } catch (err) {
    const cached = readCache();
    if (cached) return cached;
    throw err;
  }
}

function TagRibbon({ tag, tagStyle }) {
  if (!tag) return null;
  const bg =
    tagStyle === "gold"
      ? "bg-gradient-to-r from-amber-500 to-amber-300 text-black"
      : "bg-gradient-to-r from-gray-500 to-gray-300 text-black";

  return (
    <span
      className={`absolute top-0 right-0 ${bg} text-[9px] sm:text-[11px] font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-bl-lg sm:rounded-bl-xl rounded-tr-2xl`}
    >
      {tag}
    </span>
  );
}

export default function LivePrices() {
  const {
    data: prices,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["live-prices-grid"],
    queryFn: fetchPrices,
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: 1,
  });

  return (
    <section
      id="prices"
      className="py-16 px-6 border-t border-white/5 [html.light_&]:border-black/10"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Live Markets
            </span>
            <h2 className="text-xl md:text-2xl font-bold mt-1 text-white [html.light_&]:text-gray-900">
              Real-Time Crypto Prices
            </h2>
          </div>
          {/* <span className="hidden sm:flex items-center gap-2 text-xs text-gray-500 [html.light_&]:text-gray-500">
            <span
              className={`w-2 h-2 rounded-full ${isError ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`}
            />
            {isError ? "Showing cached prices" : "Updating live"}
          </span> */}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {COINS.map((coin) => {
            const data = prices?.[coin.id];
            const change = data?.usd_24h_change;
            const isUp = typeof change === "number" && change >= 0;

            return (
              <div
                key={coin.id}
                className="relative overflow-hidden p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 [html.light_&]:from-black/[0.035] [html.light_&]:to-black/[0.01] [html.light_&]:border-black/10"
              >
                <TagRibbon tag={coin.tag} tagStyle={coin.tagStyle} />

                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0 ring-1 ring-black/10"
                    style={{
                      backgroundColor: coin.color,
                      color: coin.textColor || "white",
                    }}
                  >
                    {coin.glyph}
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-white truncate [html.light_&]:text-gray-900">
                    {coin.pair}
                  </span>
                </div>

                {isPending ? (
                  <div className="flex items-center justify-between animate-pulse">
                    <div className="h-5 sm:h-6 w-16 sm:w-24 bg-white/10 rounded [html.light_&]:bg-black/10" />
                    <div className="h-4 sm:h-5 w-10 sm:w-14 bg-white/10 rounded [html.light_&]:bg-black/10" />
                  </div>
                ) : !data ? (
                  <span className="text-xs sm:text-sm text-gray-500 [html.light_&]:text-gray-500">
                    Unavailable
                  </span>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base sm:text-2xl font-semibold text-white truncate [html.light_&]:text-gray-900">
                      {data.usd.toLocaleString(undefined, {
                        minimumFractionDigits: data.usd < 1 ? 4 : 1,
                        maximumFractionDigits: data.usd < 1 ? 4 : 1,
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 sm:gap-1 text-xs sm:text-lg font-semibold shrink-0 ${
                        isUp
                          ? "text-emerald-400 [html.light_&]:text-emerald-600"
                          : "text-red-400 [html.light_&]:text-red-600"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      {isUp ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
