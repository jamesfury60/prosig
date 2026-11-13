// components/Footer.jsx
import { MessageCircle, Send, Globe2 } from "lucide-react";
import Link from "next/link";

const SOCIALS = [
  { icon: MessageCircle, label: "Twitter / X" },
  { icon: Send, label: "Telegram" },
  { icon: Send, label: "GitHub" },
  { icon: Globe2, label: "Community" },
];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 bg-[#05070B] pt-16 pb-12 px-6 [html.light_&]:border-black/10 [html.light_&]:bg-white">
      {/* Gradient Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent [html.light_&]:from-green-500/5" />
        <div
          className="absolute inset-0 opacity-30 [html.light_&]:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent [html.light_&]:via-green-500/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-16">
          {/* Logo & Social Section */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center font-bold text-white text-sm">
                  CP
                </div>
                <span className="text-white font-semibold text-lg [html.light_&]:text-gray-900">
                  Capitaledgehub
                </span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs [html.light_&]:text-gray-600">
                A single platform for real-time crypto markets, secure custody,
                and instant execution.
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-400 mt-6 [html.light_&]:text-gray-600">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors [html.light_&]:bg-black/5 [html.light_&]:hover:bg-black/10 [html.light_&]:hover:text-gray-900"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 [html.light_&]:text-gray-500">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-gray-300 [html.light_&]:text-gray-600">
              <li>
                <Link
                  href="/features"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  App
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 [html.light_&]:text-gray-500">
              About
            </h4>
            <ul className="space-y-3 text-sm text-gray-300 [html.light_&]:text-gray-600">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 [html.light_&]:text-gray-500">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-gray-300 [html.light_&]:text-gray-600">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge-base"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge-base"
                  className="hover:text-white transition-colors [html.light_&]:hover:text-gray-900"
                >
                  API Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 [html.light_&]:border-black/10 [html.light_&]:text-gray-500">
          <span>
            © {new Date().getFullYear()} Capitaledgehub. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-gray-300 transition-colors [html.light_&]:hover:text-gray-900"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-gray-300 transition-colors [html.light_&]:hover:text-gray-900"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* Large Typography Brand Name */}
        <div className="max-w-7xl mx-auto pt-10 flex justify-center relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent [html.light_&]:via-black/5" />
          <h1 className="text-[16vw] sm:text-[12vw] font-bold text-white/10 leading-none tracking-tight select-none [html.light_&]:text-black/10">
            Capitaledgehub
          </h1>
        </div>
      </div>
    </footer>
  );
}
