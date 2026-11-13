// app/terms/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      `These Terms of Service ("Terms") form a binding agreement between you and Capitaledgehub ("Capitaledgehub", "we", "us", or "our") governing your access to and use of the Capitaledgehub website, mobile applications, and trading services (collectively, the "Services"). By creating an account or otherwise using the Services, you agree to be bound by these Terms.`,
      `If you do not agree to these Terms, you must not access or use the Services. We may update these Terms from time to time as described in Section 13 below.`,
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    body: [
      `You must be at least 18 years old and have the legal capacity to enter into a binding contract to use the Services. By using the Services, you represent that you meet these requirements and that you are not located in, or a resident of, any jurisdiction where use of the Services would be prohibited by applicable law.`,
      `You are responsible for ensuring that your use of the Services complies with the laws of your jurisdiction, including any restrictions on cryptocurrency trading.`,
    ],
  },
  {
    id: "accounts",
    title: "3. Account Registration & Security",
    body: [
      `To use most features of the Services, you must register for an account and complete identity verification ("KYC"). You agree to provide accurate, current, and complete information and to keep it up to date.`,
      `You are solely responsible for maintaining the confidentiality of your login credentials and two-factor authentication methods, and for all activity that occurs under your account. Notify us immediately at the contact details in Section 14 if you suspect unauthorized access to your account.`,
    ],
  },
  {
    id: "services",
    title: "4. Description of Services",
    body: [
      `Capitaledgehub provides an online platform for buying, selling, swapping, and staking digital assets, along with related features such as market data, trading tools, and account management. We do not provide investment, legal, or tax advice, and nothing on the platform should be construed as such.`,
      `We may add, modify, or discontinue any feature of the Services at any time, with or without notice, though we will make reasonable efforts to notify you of material changes affecting your account.`,
    ],
  },
  {
    id: "risks",
    title: "5. Trading Risks",
    body: [
      `Digital assets are volatile and involve significant risk of loss. Prices can fluctuate rapidly and unpredictably, and past performance is not indicative of future results. You acknowledge that you are solely responsible for evaluating the merits and risks of any transaction before using the Services.`,
      `Trades executed on the platform are generally irreversible. We are not liable for losses resulting from market volatility, network congestion, or your own trading decisions.`,
    ],
  },
  {
    id: "fees",
    title: "6. Fees",
    body: [
      `We charge fees for certain transactions, including trading, withdrawals, and currency conversion. Current fee schedules are displayed within the platform before you confirm a transaction and are incorporated into these Terms by reference.`,
      `We may change our fees at any time; changes will apply to transactions initiated after the change takes effect.`,
    ],
  },
  {
    id: "prohibited",
    title: "7. Prohibited Activities & Compliance",
    body: [
      `You agree not to use the Services for any unlawful purpose, including money laundering, terrorist financing, market manipulation, or evasion of sanctions. We reserve the right to request additional verification, restrict, suspend, or terminate accounts, and to report suspicious activity to relevant authorities as required by applicable anti-money-laundering (AML) and know-your-customer (KYC) regulations.`,
      `Prohibited activities also include, without limitation: creating multiple accounts to evade limits, using the Services to trade on behalf of a third party without authorization, and attempting to interfere with or reverse-engineer the platform.`,
    ],
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    body: [
      `All content, trademarks, logos, and software associated with the Services are owned by or licensed to Capitaledgehub. You may not copy, modify, distribute, or create derivative works from any part of the Services without our prior written consent.`,
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    body: [
      `To the maximum extent permitted by law, Capitaledgehub and its officers, employees, and affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or digital assets, arising from your use of the Services.`,
      `Our total liability for any claim arising from these Terms or the Services will not exceed the greater of the fees you paid to us in the twelve months preceding the claim, or $100.`,
    ],
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    body: [
      `You agree to indemnify and hold harmless Capitaledgehub from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your use of the Services, your violation of these Terms, or your violation of any applicable law or third-party right.`,
    ],
  },
  {
    id: "termination",
    title: "11. Termination",
    body: [
      `We may suspend or terminate your account at our discretion, including for suspected violations of these Terms, legal or regulatory requirements, or extended inactivity. You may close your account at any time by contacting support, subject to completion of any pending transactions.`,
    ],
  },
  {
    id: "disputes",
    title: "12. Governing Law & Dispute Resolution",
    body: [
      `These Terms are governed by the laws of the jurisdiction in which Capitaledgehub is incorporated, without regard to conflict-of-law principles. Any dispute arising from these Terms or the Services will first be addressed through good-faith negotiation, and if unresolved, through binding arbitration on an individual basis, except where prohibited by law.`,
    ],
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    body: [
      `We may revise these Terms from time to time. Material changes will be notified through the platform or by email prior to taking effect. Continued use of the Services after changes become effective constitutes acceptance of the revised Terms.`,
    ],
  },
  {
    id: "contact",
    title: "14. Contact Information",
    body: [
      `Questions about these Terms can be directed to legal@Capitaledgehub.com or through our Contact page.`,
    ],
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TermsPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:pt-36 [html.light_&]:bg-white [html.light_&]:text-gray-900">
        <div className="mx-auto max-w-6xl">
          {/* Hero */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-300 [html.light_&]:border-green-500/20 [html.light_&]:bg-green-50 [html.light_&]:text-green-600">
              Legal
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
            {/* ToC */}
            <nav className="hidden lg:block">
              <div className="sticky top-32 flex flex-col gap-1 border-l border-white/10 pl-4 [html.light_&]:border-black/10">
                {SECTIONS.map((s) => (
                  <Link
                    key={s.id}
                    href={`#${s.id}`}
                    className={cx(
                      "py-1.5 text-sm transition-colors",
                      activeId === s.id
                        ? "font-semibold text-green-400"
                        : "text-gray-500 hover:text-gray-300 [html.light_&]:hover:text-gray-700",
                    )}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="min-w-0">
              <div className="mb-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-5 text-sm leading-relaxed text-yellow-200/90 [html.light_&]:border-yellow-500/25 [html.light_&]:bg-yellow-50 [html.light_&]:text-yellow-800">
                This is a general template and does not constitute legal advice.
                Before publishing, have these Terms reviewed by qualified legal
                counsel familiar with the regulatory requirements in every
                jurisdiction where Capitaledgehub operates.
              </div>

              <div className="flex flex-col gap-12">
                {SECTIONS.map((s) => (
                  <section
                    key={s.id}
                    id={s.id}
                    ref={(el) => (sectionRefs.current[s.id] = el)}
                    className="scroll-mt-32"
                  >
                    <h2 className="text-xl font-bold tracking-tight">
                      {s.title}
                    </h2>
                    <div className="mt-3 flex flex-col gap-3">
                      {s.body.map((p, i) => (
                        <p
                          key={i}
                          className="text-[0.95rem] leading-relaxed text-gray-400 [html.light_&]:text-gray-600"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
