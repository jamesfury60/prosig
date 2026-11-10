// app/faq/page.jsx
"use client";

import { useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { IoAddOutline, IoRemoveOutline, IoArrowForward } from "react-icons/io5";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const FAQ_GROUPS = [
  {
    title: "Getting Started",
    items: [
      {
        q: "What is Prosignalbase?",
        a: "Prosignalbase is a crypto trading platform where you can buy, sell, swap, and stake digital assets, with tools for both first-time traders and professionals.",
      },
      {
        q: "How do I create an account?",
        a: "Click Sign Up in the top right, enter your email and a password, then verify your identity. Most accounts are approved within a few minutes.",
      },
      {
        q: "Is there a mobile app?",
        a: "Yes — Prosignalbase is available for iOS and Android with the same trading features as the web platform.",
      },
    ],
  },
  {
    title: "Trading & Fees",
    items: [
      {
        q: "What are Prosignalbase's trading fees?",
        a: "Fees are based on your 30-day trading volume and the market type (spot, margin, or futures), and are always shown before you confirm a trade — never hidden after the fact.",
      },
      {
        q: "What order types are supported?",
        a: "Prosignalbase supports market, limit, and stop orders across spot markets, with more advanced order types available for margin and futures trading.",
      },
      {
        q: "Is there a minimum trade size?",
        a: "Minimums vary by asset and are shown on the trade screen for each market, but most pairs support trades as small as a few dollars.",
      },
    ],
  },
  {
    title: "Security & Account",
    items: [
      {
        q: "Is Prosignalbase secure?",
        a: "Yes — accounts are protected with two-factor authentication, encryption in transit and at rest, and continuous monitoring for suspicious activity.",
      },
      {
        q: "Where are my funds held?",
        a: "The majority of user funds are held in cold storage, with only a small operational balance kept in hot wallets to process withdrawals quickly.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Go to Settings → Security and follow the prompts to link an authenticator app. We recommend enabling this before your first deposit.",
      },
    ],
  },
  {
    title: "Deposits & Withdrawals",
    items: [
      {
        q: "How long do withdrawals take?",
        a: "Crypto withdrawals are typically processed within minutes, subject to network confirmation times. Bank withdrawals can take 1–3 business days.",
      },
      {
        q: "What coins can I deposit?",
        a: "Prosignalbase supports 2,000+ tokens across major networks. The full list of supported assets is shown when you open the Deposit screen.",
      },
      {
        q: "Are there withdrawal limits?",
        a: "Limits depend on your account verification level. Completing full identity verification unlocks the highest available limits.",
      },
    ],
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState("Getting Started-0");

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return FAQ_GROUPS;

    const q = query.trim().toLowerCase();
    return FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:pt-36 [html.light_&]:bg-white [html.light_&]:text-gray-900">
        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-300 [html.light_&]:border-green-500/20 [html.light_&]:bg-green-50 [html.light_&]:text-green-600">
              FAQ
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-400 [html.light_&]:text-gray-500">
              Answers to the most common questions about trading, security, and
              your Prosignalbase account.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12">
            <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a question..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-green-500/60 [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.03] [html.light_&]:text-gray-900 [html.light_&]:placeholder-gray-400"
            />
          </div>

          {/* Groups */}
          {filteredGroups.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No questions match &quot;{query}&quot;. Try a different search
              term, or{" "}
              <Link href="/contact" className="text-green-400 hover:underline">
                contact our team
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              {filteredGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-green-400">
                    {group.title}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {group.items.map((item, i) => {
                      const key = `${group.title}-${i}`;
                      const isOpen = openKey === key;
                      return (
                        <div
                          key={key}
                          className={cx(
                            "overflow-hidden rounded-2xl border transition-colors",
                            "border-white/10 bg-white/[0.03]",
                            "[html.light_&]:border-black/10 [html.light_&]:bg-black/[0.02]",
                            isOpen &&
                              "border-green-500/30 [html.light_&]:border-green-400/40",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenKey(isOpen ? "" : key)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[0.95rem] font-semibold"
                          >
                            {item.q}
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400 [html.light_&]:bg-green-50 [html.light_&]:text-green-600">
                              {isOpen ? (
                                <IoRemoveOutline className="h-4 w-4" />
                              ) : (
                                <IoAddOutline className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                          {isOpen && (
                            <p className="px-5 pb-5 text-sm leading-relaxed text-gray-400 [html.light_&]:text-gray-500">
                              {item.a}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still need help */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.02]">
            <h3 className="text-lg font-semibold">Still have questions?</h3>
            <p className="mt-2 text-sm text-gray-400 [html.light_&]:text-gray-500">
              Our support team typically replies within 24 hours.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/40 transition-opacity hover:opacity-90"
            >
              Contact Support
              <IoArrowForward className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
