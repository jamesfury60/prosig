// app/contact/page.jsx
"use client";

import { useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
import { FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoCheckmarkCircleOutline, IoReloadOutline } from "react-icons/io5";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CONTACT_CARDS = [
  {
    icon: HiOutlineMail,
    label: "Email us",
    value: "support@capitaledgehub.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: HiOutlinePhone,
    label: "Call us",
    value: "+1 (555) 010-2030",
    sub: "Mon–Fri, 9am–6pm EST",
  },
  {
    icon: HiOutlineLocationMarker,
    label: "Visit us",
    value: "180 Ledger Ave, New York, NY",
    sub: "By appointment only",
  },
];

const SUBJECTS = [
  "General inquiry",
  "Account support",
  "Partnerships",
  "Press",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setStatus("success");
  }

  function sendAnother() {
    setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    setStatus("idle");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:pt-36 [html.light_&]:bg-white [html.light_&]:text-gray-900">
        <div className="mx-auto max-w-6xl">
          {/* Hero */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-300 [html.light_&]:border-green-400/30 [html.light_&]:bg-green-500/5 [html.light_&]:text-green-600">
              Get in Touch
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Let&apos;s start a conversation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-400 [html.light_&]:text-gray-600">
              Questions about your account, a partnership idea, or just want to
              say hello — our team is here for it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left: contact info */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              {CONTACT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.03]"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-green-600 to-green-400 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                          {card.label}
                        </p>
                        <p className="mt-1 truncate text-[0.95rem] font-semibold text-white [html.light_&]:text-gray-900">
                          {card.value}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500 [html.light_&]:text-gray-500">
                          {card.sub}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.03]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                  Follow us
                </p>
                <div className="flex gap-2">
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white [html.light_&]:border-black/10 [html.light_&]:text-gray-600 [html.light_&]:hover:border-black/25 [html.light_&]:hover:text-gray-900"
                  >
                    <FaTwitter className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white [html.light_&]:border-black/10 [html.light_&]:text-gray-600 [html.light_&]:hover:border-black/25 [html.light_&]:hover:text-gray-900"
                  >
                    <FaInstagram className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white [html.light_&]:border-black/10 [html.light_&]:text-gray-600 [html.light_&]:hover:border-black/25 [html.light_&]:hover:text-gray-900"
                  >
                    <FaLinkedinIn className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 [html.light_&]:border-black/10 [html.light_&]:bg-black/[0.03]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent [html.light_&]:via-black/10" />

                {status === "success" ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 [html.light_&]:bg-green-500/10 [html.light_&]:text-green-600">
                      <IoCheckmarkCircleOutline className="h-7 w-7" />
                    </span>
                    <h3 className="text-lg font-semibold text-white [html.light_&]:text-gray-900">
                      Message sent
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-gray-400 [html.light_&]:text-gray-600">
                      Thanks for reaching out — we&apos;ll get back to you
                      within 24 hours.
                    </p>
                    <button
                      onClick={sendAnother}
                      className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 [html.light_&]:border-black/15 [html.light_&]:text-gray-900 [html.light_&]:hover:bg-black/5"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your full name"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 [html.light_&]:border-black/10 [html.light_&]:bg-white/40 [html.light_&]:text-gray-900 [html.light_&]:placeholder-gray-400 [html.light_&]:focus:border-green-500/60"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 [html.light_&]:border-black/10 [html.light_&]:bg-white/40 [html.light_&]:text-gray-900 [html.light_&]:placeholder-gray-400 [html.light_&]:focus:border-green-500/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-green-500/60 [html.light_&]:border-black/10 [html.light_&]:bg-white/40 [html.light_&]:text-gray-900 [html.light_&]:focus:border-green-500/60"
                      >
                        {SUBJECTS.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-[#0b0d16] [html.light_&]:bg-white"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 [html.light_&]:text-gray-500">
                        Message
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Tell us a bit about what you need..."
                        rows={5}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 [html.light_&]:border-black/10 [html.light_&]:bg-white/40 [html.light_&]:text-gray-900 [html.light_&]:placeholder-gray-400 [html.light_&]:focus:border-green-500/60"
                      />
                    </div>

                    {error && (
                      <p className="text-sm font-medium text-red-400 [html.light_&]:text-red-600">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/40 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 [html.light_&]:shadow-green-500/20"
                    >
                      {status === "submitting" ? (
                        <>
                          <IoReloadOutline className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <HiOutlinePaperAirplane className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
