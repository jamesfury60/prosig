// app/commodities/page.jsx
"use client";

import { ArrowRight, TrendingUp, TrendingDown, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useSimulatedTicker } from "@/components/others/useSimulatedTicker";
import Link from "next/link";

const COMMODITIES = [
  { symbol: "XAU", name: "Gold", base: 1950.25, color: "#d4af37" },
  { symbol: "XAG", name: "Silver", base: 23.45, color: "#c0c0c0" },
  { symbol: "WTI", name: "Crude Oil (WTI)", base: 78.92, color: "#3f3f3f" },
  { symbol: "NG", name: "Natural Gas", base: 2.61, color: "#4ade80" },
];

const POINTS = [
  "Gold, silver, oil, and natural gas in one account",
  "Live spot pricing, no separate commodities broker",
  "Flexible contract sizes for any account size",
  "Hedge portfolio risk without leaving the platform",
];

function CommodityCard({ item }) {
  const { price, changePct } = useSimulatedTicker(item.base, {
    volatility: 0.001,
  });
  const isUp = changePct >= 0;

  return (
    <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: item.color }}
        >
          {item.symbol}
        </span>
        <span className="text-sm font-semibold text-white [html.light_&]:text-gray-900">
          {item.name}
        </span>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white [html.light_&]:text-gray-900">
          ${price.toFixed(2)}
        </p>
        <p
          className={`flex items-center justify-end gap-1 text-xs font-semibold ${
            isUp
              ? "text-emerald-400 [html.light_&]:text-emerald-600"
              : "text-red-400 [html.light_&]:text-red-600"
          }`}
        >
          {isUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isUp ? "+" : ""}
          {changePct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function CommoditiesPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-600/15 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-amber-400/20" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-6 [html.light_&]:bg-amber-500/5 [html.light_&]:border-amber-400/30 [html.light_&]:text-amber-600">
            Commodities
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Hedge With Real-World <br className="hidden md:block" /> Assets
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Gold, silver, oil, and natural gas trade the world&rsquo;s oldest
            hedges against inflation and volatility, right alongside your other
            markets.
          </p>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-amber-600/25 transition-all inline-flex items-center gap-2"
          >
            Trade Commodities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature row */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img
              src="/img/7.jpg"
              alt="Commodities trading screenshot"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider [html.light_&]:text-amber-600">
              Why Commodities
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              A Hedge That Doesn&rsquo;t Track Your Other Assets
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 [html.light_&]:text-gray-600">
              Precious metals and energy markets tend to move independently of
              stocks and crypto useful diversification when the rest of your
              portfolio is correlated.
            </p>
            <ul className="space-y-2.5">
              {POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-sm text-gray-300 [html.light_&]:text-gray-700"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 [html.light_&]:bg-amber-500/5">
                    <Check className="w-3 h-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Live Commodity Prices
            </h2>
            <p className="text-gray-400 text-sm [html.light_&]:text-gray-600">
              Demo pricing connect a commodities data provider for live spot
              rates.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMODITIES.map((item) => (
              <CommodityCard key={item.symbol} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-amber-600/5 blur-3xl pointer-events-none [html.light_&]:bg-amber-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Diversify with <span className="text-amber-400">real assets</span>
          </h2>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-amber-600/20 transition-all inline-flex items-center gap-2 mt-4"
          >
            Open an Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
