// components/UnifiedPlatformSection.jsx
import { Zap, LineChart, Layers } from "lucide-react";

const ASSET_TAGS = ["Stocks", "Gold", "Crypto", "Forex"];

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Execution",
    body: "Sub-millisecond order execution with 99.99% uptime across all asset classes.",
  },
  {
    icon: LineChart,
    title: "Advanced Charting",
    body: "Professional charting tools with 100+ indicators and drawing tools for all markets.",
  },
  {
    icon: Layers,
    title: "Portfolio Margin",
    body: "Cross-margin capabilities and portfolio margin for sophisticated trading strategies.",
  },
];

export function UnifiedPlatformSection() {
  return (
    <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
          All Markets, One Platform
        </span>
        <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">
          Unified Trading Experience
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8 [html.light_&]:text-gray-600">
          From stocks and gold to cryptocurrencies and forex, trade all major
          asset classes on a single, unified platform. Professional tools for
          every type of investor.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {ASSET_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm font-medium text-white [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10 [html.light_&]:text-gray-900"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TraderFeaturesSection() {
  return (
    <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            Built for Serious Traders
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto [html.light_&]:text-gray-600">
            Institutional-grade tools and features designed for optimal trading
            performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 [html.light_&]:bg-green-500/5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white [html.light_&]:text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
