// app/about/page.jsx
import { ArrowRight, Target, Users, Globe2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

const STATS = [
  { value: "2.4M+", label: "Active Traders" },
  { value: "140+", label: "Countries" },
  { value: "$8.1B", label: "Monthly Volume" },
  { value: "2019", label: "Founded" },
];

const VALUES = [
  {
    icon: Target,
    title: "Clarity First",
    body: "Every fee, every risk, every rate shown plainly before you commit to anything.",
  },
  {
    icon: Users,
    title: "Built With Traders",
    body: "Product decisions come from support tickets and trader feedback, not guesswork.",
  },
  {
    icon: Globe2,
    title: "Genuinely Global",
    body: "Local payment rails and language support across 140+ countries, not just a translated homepage.",
  },
  {
    icon: Sparkles,
    title: "Constantly Shipping",
    body: "New markets, tools, and integrations ship every month based on what traders actually ask for.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            About Us
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Trading Tools Shouldn&rsquo;t <br className="hidden md:block" /> Be
            This Hard To Trust
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto [html.light_&]:text-gray-600">
            We started Capitaledgehub because switching between five apps to
            manage one portfolio was never the point of trading. One account,
            every market, no compromises on security.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-4xl font-bold">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1 [html.light_&]:text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission row */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 [html.light_&]:border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
          <div className="flex-1 w-full">
            <img src="/img/20.jpg" alt="Our mission" className="rounded-2xl" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Our Mission
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
              One Platform For Every Market You Trade
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed [html.light_&]:text-gray-600">
              We believe access to global markets shouldn&rsquo;t require a
              finance degree or five separate logins. Capitaledgehub brings
              crypto, stocks, forex, and commodities into a single account, with
              the same security standards a bank would use, and none of the
              unnecessary complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-16 md:py-20 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              What We Actually Care About
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 [html.light_&]:bg-green-500/5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-white [html.light_&]:text-gray-900">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                    {value.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Join <span className="text-green-400">2.4 million</span> traders
          </h2>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2 mt-4"
          >
            Create an Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
