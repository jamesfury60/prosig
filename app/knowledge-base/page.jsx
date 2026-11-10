// app/knowledge-base/page.jsx
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Rocket,
  LineChart,
  ShieldCheck,
  Wallet,
  Code2,
  Percent,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const CATEGORIES = [
  {
    icon: Rocket,
    title: "Getting Started",
    count: 12,
    body: "Account setup, verification, and your first deposit.",
  },
  {
    icon: LineChart,
    title: "Trading",
    count: 24,
    body: "Order types, charting tools, and execution basics.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    count: 9,
    body: "2FA, withdrawal whitelists, and keeping your account safe.",
  },
  {
    icon: Wallet,
    title: "Deposits & Withdrawals",
    count: 15,
    body: "Funding methods, processing times, and limits.",
  },
  {
    icon: Code2,
    title: "API & Integrations",
    count: 8,
    body: "REST, WebSocket, and building your own tools.",
  },
  {
    icon: Percent,
    title: "Fees & Limits",
    count: 6,
    body: "How trading, deposit, and withdrawal fees are calculated.",
  },
];

const POPULAR_ARTICLES = [
  "How long does identity verification take?",
  "Why hasn't my deposit shown up yet?",
  "What's the difference between a market and limit order?",
  "How do I enable two-factor authentication?",
  "What are the withdrawal limits on my account tier?",
  "How is staking APY calculated?",
];

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero + search */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            How Can We Help?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, guides, and FAQs..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-green-400/50 transition-colors [html.light_&]:bg-black/[0.03] [html.light_&]:border-black/10 [html.light_&]:text-gray-900 [html.light_&]:placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href="#"
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-green-400/40 transition-colors [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10 [html.light_&]:hover:border-green-400/50"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 [html.light_&]:bg-green-500/5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-white [html.light_&]:text-gray-900">
                      {cat.title}
                    </h3>
                    <span className="text-[11px] text-gray-500 [html.light_&]:text-gray-400">
                      {cat.count} articles
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                    {cat.body}
                  </p>
                </Link>
              );
            })}

            {filteredCategories.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-500 py-8 [html.light_&]:text-gray-500">
                No categories match &quot;{query}&quot;.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Popular articles */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Popular Right Now
          </h2>
          <div className="flex flex-col">
            {POPULAR_ARTICLES.map((article) => (
              <Link
                key={article}
                href="/contact"
                className="flex items-center justify-between gap-4 py-4 border-t border-white/10 text-sm text-gray-200 hover:text-white transition-colors [html.light_&]:border-black/10 [html.light_&]:text-gray-800 [html.light_&]:hover:text-gray-900"
              >
                {article}
                <ArrowRight className="w-4 h-4 text-gray-500 shrink-0 [html.light_&]:text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still stuck?</h2>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 [html.light_&]:text-gray-600">
            Our support team is available around the clock if you can&apos;t
            find what you&apos;re looking for.
          </p>
          <Link
            href="/contact"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2"
          >
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
