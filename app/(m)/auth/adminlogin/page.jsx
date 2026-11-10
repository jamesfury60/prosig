"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  Fingerprint,
} from "lucide-react";

import { api } from "@/lib/axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    toast.dismiss();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      toast.loading("Verifying credentials...", {
        id: "admin-login",
      });

      const { data } = await api.post("/auth/login.php", {
        email,
        password,
      });

      if (!data.success) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (data.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["session"],
      });

      toast.success("Login successful! Redirecting...", {
        id: "admin-login",
      });

      router.replace("/admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        {
          id: "admin-login",
        },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070d] px-6 py-8 text-[#eefaf2]">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Glow */}
        <div className="absolute -left-32 -top-40 h-128 w-lg rounded-full bg-[#58f290]/30 blur-[90px]" />

        <div className="absolute -bottom-40 -right-32 h-112 w-md rounded-full bg-[#22c55e]/25 blur-[90px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(#1a2135 1px, transparent 1px),
              linear-gradient(90deg, #1a2135 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 90%)",
          }}
        />
      </div>

      {/* Login container */}
      <div className="relative z-10 w-full max-w-105">
        <div className="rounded-2xl border border-[#232c42] bg-linear-to-b from-[#0e1320] to-[#131a2b] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:p-9">
          {/* Brand */}
          <div className="mb-5 text-center">
            <div className="mb-4 inline-flex h-15 w-15 items-center justify-center rounded-2xl bg-linear-to-br from-[#58f290] to-[#22c55e] text-white shadow-[0_8px_24px_rgba(34, 197, 94,0.35)]">
              <ShieldCheck size={30} strokeWidth={1.8} />
            </div>

            <h1 className="text-[1.6rem] font-bold tracking-tight">
              Admin Hub
            </h1>

            <p className="mt-1 text-[0.85rem] text-[#7c88a6]">
              Restricted access · Authorized personnel only
            </p>
          </div>

          {/* Security badge */}
          <div className="mx-auto mb-7 flex w-fit items-center gap-1.5 rounded-full border border-[#58f290]/25 bg-[#58f290]/10 px-3.5 py-1.5 text-[0.72rem] font-medium tracking-wide text-[#86efac]">
            <Fingerprint size={14} />

            <span>Secured connection · 256-bit encrypted</span>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-[1.15rem]">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-[#dcfce7]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c88a6]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                  className="w-full rounded-[0.625rem] border-[1.5px] border-[#232c42] bg-[#0a0e18] px-3.5 py-3 pl-11 text-[0.92rem] text-[#eefaf2] outline-none transition placeholder:text-[#7c88a6]/70 focus:border-[#58f290] focus:ring-[3px] focus:ring-[#58f290]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-[#dcfce7]"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c88a6]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  className="w-full rounded-[0.625rem] border-[1.5px] border-[#232c42] bg-[#0a0e18] px-3.5 py-3 pl-11 pr-12 text-[0.92rem] text-[#eefaf2] outline-none transition placeholder:text-[#7c88a6]/70 focus:border-[#58f290] focus:ring-[3px] focus:ring-[#58f290]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-[#7c88a6] transition hover:text-[#eefaf2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end text-[0.83rem]">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-[#86efac] transition hover:text-[#bbf7d0] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[0.625rem] bg-linear-to-r from-[#58f290] to-[#22c55e] px-6 py-3.5 text-[0.98rem] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(34, 197, 94,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isLoading ? (
                <>
                  <span className="h-[1.15rem] w-[1.15rem] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-[#1a2135] pt-5 text-center">
            <p className="text-[0.72rem] text-[#7c88a6]">
              © {new Date().getFullYear()} Admin Hub. All rights reserved.
            </p>

            <p className="mt-1 text-[0.72rem] text-[#7c88a6]/70">
              All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
