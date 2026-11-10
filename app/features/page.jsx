// app/features/page.jsx
"use client";

import Image from "next/image";
import {
  ArrowRight,
  Check,
  Monitor,
  Smartphone,
  Cpu,
  LineChart,
  PenTool,
  Clock,
  Zap,
  ShieldAlert,
  Layers3,
  PieChart,
  Vault,
  KeyRound,
  Eye,
  Code2,
  Radio,
  Network,
  GraduationCap,
  Headset,
  Newspaper,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const PLATFORMS = [
  {
    icon: Monitor,
    title: "Browser Trading Suite",
    body: "Run your entire trading operation from any modern browser, no installs required.",
    points: [
      "Fully configurable dashboards",
      "Instant execution, one click",
      "Saved workspace layouts",
    ],
    badge: "Most Popular",
  },
  {
    icon: Smartphone,
    title: "Companion Mobile App",
    body: "Stay connected to the markets with a native app built for iOS and Android.",
    points: [
      "Gesture-based order entry",
      "Custom alert notifications",
      "Face and fingerprint login",
    ],
  },
  {
    icon: Cpu,
    title: "Desktop Terminal",
    body: "A dedicated desktop client tuned for speed, built for professional desks.",
    points: [
      "Minimal-latency routing",
      "Algorithmic order presets",
      "Multi-screen workspace sync",
    ],
  },
];

const CHART_TOOLS = [
  {
    icon: LineChart,
    title: "120+ Built-In Indicators",
    body: "Everything from RSI and MACD to proprietary momentum tools, ready to drop onto any chart.",
  },
  {
    icon: PenTool,
    title: "Precision Drawing Suite",
    body: "Fibonacci tools, trend channels, and pattern recognition that updates as price moves.",
  },
  {
    icon: Clock,
    title: "Synced Multi-Timeframe View",
    body: "Jump from tick-level detail to monthly context without losing your place on the chart.",
  },
];

const TRADING_TOOLS = [
  {
    icon: Zap,
    title: "Near-Instant Fills",
    body: "Orders route and settle in milliseconds, backed by a 99.99% uptime commitment.",
  },
  {
    icon: ShieldAlert,
    title: "Built-In Risk Controls",
    body: "Stop-loss, take-profit, and trailing exits configured once, enforced automatically.",
  },
  {
    icon: Layers3,
    title: "Full Order Book Depth",
    body: "Live Level 2 data shows exactly where liquidity sits before you commit to a trade.",
  },
  {
    icon: PieChart,
    title: "Portfolio Intelligence",
    body: "Performance breakdowns and exposure metrics across every asset you hold.",
  },
];

const SECURITY = [
  {
    icon: Vault,
    title: "Segregated Cold Storage",
    body: "The vast majority of client assets sit offline across geographically separate, access-controlled vaults.",
  },
  {
    icon: KeyRound,
    title: "Multi-Party Sign-Off",
    body: "Every high-value transaction needs independent approval from multiple authorized parties before it moves.",
  },
  {
    icon: Eye,
    title: "Always-On Monitoring",
    body: "A dedicated security team watches for anomalies around the clock, with automated response on trigger.",
  },
];

const API_TOOLS = [
  {
    icon: Code2,
    title: "REST Endpoints",
    body: "Manage accounts, place orders, and pull market data with a fully documented API and official SDKs.",
  },
  {
    icon: Radio,
    title: "Streaming WebSockets",
    body: "Subscribe to live order books and trade prints with the low latency automated strategies need.",
  },
  {
    icon: Network,
    title: "FIX Connectivity",
    body: "Institutional-grade FIX access for desks running existing algorithmic infrastructure.",
  },
];

const SUPPORT = [
  {
    icon: GraduationCap,
    title: "Trading Academy",
    body: "Structured lessons on charting, risk, and psychology built for complete beginners through to advanced traders.",
    cta: "Browse Courses",
  },
  {
    icon: Headset,
    title: "Round-the-Clock Support",
    body: "Live chat, email, and phone support with a typical first response under two minutes, day or night.",
    cta: "Contact Support",
  },
  {
    icon: Newspaper,
    title: "Daily Market Briefings",
    body: "Short, practical analysis and an economic calendar so you know what's moving before the open.",
    cta: "Read Today's Brief",
  },
];

function FeatureRow({
  eyebrow,
  title,
  body,
  img,
  imageLabel,
  reverse,
  children,
}) {
  return (
    <div
      className={`flex flex-col md:items-center gap-8 md:gap-14 mb-10 ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {/* Image */}
      <div className="flex-1 w-full">
        {img ? (
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.02]">
            <Image
              src={img}
              alt={imageLabel || title}
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority={false}
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-gray-500 text-sm [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.02]">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
          {eyebrow}
        </span>

        <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">{title}</h2>

        <p className="text-gray-400 text-sm md:text-base leading-relaxed [html.light_&]:text-gray-600">
          {body}
        </p>

        {children}
      </div>
    </div>
  );
}

function IconCardGrid({ items, columns = 3 }) {
  const colClass = columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-4`}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3 [html.light_&]:bg-green-500/5">
              <Icon className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-semibold mb-1.5 text-white [html.light_&]:text-gray-900">
              {item.title}
            </h3>

            <p className="text-gray-400 text-xs leading-relaxed [html.light_&]:text-gray-600">
              {item.body}
            </p>

            {item.cta && (
              <Link
                href="#"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-green-400 hover:text-green-300 [html.light_&]:text-green-600 [html.light_&]:hover:text-green-700"
              >
                {item.cta}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            Platform Capabilities
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Everything You Need <br className="hidden md:block" />
            To Trade With An Edge
          </h1>

          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Institutional-caliber execution, charting, and security packaged
            into a platform that works whether you&rsquo;re placing your first
            trade or running a desk.
          </p>

          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all inline-flex items-center gap-2"
          >
            Start Trading Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Multi-platform */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="Multi-Platform"
            title="One Account, Every Screen"
            body="Start an order on your phone, review it on the web, and let your desktop terminal fill it. Your account, watchlists, and settings stay in sync everywhere you log in."
            img="/img/14.jpg"
            imageLabel="Cross-device trading screenshot"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;

              return (
                <div
                  key={platform.title}
                  className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
                >
                  {platform.badge && (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 [html.light_&]:bg-green-500/10 [html.light_&]:text-green-600">
                      {platform.badge}
                    </span>
                  )}

                  <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 [html.light_&]:bg-green-500/5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-semibold mb-2 text-white [html.light_&]:text-gray-900">
                    {platform.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed mb-4 [html.light_&]:text-gray-600">
                    {platform.body}
                  </p>

                  <ul className="space-y-2">
                    {platform.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-xs text-gray-300 [html.light_&]:text-gray-700"
                      >
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Charting tools */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="Charting"
            title="Read The Market Your Way"
            img="/img/15.jpg"
            body="A full technical-analysis toolkit lives inside every chart: indicators, drawing tools, and timeframes that stay in sync as you dig into a setup."
            imageLabel="Charting workspace screenshot"
            reverse
          />

          <IconCardGrid items={CHART_TOOLS} />
        </div>
      </section>

      {/* Advanced trading tools */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="Execution"
            title="Tools Built For Speed"
            img="/img/16.jpg"
            body="From fill speed to position sizing, every layer of the execution stack is tuned for traders who can't afford to wait on the market."
            imageLabel="Order execution screenshot"
          />

          <IconCardGrid items={TRADING_TOOLS} columns={4} />
        </div>
      </section>

      {/* Security */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="Security"
            title="Custody Built To Institutional Standard"
            img="/img/17.jpg"
            body="Your assets and account data sit behind the same layered controls banks and custodians rely on, designed so no single point of failure exists."
            imageLabel="Security infrastructure screenshot"
            reverse
          />

          <IconCardGrid items={SECURITY} />
        </div>
      </section>

      {/* Developer API */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="For Developers"
            title="Build On Top Of The Platform"
            img="/img/18.jpg"
            body="Automate a strategy, pipe live data into your own tools, or connect existing infrastructure. REST, WebSocket, and FIX access are all documented and ready."
            imageLabel="API documentation screenshot"
          />

          <IconCardGrid items={API_TOOLS} />
        </div>
      </section>

      {/* Education & support */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-6xl mx-auto">
          <FeatureRow
            eyebrow="Learn & Get Help"
            title="You're Never Trading Alone"
            img="/img/19.jpg"
            body="Structured courses, fast human support, and daily market context so you're building real skill, not just placing trades."
            imageLabel="Support center screenshot"
            reverse
          />

          <IconCardGrid items={SUPPORT} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See it running <span className="text-green-400">free demo</span>
          </h2>

          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 [html.light_&]:text-gray-600">
            Open an account and explore every tool on this page with a live demo
            balance before you trade with real funds.
          </p>

          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2"
          >
            Try the Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
