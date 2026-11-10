// components/TradingVisual.jsx
"use client";

import { TrendingUp } from "lucide-react";

export default function TradingVisual() {
  return (
    <div className="relative w-full rounded-3xl border border-white/10 overflow-hidden min-h-[320px] flex flex-col justify-end [html.light_&]:border-black/10">
      <style>{`
        @keyframes tvFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .tv-float {
          animation: tvFloat 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background image — drop your own asset at public/images/trading-visual.jpg.
          The gradient behind it is just a fallback so the card still looks
          intentional before that file exists. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-green-950 to-[#080B11] [html.light_&]:from-green-100 [html.light_&]:to-white"
        style={{ backgroundImage: "url('/images/trading-visual.jpg')" }}
      />
      {/* Legibility overlay so text/badges read on top of any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent [html.light_&]:from-black/60 [html.light_&]:via-black/10" />

      {/* Header row */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-white/90">
            Live Chart · BTC/USDT
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          +2.84%
        </span>
      </div>

      {/* Floating price badges */}
      <div className="relative z-10 flex items-center justify-between px-6 pb-6 mt-24">
        <div className="tv-float flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
          <span className="text-[10px] text-white/70">BTC</span>
          <span className="text-sm font-bold text-white">$79,912</span>
        </div>
        <div
          className="tv-float flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm"
          style={{ animationDelay: "0.6s" }}
        >
          <span className="text-sm font-bold text-emerald-300">+$2,140</span>
        </div>
      </div>
    </div>
  );
}
