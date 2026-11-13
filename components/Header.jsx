// components/Header.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Globe,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Smartphone,
  Wallet,
  Sun,
  Moon,
  LayoutGrid,
  Coins,
  LineChart,
  Gem,
  Repeat,
  TrendingUp,
  Route,
  Sparkles,
  BookOpen,
  HelpCircle,
  Users,
} from "lucide-react";

const NAV_GROUPS = [
  {
    id: "markets",
    label: "Markets",
    items: [
      {
        href: "/markets",
        label: "All Markets",
        desc: "Every asset class, one view",
        icon: LayoutGrid,
      },
      {
        href: "/crypto",
        label: "Cryptocurrency",
        desc: "300+ coins and tokens",
        icon: Coins,
      },
      {
        href: "/stocks",
        label: "Stocks",
        desc: "Global equities, fractional shares",
        icon: LineChart,
      },
      {
        href: "/commodities",
        label: "Commodities",
        desc: "Gold, silver, oil & gas",
        icon: Gem,
      },
    ],
  },
  {
    id: "trade",
    label: "Trade",
    items: [
      {
        href: "/buy-swap",
        label: "Buy & Swap",
        desc: "Instant purchase and conversion",
        icon: Repeat,
      },
      {
        href: "/stake",
        label: "Stake & Earn",
        desc: "Passive rewards on your holdings",
        icon: TrendingUp,
      },
      {
        href: "/how-it-works",
        label: "How It Works",
        desc: "From sign-up to first trade",
        icon: Route,
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      {
        href: "/features",
        label: "Features",
        desc: "Platform tools & capabilities",
        icon: Sparkles,
      },
      {
        href: "/knowledge-base",
        label: "Knowledge Base",
        desc: "Guides, articles & FAQs",
        icon: BookOpen,
      },
      {
        href: "/faq",
        label: "FAQ",
        desc: "Quick answers to common questions",
        icon: HelpCircle,
      },
      {
        href: "/about",
        label: "About Us",
        desc: "Our mission and story",
        icon: Users,
      },
    ],
  },
];

const PRODUCTS = [
  {
    name: "Capitaledgehub App",
    tagline: "For everyday users",
    icon: Smartphone,
    tileClass: "bg-gradient-to-tr from-green-600 to-green-400 text-white",
  },
  {
    name: "Capitaledgehub Wallet",
    tagline: "For Web3 enthusiasts",
    icon: Wallet,
    tileClass: "bg-white text-[#0b0d16]",
  },
];

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  return prefersLight ? "light" : "dark";
}

function ThemeToggle({ theme, onToggle, size = "md" }) {
  const isLight = theme === "light";
  const trackSize = size === "sm" ? "h-6 w-11" : "h-7 w-12";
  const thumbSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle theme"
      aria-pressed={isLight}
      className={`flex flex-shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 ${trackSize} border-white/10 bg-white/10 [html.light_&]:border-black/10 [html.light_&]:bg-black/10`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-sm transition-transform duration-300 ease-in-out ${thumbSize} ${
          isLight ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {isLight ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
      </span>
    </button>
  );
}

/* ---------------- Desktop dropdown nav item ---------------- */
function NavDropdown({ group, isOpen, onToggle, onClose }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center gap-1 text-sm text-gray-300 transition-colors hover:text-white [html.light_&]:text-gray-600 [html.light_&]:hover:text-gray-900"
      >
        {group.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-full z-20 w-72 -translate-x-1/2 pt-3 transition-all duration-200 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div
          className="overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl
            border-white/10 bg-[#0B0E17]/95 shadow-black/40
            [html.light_&]:border-black/10 [html.light_&]:bg-white/95 [html.light_&]:shadow-black/10"
        >
          <div className="p-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5 [html.light_&]:hover:bg-black/5"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400 [html.light_&]:bg-green-500/5 [html.light_&]:text-green-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white [html.light_&]:text-gray-900">
                      {item.label}
                    </span>
                    <span className="block text-xs text-gray-500 [html.light_&]:text-gray-500">
                      {item.desc}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mobile accordion nav group ---------------- */
function MobileNavGroup({ group, isExpanded, onToggle, onNavigate }) {
  return (
    <div className="border-b border-white/5 [html.light_&]:border-black/5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[1.5rem] font-semibold tracking-tight text-white [html.light_&]:text-gray-900">
          {group.label}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 [html.light_&]:text-gray-400 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-1 pb-4">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/5 [html.light_&]:hover:bg-black/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400 [html.light_&]:bg-green-500/5 [html.light_&]:text-green-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-gray-200 [html.light_&]:text-gray-800">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // desktop dropdown
  const [expandedGroups, setExpandedGroups] = useState({}); // mobile accordion
  const [theme, setTheme] = useState(null);
  const navRef = useRef(null);
  const pathname = usePathname();

  // Theme init — never write to localStorage with a placeholder value,
  // only once a real value has been read (see prior fix notes).
  useEffect(() => {
    const initial = resolveTheme();
    document.documentElement.classList.toggle("light", initial === "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (theme === null) return;
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("vaultline-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => ((prev ?? "dark") === "dark" ? "light" : "dark"));
  }

  const displayTheme = theme ?? "dark";

  // Close desktop dropdown on outside click / Escape / route change.
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target))
        setOpenGroup(null);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpenGroup(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setMenuOpen(false);
  }, [pathname]);

  // Lock page scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function toggleMobileGroup(id) {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="relative mx-auto max-w-6xl rounded-full">
          {/* Clipped background layer — border, blur, top gradient line all
              live here so the rounded-full shape clips correctly without
              also clipping the dropdown panels below. */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full border shadow-xl backdrop-blur-xl
              border-white/10 bg-black/70 shadow-black/50
              [html.light_&]:border-black/10 [html.light_&]:bg-white/85 [html.light_&]:shadow-black/10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent [html.light_&]:via-black/10" />
          </div>

          {/* Content layer — NOT clipped, so dropdowns can render outside
              the pill's bounds. */}
          <div className="relative flex items-center justify-between gap-4 px-5 py-3 sm:px-7">
            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-sm font-bold text-white">
                CP
              </div>
              <span className="text-lg font-semibold tracking-tight text-white [html.light_&]:text-gray-900">
                Capitaledgehub
              </span>
            </Link>

            <nav ref={navRef} className="hidden items-center gap-8 md:flex">
              <Link
                href="/"
                className="text-sm text-gray-300 transition-colors hover:text-white [html.light_&]:text-gray-600 [html.light_&]:hover:text-gray-900"
              >
                Home
              </Link>
              {NAV_GROUPS.map((group) => (
                <NavDropdown
                  key={group.id}
                  group={group}
                  isOpen={openGroup === group.id}
                  onToggle={() =>
                    setOpenGroup((prev) =>
                      prev === group.id ? null : group.id,
                    )
                  }
                  onClose={() => setOpenGroup(null)}
                />
              ))}
            </nav>

            <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
              <ThemeToggle
                theme={displayTheme}
                onToggle={toggleTheme}
                size="sm"
              />

              <button
                type="button"
                aria-label="Change language"
                className="flex h-9 w-9 items-center justify-center rounded-full border text-gray-300 transition-colors
                  border-white/10 hover:border-white/25 hover:text-white
                  [html.light_&]:text-gray-600 [html.light_&]:border-black/10 [html.light_&]:hover:border-black/25 [html.light_&]:hover:text-gray-900"
              >
                <Globe className="h-4 w-4" />
              </button>
              <Link
                href="/auth/register"
                className="flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors
                  border-white/20 text-white hover:border-white/40 hover:bg-white/5
                  [html.light_&]:border-black/15 [html.light_&]:text-gray-900 [html.light_&]:hover:border-black/30 [html.light_&]:hover:bg-black/5"
              >
                Join Capitaledgehub
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-white md:hidden
                border-white/10 bg-white/5
                [html.light_&]:border-black/10 [html.light_&]:bg-black/5 [html.light_&]:text-gray-900"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span
                  className={`absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 ease-in-out ${
                    menuOpen
                      ? "translate-y-0 rotate-45"
                      : "-translate-y-[5px] rotate-0"
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-200 ease-in-out ${
                    menuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 ease-in-out ${
                    menuOpen
                      ? "translate-y-0 -rotate-45"
                      : "translate-y-[5px] rotate-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ Full-screen mobile menu ============ */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col bg-[#020203] transition-all duration-300 ease-out md:hidden
          [html.light_&]:bg-white ${
            menuOpen
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-[1.02] opacity-0"
          }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-end gap-2 px-5 pb-2 pt-6">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border text-white
              border-white/10 [html.light_&]:border-black/10 [html.light_&]:text-gray-900"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border text-white
              border-white/10 [html.light_&]:border-black/10 [html.light_&]:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {/* Home as a plain link, then each group as an accordion */}
          <div className="border-b border-white/5 py-5 [html.light_&]:border-black/5">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between text-[1.5rem] font-semibold tracking-tight text-white [html.light_&]:text-gray-900"
            >
              Home
              <ChevronRight className="h-5 w-5 text-gray-500 [html.light_&]:text-gray-400" />
            </Link>
          </div>

          {NAV_GROUPS.map((group) => (
            <MobileNavGroup
              key={group.id}
              group={group}
              isExpanded={!!expandedGroups[group.id]}
              onToggle={() => toggleMobileGroup(group.id)}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}

          {/* Auth actions */}
          <div className="mt-7 flex items-center gap-3">
            <Link
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[#151b2e] px-7 py-3 text-sm font-semibold text-green-300
                [html.light_&]:bg-green-50 [html.light_&]:text-green-600"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[#22c55e] px-7 py-3 text-sm font-semibold text-white"
            >
              Sign Up
            </Link>
          </div>

          {/* Products */}
          <div className="mt-11">
            <p className="mb-4 text-xs font-medium text-gray-500 [html.light_&]:text-gray-400">
              Products
            </p>
            <div className="flex flex-col gap-5">
              {PRODUCTS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.name} className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${p.tileClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.95rem] font-semibold text-white [html.light_&]:text-gray-900">
                        {p.name}
                      </p>
                      <p className="truncate text-sm text-gray-500 [html.light_&]:text-gray-500">
                        {p.tagline}
                      </p>
                    </div>
                    <button className="flex-shrink-0 rounded-full bg-[#151b2e] px-5 py-2 text-sm font-semibold text-green-300 [html.light_&]:bg-green-50 [html.light_&]:text-green-600">
                      Get
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="my-8 h-px bg-white/10 [html.light_&]:bg-black/10" />

          {/* Appearance */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {displayTheme === "light" ? (
                <Sun className="h-5 w-5 flex-shrink-0 text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              )}
              <div>
                <p className="text-[0.95rem] font-medium text-white [html.light_&]:text-gray-900">
                  Appearance
                </p>
                <p className="text-sm text-gray-500">
                  {displayTheme === "light" ? "Light mode" : "Dark mode"}
                </p>
              </div>
            </div>
            <ThemeToggle theme={displayTheme} onToggle={toggleTheme} />
          </div>

          <div className="my-6 h-px bg-white/10 [html.light_&]:bg-black/10" />

          {/* Locale rows */}
          <div className="flex flex-col gap-6 pb-10">
            <button className="flex items-center gap-3.5 text-left">
              <Globe className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.95rem] font-medium text-white [html.light_&]:text-gray-900">
                  English
                </p>
                <p className="text-sm text-gray-500">Global</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 [html.light_&]:text-gray-400" />
            </button>

            <button className="flex items-center gap-3.5 text-left">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base leading-none">
                🇺🇸
              </span>
              <p className="flex-1 text-[0.95rem] font-medium text-white [html.light_&]:text-gray-900">
                USD
              </p>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 [html.light_&]:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
