// app/crypto/page.jsx
"use client";

import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import LivePrices from "@/components/LivePrices";

const POINTS = [
  "300+ tokens across major chains",
  "Smart routing for the best available price",
  "Cold-storage custody on the majority of assets",
  "Instant swaps between any supported pair",
];

export default function CryptoPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            Cryptocurrency
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Every Major Coin, <br className="hidden md:block" /> One Order Book
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Buy, sell, and swap top cryptocurrencies with institutional-grade
            custody and execution that finds the best price automatically.
          </p>
          <Link
            href="/auth"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all inline-flex items-center gap-2"
          >
            Start Trading Crypto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature row */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img
              src="/img/5.jpg"
              alt="Crypto trading screenshot"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Built For Crypto
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              Deep Liquidity, Real Custody
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 [html.light_&]:text-gray-600">
              Whether you&apos;re stacking sats or rotating between altcoins,
              your assets sit behind the same security controls institutional
              custodians use.
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

      {/* Real-time crypto grid */}
      <LivePrices />

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Buy your first coin in{" "}
            <span className="text-green-400">under a minute</span>
          </h2>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2 mt-4"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
