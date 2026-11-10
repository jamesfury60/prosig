// app/stocks/page.jsx
"use client";

import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useSimulatedTicker } from "@/components/others/useSimulatedTicker";
import Link from "next/link";

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 182.63 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 245.6 },
  { symbol: "MSFT", name: "Microsoft", base: 378.45 },
  { symbol: "AMZN", name: "Amazon", base: 152.3 },
  { symbol: "GOOGL", name: "Alphabet", base: 138.21 },
  { symbol: "NVDA", name: "NVIDIA", base: 468.35 },
  { symbol: "META", name: "Meta Platforms", base: 312.88 },
  { symbol: "NFLX", name: "Netflix", base: 421.5 },
];

const POINTS = [
  "3,000+ listed companies across US, EU, and Asian exchanges",
  "Fractional shares start investing from $1",
  "Real-time quotes and instant order fills",
  "Zero-commission trading on standard accounts",
];

function StockCard({ stock }) {
  const { price, changePct } = useSimulatedTicker(stock.base, {
    volatility: 0.001,
  });
  const isUp = changePct >= 0;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white [html.light_&]:text-gray-900">
          {stock.symbol}
        </span>
        <span
          className={`text-xs font-semibold ${
            isUp
              ? "text-emerald-400 [html.light_&]:text-emerald-600"
              : "text-red-400 [html.light_&]:text-red-600"
          }`}
        >
          {isUp ? "+" : ""}
          {changePct.toFixed(2)}%
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2 [html.light_&]:text-gray-500">
        {stock.name}
      </p>
      <p className="text-lg font-bold text-white [html.light_&]:text-gray-900">
        ${price.toFixed(2)}
      </p>
    </div>
  );
}

export default function StocksPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            Stocks
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Own A Piece Of The <br className="hidden md:block" /> Companies You
            Believe In
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Trade thousands of global equities alongside your crypto and forex
            positions same account, same balance, one dashboard.
          </p>
          <Link
            href="/auth"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all inline-flex items-center gap-2"
          >
            Start Trading Stocks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature row */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img
              src="/img/6.jpg"
              alt="Stock trading screenshot"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Global Equities
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              Every Major Exchange, One Login
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 [html.light_&]:text-gray-600">
              No separate brokerage account needed. Buy fractional shares in the
              companies you already follow, right alongside your other markets.
            </p>
            <ul className="space-y-2.5">
              {POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-sm text-gray-300 [html.light_&]:text-gray-700"
                >
                  <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0 [html.light_&]:bg-green-500/5">
                    <Check className="w-3 h-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Popular stocks */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Popular Stocks
            </h2>
            <p className="text-gray-400 text-sm [html.light_&]:text-gray-600">
              Demo pricing connect an equities data provider for live quotes.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {STOCKS.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Start with <span className="text-green-400">any amount</span>
          </h2>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2 mt-4"
          >
            Open an Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
