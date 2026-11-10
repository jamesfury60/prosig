"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Shield, ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import styles from "./forgot-password.module.css";

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Theme — read stored/preferred theme once on mount (client-only), and
  // keep it in sync if it's changed from another tab while this page is
  // open. Same pattern as the login/register pages.
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

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/request-reset.php", {
        email: email.trim(),
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Could not send reset link.");
      }

      setSubmitted(true);

      toast.success(
        res.message || "Reset link sent successfully! Check your email.",
        {
          duration: 4000,
        },
      );
    } catch (error) {
      console.error("Password reset error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset link. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.gridBg} />
      <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
      <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

      <div className={styles.card}>
        <div className={styles.brandHeader}>
          {/* <div className={styles.brandLogo}>
            <Shield size={22} />
          </div>
          <span className={styles.brandName}>Prosignalbase</span> */}
        </div>

        {!submitted ? (
          <>
            <div className={styles.iconBadge}>
              <Mail size={26} />
            </div>

            <div className={styles.formHeader}>
              <h1>Reset Your Password</h1>
              <p>
                Enter your email address and we&apos;ll send you a secure link
                to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <small className={styles.fieldHint}>
                  Enter the email associated with your Prosignalbase account.
                </small>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <MailCheck size={28} />
            </div>
            <h1>Check your inbox</h1>
            <p>
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              The link expires in 1 hour for your security.
            </p>
            <p className={styles.successNote}>
              If you don&apos;t receive an email within a few minutes, check
              your spam folder.
            </p>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={() => setSubmitted(false)}
            >
              Use a different email
            </button>
          </div>
        )}

        <Link href="/auth/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
