// components/WhyChooseSection.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  RefreshCw,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const MOVER_IDS = ["bitcoin", "ethereum", "ripple", "binancecoin"];

const MOVER_META = {
  bitcoin: {
    symbol: "BTC",
    label: "Bitcoin (BTC)",
    color: "#F7931A",
    glyph: "₿",
  },
  ethereum: { symbol: "ETH", label: "Ethereum", color: "#627EEA", glyph: "Ξ" },
  ripple: {
    symbol: "XRP",
    label: "Ripple (XRP)",
    color: "#6b7280",
    glyph: "✕",
  },
  binancecoin: {
    symbol: "BNB",
    label: "BNB Coin",
    color: "#F0B90B",
    glyph: "◆",
  },
};

const MOVERS_CACHE_KEY = "cv_movers_cache_v1";
const CHART_CACHE_KEY = "cv_btc_chart_cache_v1";

function readCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — non-fatal, just skip caching
  }
}

async function fetchMovers() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: MOVER_IDS.join(","),
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      },
    );
    writeCache(MOVERS_CACHE_KEY, data);
    return data;
  } catch (err) {
    const cached = readCache(MOVERS_CACHE_KEY);
    if (cached) return cached;
    throw err;
  }
}

async function fetchBtcChart() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart",
      { params: { vs_currency: "usd", days: 1 } },
    );
    const prices = data.prices || [];
    writeCache(CHART_CACHE_KEY, prices);
    return prices;
  } catch (err) {
    const cached = readCache(CHART_CACHE_KEY);
    if (cached) return cached;
    throw err;
  }
}

function ChartSpark({ prices }) {
  if (!prices?.length) return null;

  const width = 600;
  const height = 140;
  const values = prices.map((p) => p[1]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = prices.map(([, price], i) => {
    const x = Number(((i / (prices.length - 1)) * width).toFixed(2));
    const y = Number((height - ((price - min) / range) * height).toFixed(2));
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="btcSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#btcSpark)" />
      <path
        d={linePath}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WhyChooseSection() {
  const {
    data: movers,
    isPending: moversLoading,
    isError: moversStale,
    dataUpdatedAt: moversUpdatedAt,
    refetch: refetchMovers,
  } = useQuery({
    queryKey: ["market-movers"],
    queryFn: fetchMovers,
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: 1,
  });

  const { data: btcChart, isPending: chartLoading } = useQuery({
    queryKey: ["btc-chart-24h"],
    queryFn: fetchBtcChart,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const btcPrice = movers?.bitcoin?.usd;
  const btcChange = movers?.bitcoin?.usd_24h_change;
  const btcIsUp = typeof btcChange === "number" && btcChange >= 0;

  const updatedLabel = moversUpdatedAt
    ? new Date(moversUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <section id="features" className="py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white [html.light_&]:text-gray-900">
            Why Choose Prosignalbase for Crypto?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base [html.light_&]:text-gray-600">
            Where innovation meets clarity — explore smarter crypto insights,
            trends, and tools in one place.
          </p>
        </div>

        {/* Movers + Market Cap row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Global Market Movers */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
            <h3 className="text-lg font-semibold mb-2 text-white [html.light_&]:text-gray-900">
              Global Market Movers
            </h3>
            <p className="text-gray-400 text-sm mb-8 [html.light_&]:text-gray-600">
              Driving liquidity, shaping trends, and powering the pulse of the
              digital asset world.
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {moversLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 [html.light_&]:bg-black/10" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-16 bg-white/10 rounded [html.light_&]:bg-black/10" />
                        <div className="h-2 w-10 bg-white/10 rounded [html.light_&]:bg-black/10" />
                      </div>
                    </div>
                  ))
                : MOVER_IDS.map((id) => {
                    const meta = MOVER_META[id];
                    const change = movers?.[id]?.usd_24h_change;
                    const isUp = typeof change === "number" && change >= 0;

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ring-1 ring-black/10"
                            style={{ backgroundColor: meta.color }}
                          >
                            {meta.glyph}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-200 truncate [html.light_&]:text-gray-800">
                              {meta.label}
                            </p>
                            <p
                              className={`text-[11px] font-medium ${
                                isUp
                                  ? "text-emerald-400 [html.light_&]:text-emerald-600"
                                  : "text-red-400 [html.light_&]:text-red-600"
                              }`}
                            >
                              {typeof change === "number"
                                ? `${isUp ? "+" : ""}${change.toFixed(2)}%`
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:text-gray-500 [html.light_&]:hover:text-gray-900"
                          aria-label={`View ${meta.label}`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Market Cap / BTC chart */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-semibold text-white [html.light_&]:text-gray-900">
                Market Cap
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => refetchMovers()}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:text-gray-500 [html.light_&]:hover:text-gray-900"
                  aria-label="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:text-gray-500 [html.light_&]:hover:text-gray-900"
                  aria-label="Info"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:text-gray-500 [html.light_&]:hover:text-gray-900"
                  aria-label="Open full view"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-4">
              <span
                className={`w-1.5 h-1.5 rounded-full ${moversStale ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`}
              />
              <span className="text-[11px] text-gray-500 [html.light_&]:text-gray-500">
                {moversStale ? "Showing cached data" : "Live market data"}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center text-sm font-bold text-white ring-1 ring-black/10">
                  ₿
                </div>
                <div>
                  <p className="text-sm font-medium text-white [html.light_&]:text-gray-900">
                    Bitcoin (BTC)
                  </p>
                  <p
                    className={`text-[11px] flex items-center gap-1 ${
                      btcIsUp
                        ? "text-emerald-400 [html.light_&]:text-emerald-600"
                        : "text-red-400 [html.light_&]:text-red-600"
                    }`}
                  >
                    {btcIsUp ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {typeof btcChange === "number"
                      ? `${btcChange.toFixed(2)}%`
                      : "—"}{" "}
                    (24H) Vol.
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white [html.light_&]:text-gray-900">
                {typeof btcPrice === "number"
                  ? `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>

            <div className="relative w-full h-32">
              <div className="absolute left-0 top-0 text-[10px] text-gray-500 [html.light_&]:text-gray-400">
                $150M+
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 [html.light_&]:text-gray-400">
                $0
              </div>
              <div className="absolute left-0 bottom-0 text-[10px] text-gray-500 [html.light_&]:text-gray-400">
                $150M-
              </div>

              {chartLoading ? (
                <div className="w-full h-full flex items-end pl-8">
                  <div className="w-full h-16 bg-white/5 rounded animate-pulse [html.light_&]:bg-black/5" />
                </div>
              ) : (
                <div className="pl-8 h-full">
                  <ChartSpark prices={btcChart} />
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-500 mt-2 [html.light_&]:text-gray-500">
              Updated {updatedLabel}
            </p>
          </div>
        </div>

        {/* Feature cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-start [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
            <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl [html.light_&]:bg-green-400/25" />
              <div className="relative w-10 h-10 rounded-full border-2 border-green-400" />
              <div className="absolute w-5 h-5 rounded-full border-2 border-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white [html.light_&]:text-gray-900">
              Next-Level Digital Security
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
              Your assets stay fortified with advanced encryption and biometric
              defense, built for tomorrow&rsquo;s threats.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-start [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
            <div className="relative w-24 h-16 mb-6 flex items-center">
              <div className="absolute -inset-2 rounded-full bg-amber-300/20 blur-2xl [html.light_&]:bg-amber-300/30" />
              <div className="relative w-11 h-11 rounded-full bg-green-400 border-2 border-[#080B11] flex items-center justify-center text-white font-bold text-xs z-10 [html.light_&]:border-white">
                Ξ
              </div>
              <div className="relative -ml-3 w-11 h-11 rounded-full bg-amber-500 border-2 border-[#080B11] flex items-center justify-center text-white font-bold text-xs z-20 [html.light_&]:border-white">
                ₿
              </div>
              <div className="relative -ml-3 w-11 h-11 rounded-full bg-yellow-400 border-2 border-[#080B11] flex items-center justify-center text-white font-bold text-xs z-10 [html.light_&]:border-white">
                ◆
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white [html.light_&]:text-gray-900">
              Trailblazing Blockchain Innovation
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
              Step into the next era of finance powered by revolutionary
              blockchain infrastructure and vision.
            </p>
          </div>
        </div>

        {/* Reports card */}
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
          <div className="max-w-xs">
            <h3 className="text-lg font-semibold mb-2 text-white [html.light_&]:text-gray-900">
              Transaction and Financial Reports
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
              Driving liquidity, shaping trends, and powering the pulse of the
              digital asset world.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            {[
              {
                label: "Balanced",
                value: "$146,440.86",
                change: "6.6%",
                positive: true,
              },
              {
                label: "Profit",
                value: "$24,110.10",
                change: "+206.12%",
                positive: true,
              },
              {
                label: "Avg. Trade",
                value: "$32,580.30",
                change: "+100.84%",
                positive: true,
              },
              {
                label: "Lost",
                value: "$1,440.86",
                change: "-104.45%",
                positive: false,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white/5 border border-white/5 min-w-[150px] [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10"
              >
                <p className="text-xs text-gray-400 mb-1 [html.light_&]:text-gray-500">
                  {stat.label}
                </p>
                <p className="text-base font-bold text-white [html.light_&]:text-gray-900">
                  {stat.value}{" "}
                  <span
                    className={`text-[11px] font-medium ${
                      stat.positive
                        ? "text-emerald-400 [html.light_&]:text-emerald-600"
                        : "text-red-400 [html.light_&]:text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
