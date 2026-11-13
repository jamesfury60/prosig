"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import styles from "./login.module.css";
import Header from "@/components/Header";

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Theme — read stored/preferred theme once on mount (client-only), and
  // keep it in sync if it's changed from another tab (e.g. the dashboard
  // or landing page) while this page is open, since this page has no
  // toggle control of its own.
  useEffect(() => {
    function applyTheme() {
      document.documentElement.classList.toggle(
        "light",
        resolveTheme() === "light",
      );
    }

    applyTheme();

    function handleStorage(e) {
      if (e.key === "vaultline-theme") applyTheme();
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function togglePassword() {
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      toast.loading("Verifying credentials...", {
        id: "login",
      });

      const response = await api.post("/auth/login.php", {
        email,
        password,
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Invalid email or password.");
      }

      // Refresh the session query after successful login
      await queryClient.invalidateQueries({
        queryKey: ["session"],
      });

      toast.success("Login successful! Redirecting...", {
        id: "login",
      });

      setTimeout(() => {
        // router.push("/dashboard");
        window.location.href = "/dashboard";
      }, 600);
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage, {
        id: "login",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      {/* Prominent Green Grid Pattern Background */}
      <div className={styles.gridBg} />

      {/* Ambient Green Orbs */}
      <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
      <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

      <div className={styles.loginCard}>
        {/* Left Branding Section */}
        <div className={styles.brandSection}>
          <div className={styles.brandHeader}>
            {/* <div className={styles.brandLogo}>
              <Shield size={22} className={styles.logoIcon} />
            </div>
            <span className={styles.brandName}>Capitaledgehub</span> */}
            <span className="m-auto mb-2">
              <img src="/assets/crp.avif" className="w-5xl" />
            </span>
          </div>

          <div className={styles.brandContent}>
            <h2>High-performance cloud intelligence.</h2>
            <p>
              Secure access point for system monitoring, live network analytics,
              and automated deployment pipelines.
            </p>
          </div>

          <div className={styles.brandFooter}>
            © {new Date().getFullYear()} Capitaledgehub. All rights reserved.
          </div>
        </div>

        {/* Right Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue.</p>
          </div>

          <div className={styles.divider}>
            <span>Access your trading dashboard</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  className={styles.formInput}
                  placeholder="alex@apex.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.fieldLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.formInput} ${styles.withToggle}`}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={togglePassword}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.signupText}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
