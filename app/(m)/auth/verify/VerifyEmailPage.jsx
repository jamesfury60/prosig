"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import styles from "./verify-email.module.css";

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  // Theme — read stored/preferred theme once on mount (client-only), and
  // keep it in sync if it's changed from another tab while this page is
  // open. Same pattern as the other auth pages.
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

  useEffect(() => {
    toast.dismiss();
    // Validate access - must have email and code
    if (!email || !code) {
      setStatus("error");
      setMessage("Invalid verification link. Please register again.");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/auth/register");
      }, 3000);
      return;
    }

    // Validate email format
    if (!email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setMessage("Invalid email address in verification link.");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/auth/register");
      }, 3000);
      return;
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      setStatus("error");
      setMessage("Invalid verification code format.");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/auth/register");
      }, 3000);
      return;
    }

    // Auto-verify the email using GET request
    // eslint-disable-next-line react-hooks/immutability
    verifyEmail();
  }, [email, code]);

  async function verifyEmail() {
    try {
      // Use GET request with query parameters (matches PHP endpoint)
      const response = await api.get("/auth/verify.php", {
        params: {
          email: email,
          code: code,
        },
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Invalid or expired verification code.");
      }

      setStatus("success");

      toast.dismiss();
      setMessage(res.message || "Your email has been verified successfully!");

      toast.success("Email verified successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/");
      }, 3000);
    } catch (error) {
      console.error("Verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Verification failed. The link may have expired.";

      setStatus("error");
      setMessage(errorMessage);

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      toast.error("Email address is missing.");
      return;
    }

    try {
      const response = await api.post("/auth/resend-verification.php", {
        email: email,
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Could not resend verification code.");
      }

      toast.success(
        res.message ||
          "Verification code resent successfully! Check your email.",
        {
          duration: 3000,
        },
      );

      // Redirect back to register with a message
      setTimeout(() => {
        router.push(
          `/auth/register?resend=true&email=${encodeURIComponent(email)}`,
        );
      }, 1500);
    } catch (error) {
      console.error("Resend error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend code. Please try again.";

      toast.error(errorMessage);
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.gridBg} />
        <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
        <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

        <div className={styles.card}>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>
              <Shield size={22} />
            </div>
            <span className={styles.brandName}>Capitaledgehub</span>
          </div>

          <div className={styles.iconBadge}>
            <Loader2 size={32} className={styles.spinning} />
          </div>

          <div className={styles.formHeader}>
            <h1>Verifying your email</h1>
            <p>Please wait while we verify your account...</p>
          </div>

          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // Render success state
  if (status === "success") {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.gridBg} />
        <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
        <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

        <div className={styles.card}>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>
              <Shield size={22} />
            </div>
            <span className={styles.brandName}>Capitaledgehub</span>
          </div>

          <div className={`${styles.iconBadge} ${styles.successBadge}`}>
            <CheckCircle size={32} />
          </div>

          <div className={styles.formHeader}>
            <h1 className={styles.successTitle}>Email Verified! 🎉</h1>
            <p className={styles.successMessage}>{message}</p>
          </div>

          <div className={styles.redirectInfo}>
            <p>You will be redirected to login in a few seconds...</p>
          </div>

          <div className="m-3"></div>

          <Link href="/auth/" className={styles.submitBtn}>
            <span>Go to Login</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Render error state
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.gridBg} />
      <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
      <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <Shield size={22} />
          </div>
          <span className={styles.brandName}>Capitaledgehub</span>
        </div>

        <div className={`${styles.iconBadge} ${styles.errorBadge}`}>
          <XCircle size={32} />
        </div>

        <div className={styles.formHeader}>
          <h1 className={styles.errorTitle}>Verification Failed</h1>
          <p className={styles.errorMessage}>{message}</p>
        </div>

        <div className={styles.errorActions}>
          <button onClick={handleResend} className={styles.resendBtn}>
            Resend verification email
          </button>

          <Link href="/auth/register" className={styles.backLink}>
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
