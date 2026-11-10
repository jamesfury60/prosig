// app/how-it-works/page.jsx
"use client";

import { useState } from "react";
import { ArrowRight, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    img: "/img/11.jpg",
    title: "Create Your Account",
    body: "Sign up with your email in under a minute. No paperwork up front just the basics to get your account started.",
    reverse: false,
  },
  {
    number: "02",
    img: "/img/12.jpg",
    title: "Verify Your Identity",
    body: "Upload a government ID and complete a quick selfie check. Most verifications clear in minutes, not days.",
    reverse: true,
  },
  {
    number: "03",
    img: "/img/13.jpg",
    title: "Fund Your Wallet",
    body: "Deposit crypto directly or connect a bank transfer. Funds are typically available to trade within minutes.",
    reverse: false,
  },
  {
    number: "04",
    img: "/img/14.jpg",
    title: "Start Trading",
    body: "Choose a market, set your order, and execute with live pricing and smart routing working in the background.",
    reverse: true,
  },
];

const FAQS = [
  {
    q: "How long does verification take?",
    a: "Most identity checks complete within a few minutes. In rare cases, manual review can take up to 24 hours.",
  },
  {
    q: "Is there a minimum deposit?",
    a: "You can start with any amount on most markets, with fractional share investing available on stocks.",
  },
  {
    q: "Can I withdraw at any time?",
    a: "Yes withdrawals can be requested at any time and are typically processed within 24 hours.",
  },
  {
    q: "Do I need trading experience?",
    a: "No. Prosignalbase includes a demo mode with virtual funds so you can practice before trading with real money.",
  },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-[#080B11] text-white font-sans overflow-x-hidden [html.light_&]:bg-white [html.light_&]:text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[140px] rounded-full pointer-events-none [html.light_&]:bg-green-400/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-6 [html.light_&]:bg-green-500/5 [html.light_&]:border-green-400/30 [html.light_&]:text-green-600">
            How It Works
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            From Sign-Up to <br className="hidden md:block" /> Your First Trade
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 [html.light_&]:text-gray-600">
            Four steps, most people finish in under ten minutes. Here&rsquo;s
            exactly what to expect with Prosignalbase.
          </p>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-green-600/25 transition-all inline-flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-24">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col md:items-center gap-8 md:gap-14 ${
                step.reverse ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              <div className="flex-1 w-full">
                <img
                  src={step.img}
                  alt={step.title}
                  className="border border-white/10 rounded-2xl"
                />
              </div>
              <div className="flex-1">
                <span className="text-5xl font-bold text-green-500/20 [html.light_&]:text-green-400/30">
                  {step.number}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed [html.light_&]:text-gray-600">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="py-16 md:py-24 px-6 border-t border-white/5 bg-white/[0.015] [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.015]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider [html.light_&]:text-green-600">
              Common Questions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Before You Start
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden [html.light_&]:bg-black/[0.02] [html.light_&]:border-black/10 [html.light_&]:hover:border-black/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex justify-between items-center gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white [html.light_&]:text-gray-700 [html.light_&]:group-hover:text-gray-900">
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

      {/* CTA */}
      <section className="py-20 px-6 relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-600/5 blur-3xl pointer-events-none [html.light_&]:bg-green-400/10" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready when <span className="text-green-400">you are</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 [html.light_&]:text-gray-600">
            Your account is four steps away. Most people are placing their first
            trade within ten minutes of signing up.
          </p>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-600/20 transition-all inline-flex items-center gap-2"
          >
            Create Your Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
