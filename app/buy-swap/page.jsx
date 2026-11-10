// app/buy-swap/page.jsx
"use client";

import {
  ArrowRight,
  CreditCard,
  Landmark,
  Wallet,
  Repeat,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const PAYMENT_METHODS = [
  {
    icon: CreditCard,
    title: "Debit / Credit Card",
    body: "Instant purchases with major cards, funds available immediately.",
  },
  {
    icon: Landmark,
    title: "Bank Transfer",
    body: "Lower fees for larger purchases, typically clears same-day.",
  },
  {
    icon: Wallet,
    title: "Existing Balance",
    body: "Buy directly from your account balance with zero extra steps.",
  },
];

const STEPS = [
  {
    title: "Choose an asset",
    body: "Pick any supported coin or token and enter the amount you want.",
  },
  {
    title: "Select a payment method",
    body: "Card, bank transfer, or your existing balance whichever suits you.",
  },
  {
    title: "Confirm and receive",
    body: "Your purchase settles to your wallet in seconds, ready to hold or swap.",
  },
];

const SWAP_PAIRS = [
  "BTC → ETH",
  "ETH → USDT",
  "SOL → BTC",
  "USDT → XRP",
  "BNB → USDT",
  "ADA → ETH",
];

export default function BuySwapPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            Buy &amp; Swap
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Buy Crypto And Swap <br className="hidden md:block" /> In Seconds
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Purchase with a card or bank transfer, or convert between assets
            instantly with smart routing that finds the best price.
          </p>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all inline-flex items-center gap-2"
          >
            Buy Crypto Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Payment methods row */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14 mb-10">
          <div className="flex-1 w-full">
            <img
              src="/img/8.jpg"
              alt="Buy flow screenshot"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Buy
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              Fund Your Wallet, Your Way
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed [html.light_&]:text-gray-600">
              Choose the payment method that works for you. Every option settles
              straight into your account balance, ready to trade or hold.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 [html.light_&]:bg-green-500/5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white [html.light_&]:text-gray-900">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                  {method.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Three Steps To Your First Trade
            </h2>
          </div>
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-4 border-t border-white/10 py-6 first:pt-0 [html.light_&]:border-black/10"
              >
                <span className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm shrink-0 [html.light_&]:bg-green-500/5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold mb-1 text-white [html.light_&]:text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swap */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img
              src="/img/9.jpg"
              alt="Swap interface screenshot"
              className="border border-white/10 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Swap
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              Convert Assets Instantly
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 [html.light_&]:text-gray-600">
              No order book to manage pick a pair, see your rate up front, and
              confirm. Smart routing checks liquidity across pools so you get
              the best available price.
            </p>
            <div className="flex flex-wrap gap-2">
              {SWAP_PAIRS.map((pair) => (
                <span
                  key={pair}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-gray-200 [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10 [html.light_&]:text-gray-800"
                >
                  <Repeat className="w-3 h-3 text-green-400" />
                  {pair}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2 text-sm text-gray-300 [html.light_&]:text-gray-700">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            No hidden spreads rate shown before you confirm
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 [html.light_&]:text-gray-700">
            <Zap className="w-4 h-4 text-green-400" />
            Most swaps settle in under 10 seconds
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to make your <span className="text-green-400">first buy?</span>
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
