// app/markets/page.jsx
"use client";

import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LivePrices from "@/components/LivePrices";
import Link from "next/link";

const STATS = [
  { value: "180+", label: "Tradable Instruments" },
  { value: "140+", label: "Countries Supported" },
  { value: "0.02%", label: "Avg. Spread" },
  { value: "24/7", label: "Market Access" },
];

const CATEGORIES = [
  {
    tag: "Cryptocurrency",
    img: "/img/1.png",
    title: "300+ tokens, one order book",
    body: "Trade major and emerging coins with smart order routing that finds the best price across liquidity pools automatically.",
    points: [
      "BTC, ETH, SOL and 300+ altcoins",
      "Spot and instant swap",
      "Cold-storage custody",
    ],
    reverse: false,
  },
  {
    tag: "Forex",
    img: "/img/2.jpg",
    title: "Major, minor, and exotic pairs",
    body: "Access tight spreads on the world's most liquid currency pairs, with execution built for speed during high-volatility sessions.",
    points: [
      "50+ currency pairs",
      "Sub-second execution",
      "Live economic calendar",
    ],
    reverse: true,
  },
  {
    tag: "Stocks",
    img: "/img/4.jpg",
    title: "Global equities, fractional shares",
    body: "Buy into leading companies across US, EU, and Asian exchange start with as little as $1 using fractional ownership.",
    points: [
      "3,000+ listed companies",
      "Fractional share investing",
      "Real-time order fills",
    ],
    reverse: false,
  },
  {
    tag: "Commodities",
    img: "/img/3.jpg",
    title: "Gold, oil, and beyond",
    body: "Hedge your portfolio with direct exposure to precious metals and energy markets, priced against live spot rates.",
    points: [
      "Gold, silver, oil, natural gas",
      "Live spot pricing",
      "Flexible contract sizes",
    ],
    reverse: true,
  },
];

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            All Markets
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Trade Every Market, <br className="hidden md:block" />
            All From One Account
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Crypto, forex, stocks, and commodities Prosignalbase gives you a
            single dashboard, one balance, and institutional-grade execution
            across every asset class.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#live-prices"
              className="px-8 py-3.5 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 transition-colors [html.light_&]:border-black/15 [html.light_&]:text-gray-900 [html.light_&]:hover:bg-black/5"
            >
              View Live Prices
            </Link>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-12 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-4xl font-bold">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1 [html.light_&]:text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category showcase rows */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-24">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.tag}
              className={`flex flex-col md:items-center gap-8 md:gap-14 ${
                cat.reverse ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              <div className="flex-1 w-full">
                <img
                  src={cat.img}
                  alt={cat.tag}
                  className="border border-white/10 rounded-xl"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
                  {cat.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
                  {cat.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 [html.light_&]:text-gray-600">
                  {cat.body}
                </p>
                <ul className="space-y-2.5">
                  {cat.points.map((point) => (
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
          ))}
        </div>
      </section>

      {/* Live prices */}
      <div id="live-prices">
        <LivePrices />
      </div>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Start trading in{" "}
            <span className="text-green-400">under 5 minutes</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 [html.light_&]:text-gray-600">
            No paperwork, no wait times verify your identity and fund your
            account to start trading today.
          </p>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2"
          >
            Open an Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
