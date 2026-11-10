// components/EquityMarketsSection.jsx
"use client";

import { useSimulatedTicker } from "./useSimulatedTicker";

const EXCHANGES = [
  { code: "NY", name: "NYSE" },
  { code: "NQ", name: "NASDAQ" },
  { code: "LN", name: "LSE" },
];

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 182.63 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 245.6 },
  { symbol: "MSFT", name: "Microsoft", base: 378.45 },
  { symbol: "AMZN", name: "Amazon", base: 152.3 },
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

export default function EquityMarketsSection() {
  return (
    <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
            Equity Markets
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
            Global Stock Markets
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl [html.light_&]:text-gray-600">
            Trade thousands of stocks from major exchanges worldwide with
            competitive commissions and real-time data.
          </p>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 [html.light_&]:text-gray-500">
            Major Exchanges
          </p>
          <div className="flex flex-wrap gap-3">
            {EXCHANGES.map((ex) => (
              <div
                key={ex.code}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
              >
                <span className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400 [html.light_&]:bg-green-500/5">
                  {ex.code}
                </span>
                <span className="text-sm font-medium text-white [html.light_&]:text-gray-900">
                  {ex.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 [html.light_&]:text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STOCKS.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-3 [html.light_&]:text-gray-400">
          Connect an equities data provider for live quotes.
        </p>
      </div>
    </section>
  );
}
