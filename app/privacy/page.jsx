// app/privacy/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      `This Privacy Policy explains how Capitaledgehub ("Capitaledgehub", "we", "us", or "our") collects, uses, shares, and protects information when you use our website, mobile applications, and trading services (collectively, the "Services"). By using the Services, you agree to the practices described in this Policy.`,
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    body: [
      `Account information: name, email address, phone number, date of birth, and password when you register.`,
      `Identity verification (KYC) information: government-issued ID, proof of address, and a selfie or biometric verification, collected to comply with anti-money-laundering regulations.`,
      `Transaction information: deposits, withdrawals, trades, and wallet addresses associated with your account.`,
      `Usage and device information: IP address, browser type, device identifiers, and pages visited, collected automatically through cookies and similar technologies.`,
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Information",
    body: [
      `We use the information we collect to: provide and maintain the Services; verify your identity and comply with legal and regulatory obligations; process transactions; detect and prevent fraud, money laundering, and other prohibited activity; communicate with you about your account and the Services; and improve and personalize the platform.`,
    ],
  },
  {
    id: "how-we-share",
    title: "4. How We Share Information",
    body: [
      `We do not sell your personal information. We may share information with: service providers who help us operate the platform (e.g. identity verification, hosting, customer support), subject to confidentiality obligations; regulators and law enforcement where required by applicable law; and other parties in connection with a merger, acquisition, or sale of assets, subject to this Policy continuing to apply to your information.`,
    ],
  },
  {
    id: "security",
    title: "5. Data Security",
    body: [
      `We use encryption in transit and at rest, access controls, and continuous monitoring to protect your information. No system is completely secure, and we encourage you to use a strong, unique password and enable two-factor authentication on your account.`,
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    body: [
      `We retain personal information for as long as your account is active and for a period afterward as required to comply with legal, tax, and regulatory obligations (which, for identity-verification records, is often several years after account closure).`,
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    body: [
      `Depending on your location, you may have the right to access, correct, delete, or export your personal information, or to object to or restrict certain processing. Where required by law (such as under the GDPR or CCPA), we will honor these requests subject to our legal and regulatory recordkeeping obligations.`,
      `To exercise these rights, contact us using the details in Section 12.`,
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies & Tracking",
    body: [
      `We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Services are used. You can control cookies through your browser settings, though disabling them may affect certain features of the platform.`,
    ],
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    body: [
      `The Services are not directed to individuals under 18, and we do not knowingly collect personal information from minors. If we learn that we have collected information from a minor, we will take steps to delete it.`,
    ],
  },
  {
    id: "transfers",
    title: "10. International Data Transfers",
    body: [
      `Your information may be processed in countries other than your own. Where required, we use appropriate safeguards, such as standard contractual clauses, to protect information transferred internationally.`,
    ],
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    body: [
      `We may update this Privacy Policy from time to time. Material changes will be notified through the platform or by email prior to taking effect. The "Last updated" date above reflects the most recent revision.`,
    ],
  },
  {
    id: "contact",
    title: "12. Contact Us",
    body: [
      `Questions about this Policy or requests regarding your personal information can be directed to privacy@Capitaledgehub.com or through our Contact page.`,
    ],
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PrivacyPage() {
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
              Privacy Policy
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
                Before publishing, have this Policy reviewed by qualified legal
                counsel familiar with the data-protection laws applicable in
                every jurisdiction where Capitaledgehub operates (e.g. GDPR,
                CCPA, and local AML/KYC regulations).
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
