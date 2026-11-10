// components/MobileAppSection.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Radio,
  ShieldCheck,
  Bell,
  LayoutGrid,
  Apple,
  PlayCircle,
} from "lucide-react";

const FEATURES = [
  { icon: Radio, label: "Real-time Data" },
  { icon: ShieldCheck, label: "Secure Trading" },
  { icon: Bell, label: "Price Alerts" },
  { icon: LayoutGrid, label: "All Markets" },
];

const STATS = [
  { value: "4.8", label: "App Store" },
  { value: "4.7", label: "Google Play" },
  { value: "1M+", label: "Downloads" },
];

const CACHE_KEY = "cv_mobile_btc_price_v1";

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
    // non-fatal
  }
}

async function fetchBtc() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin",
          vs_currencies: "usd",
          include_24hr_change: true,
        },
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

export default function MobileAppSection() {
  const { data } = useQuery({
    queryKey: ["mobile-app-btc"],
    queryFn: fetchBtc,
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: 1,
  });

  const btcPrice = data?.bitcoin?.usd;
  const btcChange = data?.bitcoin?.usd_24h_change;
  const btcIsUp = typeof btcChange === "number" && btcChange >= 0;

  return (
    <section className="py-16 md:py-24 px-6 border-t border-white/5 overflow-hidden [html.light_&]:border-black/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
            Mobile Trading
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">
            Trade On The Go
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 [html.light_&]:text-gray-600">
            Take your trading anywhere with our powerful mobile app.
            Full-featured trading, real-time alerts, and secure access to all
            markets in the palm of your hand.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0 [html.light_&]:bg-green-500/5">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-gray-200 [html.light_&]:text-gray-800">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/25 transition-colors [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10"
            >
              <Apple className="w-6 h-6 text-white [html.light_&]:text-gray-900" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] text-gray-400 [html.light_&]:text-gray-500">
                  Download on the
                </span>
                <span className="block text-sm font-semibold text-white [html.light_&]:text-gray-900">
                  App Store
                </span>
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/25 transition-colors [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10"
            >
              <PlayCircle className="w-6 h-6 text-white [html.light_&]:text-gray-900" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] text-gray-400 [html.light_&]:text-gray-500">
                  Get it on
                </span>
                <span className="block text-sm font-semibold text-white [html.light_&]:text-gray-900">
                  Google Play
                </span>
              </span>
            </a>
          </div>

          <div className="flex flex-wrap gap-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-white [html.light_&]:text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 [html.light_&]:text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating phone-mock with live ticker card */}
        <div className="flex-1 w-full flex justify-center">
          <div className="relative w-full max-w-[280px] rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-green-950/50 to-[#080B11] p-4 shadow-2xl [html.light_&]:border-black/10 [html.light_&]:from-green-100/70 [html.light_&]:to-white">
            <div className="absolute -inset-x-6 -top-10 h-40 bg-green-500/25 blur-[70px] rounded-full pointer-events-none [html.light_&]:bg-green-300/35" />

            <div className="relative rounded-2xl bg-[#000000] border border-white/10 p-4 [html.light_&]:bg-white/70 [html.light_&]:border-black/10">
              <video
                src="/vid/graphs-v2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white [html.light_&]:text-gray-900">
                  BTC/USD
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-white [html.light_&]:text-gray-900">
                    {typeof btcPrice === "number"
                      ? `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "$42,850"}
                  </p>
                  <p
                    className={`text-[11px] font-semibold ${
                      btcIsUp
                        ? "text-emerald-400 [html.light_&]:text-emerald-600"
                        : "text-red-400 [html.light_&]:text-red-600"
                    }`}
                  >
                    {typeof btcChange === "number"
                      ? `${btcIsUp ? "+" : ""}${btcChange.toFixed(1)}%`
                      : "+2.3%"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white [html.light_&]:text-gray-900">
                  AAPL
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-white [html.light_&]:text-gray-900">
                    $182.63
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-400 [html.light_&]:text-emerald-600">
                    +1.5%
                  </p>
                </div>
              </div>

              <div className="h-16 flex items-end gap-1">
                {[40, 55, 35, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-green-600 to-green-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2 [html.light_&]:text-gray-400">
                Live Trading Chart
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
