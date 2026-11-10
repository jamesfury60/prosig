"use client";

import { useState } from "react";
import {
  ArrowRight,
  Plus,
  Minus,
  ShieldCheck,
  Lock,
  Server,
  Fingerprint,
  Quote,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LivePrices from "@/components/LivePrices";
import WhyChooseSection from "@/components/WhyChooseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PreciousMetalsSection from "@/components/others/PreciousMetalsSection";
import EquityMarketsSection from "@/components/others/EquityMarketsSection";
import CryptoMarketsSection from "@/components/others/CryptoMarketsSection";
import {
  TraderFeaturesSection,
  UnifiedPlatformSection,
} from "@/components/others/UnifiedPlatformSection";
import MobileAppSection from "@/components/others/MobileAppSection";
import PartnersMarquee from "@/components/others/PartnersMarquee";
import { useRouter } from "next/navigation";

const STATS = [
  { value: "2.4M+", label: "Active Traders" },
  { value: "$8.1B", label: "Monthly Volume" },
  { value: "140+", label: "Countries Supported" },
  { value: "99.98%", label: "Platform Uptime" },
];

const TRUST_BADGES = [
  { icon: Lock, label: "AES-256 Encryption" },
  { icon: ShieldCheck, label: "2FA on Every Account" },
  { icon: Server, label: "Cold Storage Custody" },
  { icon: Fingerprint, label: "Biometric Login" },
];

const TESTIMONIALS = [
  {
    quote:
      "Prosignalbase cut my execution time in half. The routing engine finds the best price without me doing anything.",
    name: "Amara O.",
    role: "Day Trader, 3 years",
  },
  {
    quote:
      "The security setup finally made me comfortable moving my full portfolio over. MPC key shards are no joke.",
    name: "Daniel R.",
    role: "Long-term Holder",
  },
  {
    quote:
      "Real-time analytics and on-chain reports in one dashboard saved me from juggling four different apps.",
    name: "Priya K.",
    role: "Portfolio Manager",
  },
];

const FAQS = [
  {
    q: "What is Coinverge?",
    a: "Prosignalbase is a unified crypto trading platform combining instant swaps, non-custodial portfolio control, and real-time on-chain analytics in one dashboard.",
  },
  {
    q: "Is it Possible to Access Cash with Coinverge?",
    a: "Yes, you can withdraw to a linked bank account or convert to stablecoins and cash out through supported regional payment partners.",
  },
  {
    q: "Is Prosignalbase Secure?",
    a: "All accounts use enterprise-grade MPC key sharding, mandatory 2FA, and cold storage for the majority of custodial funds.",
  },
  {
    q: "How do I Begin Using Coinverge?",
    a: "Create an account, verify your identity, connect or fund your wallet, and you're ready to start trading in minutes.",
  },
  {
    q: "What Coins Can I Swap with Coinverge?",
    a: "Prosignalbase supports 300+ tokens across major chains, with best-price routing handled automatically for every swap.",
  },
  {
    q: "How Does Prosignalbase Determine Fees?",
    a: "Fees are volume-tiered and shown up front before you confirm any trade there are no hidden spreads or surprise charges.",
  },
];

export default function Page() {
  const [openFaq, setOpenFaq] = useState(0);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans selection:bg-green-600 selection:text-white overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <style>{`
        @keyframes cvFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cvFloatCoin {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .cv-fade-up {
          opacity: 0;
          animation: cvFadeUp 0.7s ease-out forwards;
        }
        .cv-float-coin {
          animation: cvFloatCoin 4s ease-in-out infinite;
        }
      `}</style>

      <Header />

      {/* Hero Section */}
      <section
        id="home"
        className="mt-7 relative pt-16 md:pt-20 pb-24 md:pb-32 px-6 overflow-hidden flex flex-col items-center text-center"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/20" />

        {/* Floating Coin Visual Arc */}
        <div className="relative w-full max-w-4xl h-24 md:h-32 mb-8 flex justify-center items-center">
          <div className="absolute inset-0 border-t border-green-500/20 rounded-[100%] max-w-2xl mx-auto top-8 md:top-10 [html.light_&]:border-green-400/30" />
          <div className="flex gap-3 sm:gap-8 md:gap-16 z-10">
            <div
              className="cv-float-coin w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-[9px] md:text-xs font-bold text-green-400 shadow-lg shadow-green-500/10"
              style={{ animationDelay: "0s" }}
            >
              ETH
            </div>
            <div
              className="cv-float-coin w-9 h-9 md:w-12 md:h-12 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-[9px] md:text-xs font-bold text-green-400 shadow-lg shadow-green-500/10 -mt-3 md:-mt-4"
              style={{ animationDelay: "0.4s" }}
            >
              SOL
            </div>
            <div
              className="cv-float-coin w-10 h-10 md:w-14 md:h-14 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[10px] md:text-sm font-bold text-amber-400 shadow-lg shadow-amber-500/10 -mt-6 md:-mt-8"
              style={{ animationDelay: "0.8s" }}
            >
              BTC
            </div>
            <div
              className="cv-float-coin w-9 h-9 md:w-12 md:h-12 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-[9px] md:text-xs font-bold text-green-400 shadow-lg shadow-green-500/10 -mt-3 md:-mt-4"
              style={{ animationDelay: "1.2s" }}
            >
              LTC
            </div>
            <div
              className="cv-float-coin w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[9px] md:text-xs font-bold text-emerald-400 shadow-lg shadow-emerald-500/10"
              style={{ animationDelay: "1.6s" }}
            >
              USDT
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="cv-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Join the Next-Gen Trade
          </div>
          <h1
            className="cv-fade-up text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
            style={{ animationDelay: "0.15s" }}
          >
            Cryptocurrencies Quietly <br className="hidden md:block" /> Reshape
            Everything.
          </h1>
          <p
            className="cv-fade-up text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600"
            style={{ animationDelay: "0.25s" }}
          >
            Experience the future of trading where privacy, execution speed, and
            high yields merge seamlessly into one unified platform.
          </p>
          <button
            className="cv-fade-up bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all flex items-center gap-2 mx-auto"
            style={{ animationDelay: "0.35s" }}
            onClick={() => router.push("/auth/register")}
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 md:mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5">
            <h3 className="text-white font-semibold mb-2 text-base [html.light_&]:text-gray-900">
              Instant Swapping
            </h3>
            <p className="text-gray-400 text-sm [html.light_&]:text-gray-600">
              Exchange top cryptocurrencies instantly with near-zero latency and
              best market routing.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5">
            <h3 className="text-white font-semibold mb-2 text-base [html.light_&]:text-gray-900">
              Financial Governance
            </h3>
            <p className="text-gray-400 text-sm [html.light_&]:text-gray-600">
              Own full decision rights over portfolio allocations with
              non-custodial controls.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5">
            <h3 className="text-white font-semibold mb-2 text-base [html.light_&]:text-gray-900">
              On-Chain Insights
            </h3>
            <p className="text-gray-400 text-sm [html.light_&]:text-gray-600">
              Access deep real-time analytics and whale movement reports
              directly from your dashboard.
            </p>
          </div>
        </div>

        <div className="mt-16 md:mt-20 border-t border-white/5 pt-8 w-full max-w-5xl [html.light_&]:border-black/5">
          <PartnersMarquee />
        </div>
      </section>

      <LivePrices />

      <section className="py-14 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/5 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white [html.light_&]:text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 mt-1 [html.light_&]:text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flex-row showcase #1 — text left, animated chart right */}
      <section className="py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-left">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Trade Every Market
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Trade Instantly, See It Move Live
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 [html.light_&]:text-gray-600">
              Watch price action update in real time as your orders route
              through our engine. No delays, no stale charts just live market
              data reacting the moment you act.
            </p>
            <button
              onClick={() => router.push("/markets")}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-full transition-all [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:border-black/10 [html.light_&]:text-gray-900"
            >
              See Live Markets <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full">
            <img src="/assets/pcc.png" alt="Phone 365" className="w-full" />
          </div>
        </div>
      </section>

      {/* Precious metals — demo ticking prices */}
      <PreciousMetalsSection />

      {/* Equity markets — demo ticking prices */}
      <EquityMarketsSection />

      {/* Popular cryptocurrencies — genuinely real-time via CoinGecko */}
      <div id="live-crypto">
        <CryptoMarketsSection />
      </div>

      {/* All markets, one platform */}
      <UnifiedPlatformSection />

      {/* Built for serious traders */}
      <TraderFeaturesSection />

      {/* Mobile app promo */}
      <MobileAppSection />

      {/* Why Choose Prosignalbase — movers, live BTC chart, feature cards, reports */}
      <WhyChooseSection />

      {/* Flex-row showcase #2 — animated chart left, text right */}
      <section className="py-20 md:py-24 px-6 bg-white/[0.015] border-t border-white/5 [html.light_&]:bg-black/[0.015] [html.light_&]:border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
          <div className="flex-1 text-left">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Portfolio Growth
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Watch Your Portfolio Grow in Real Time
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 [html.light_&]:text-gray-600">
              Every position, every gain, tracked live on one dashboard. Set
              alerts, follow trends, and never lose sight of how your assets are
              performing.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all"
            >
              Start Tracking <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full">
            <img
              src="/assets/showcase-stake-screen.png"
              alt="Prosignalbase staking dashboard"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* How It Works — matches the divider-style screenshot */}
      <HowItWorksSection />

      <section className="py-16 px-6 border-t border-white/5 [html.light_&]:border-black/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-8">
            Security you can verify
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-300 [html.light_&]:text-gray-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 bg-white/[0.015] border-t border-white/5 [html.light_&]:bg-black/[0.015] [html.light_&]:border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Trusted by active traders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5"
              >
                <Quote className="w-5 h-5 text-green-400" />
                <p className="text-gray-300 text-sm leading-relaxed flex-1 [html.light_&]:text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white [html.light_&]:text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 md:mb-16">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/5 [html.light_&]:hover:border-black/10"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex justify-between items-center gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white [html.light_&]:text-gray-800 [html.light_&]:group-hover:text-gray-900">
                      {faq.q}
                    </span>
                    <span className="text-gray-400 group-hover:text-white shrink-0 [html.light_&]:text-gray-500 [html.light_&]:group-hover:text-gray-900">
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed [html.light_&]:text-gray-600">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Discover <span className="text-green-400">2,000+</span> Coin Crypto
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 [html.light_&]:text-gray-600">
            Experience complete cross-chain freedom with instantaneous
            settlements and robust, automated yield engines.
          </p>
          <button
            onClick={() => router.push("/auth/register")}
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all flex items-center gap-2 mx-auto"
          >
            Explore Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
