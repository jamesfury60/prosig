// app/stake/page.jsx
"use client";

import {
  ArrowRight,
  Lock,
  Unlock,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import Link from "next/link";

const POOLS = [
  {
    coin: "ETH",
    apy: "12.5%",
    term: "90 Days",
    type: "Locked",
    color: "#627EEA",
  },
  {
    coin: "USDT",
    apy: "6.2%",
    term: "Flexible",
    type: "Flexible",
    color: "#26A17B",
  },
  {
    coin: "SOL",
    apy: "9.8%",
    term: "30 Days",
    type: "Locked",
    color: "#14F195",
  },
  {
    coin: "ADA",
    apy: "11.1%",
    term: "60 Days",
    type: "Locked",
    color: "#0033AD",
  },
];

const STEPS = [
  {
    title: "Pick a pool",
    body: "Choose a coin and a term that matches how long you're comfortable committing funds.",
  },
  {
    title: "Stake your amount",
    body: "Deposit as much or as little as the pool allows most start from just a few dollars.",
  },
  {
    title: "Earn automatically",
    body: "Rewards accrue continuously and post to your balance without any manual claiming.",
  },
];

export default function StakePage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/15 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-emerald-400/20" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-6 [html.light_&]:bg-emerald-500/5 [html.light_&]:border-emerald-400/30 [html.light_&]:text-emerald-600">
            Stake &amp; Earn
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Put Your Crypto <br className="hidden md:block" /> To Work
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Earn passive rewards on assets you already hold. Choose a flexible
            or fixed-term pool and watch your balance grow.
          </p>
          <Link
            href="/auth"
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-emerald-600/25 transition-all inline-flex items-center gap-2"
          >
            Start Staking <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pools */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Popular Staking Pools
            </h2>
            <p className="text-gray-400 text-sm md:text-base [html.light_&]:text-gray-600">
              Sample rates below actual APY varies with pool demand and updates
              in your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {POOLS.map((pool) => (
              <div
                key={pool.coin}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: pool.color }}
                  >
                    {pool.coin.slice(0, 2)}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                      pool.type === "Flexible"
                        ? "bg-emerald-500/10 text-emerald-400 [html.light_&]:bg-emerald-500/5 [html.light_&]:text-emerald-600"
                        : "bg-green-500/10 text-green-400 [html.light_&]:bg-green-500/5 [html.light_&]:text-green-600"
                    }`}
                  >
                    {pool.type === "Flexible" ? (
                      <Unlock className="w-2.5 h-2.5" />
                    ) : (
                      <Lock className="w-2.5 h-2.5" />
                    )}
                    {pool.term}
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 [html.light_&]:text-emerald-600">
                  {pool.apy}
                </p>
                <p className="text-xs text-gray-500 [html.light_&]:text-gray-500">
                  Estimated APY
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img
              src="/img/10.jpg"
              alt="Staking dashboard"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider [html.light_&]:text-emerald-600">
              How It Works
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              Staking, Simplified
            </h2>
            <div className="flex flex-col mt-4">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="flex gap-4 border-t border-white/10 py-5 first:pt-0 [html.light_&]:border-black/10"
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 [html.light_&]:bg-emerald-500/5">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-white [html.light_&]:text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed [html.light_&]:text-gray-600">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2 text-sm text-gray-300 [html.light_&]:text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Staked assets remain in custody-grade cold storage
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 [html.light_&]:text-gray-700">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Rewards accrue daily, visible in real time
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600/5 blur-3xl pointer-events-none [html.light_&]:bg-emerald-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Start earning <span className="text-emerald-400">today</span>
          </h2>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2 mt-4"
          >
            Explore Pools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
