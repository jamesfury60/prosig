// components/PreciousMetalsSection.jsx
"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useSimulatedTicker } from "./useSimulatedTicker";

const METALS = [
  { symbol: "XAU", name: "Gold", base: 1950.25, color: "#d4af37" },
  { symbol: "XAG", name: "Silver", base: 23.45, color: "#c0c0c0" },
];

function MetalCard({ metal }) {
  const { price, changePct } = useSimulatedTicker(metal.base, {
    volatility: 0.0008,
  });
  const isUp = changePct >= 0;

  return (
    <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10">
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
          style={{ backgroundColor: metal.color }}
        >
          {metal.symbol}
        </span>
        <span className="text-base font-semibold text-white [html.light_&]:text-gray-900">
          {metal.name}
        </span>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-white [html.light_&]:text-gray-900">
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
          {changePct.toFixed(2)}% Today
        </p>
      </div>
    </div>
  );
}

export default function PreciousMetalsSection() {
  return (
    <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
        <div className="flex-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider [html.light_&]:text-amber-600">
            Precious Metals
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
            Trade Gold &amp; Silver
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed [html.light_&]:text-gray-600">
            Diversify your portfolio with physical gold and silver. Hedge
            against inflation and market volatility with the world&rsquo;s most
            trusted precious metals.
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col gap-3">
          {METALS.map((metal) => (
            <MetalCard key={metal.symbol} metal={metal} />
          ))}
          <p className="text-[11px] text-gray-500 text-right [html.light_&]:text-gray-400">
            Connect a metals data provider for live spot rates.
          </p>
        </div>
      </div>
    </section>
  );
}
