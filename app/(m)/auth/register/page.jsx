"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import styles from "./register.module.css";
import Header from "@/components/Header";

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Theme — read stored/preferred theme once on mount (client-only), and
  // keep it in sync if it's changed from another tab (e.g. the dashboard
  // or landing page) while this page is open. This page previously had
  // no theme logic at all, so it always rendered dark regardless of the
  // user's saved preference.
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

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isFormValid =
    fullname.trim() &&
    email.includes("@") &&
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    passwordsMatch &&
    accountType &&
    agreeTerms;

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!fullname.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/\d/.test(password)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!accountType) {
      toast.error("Please select an account type.");
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/register.php", {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        account_type: accountType,
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(
          res.message || "Registration failed. Please try again.",
        );
      }

      toast.success(
        res.message ||
          "Account created successfully! Check your email for verification.",
        {
          duration: 4000,
        },
      );

      setTimeout(() => {
        router.push(`/auth/?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.gridBg} />
      <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
      <div className={`${styles.glowSphere} ${styles.glowGreen}`} />

      <div className={styles.loginCard}>
        {/* Left Brand Section */}
        <div className={styles.brandSection}>
          <div className={styles.brandHeader}>
            {/* <div className={styles.brandLogo}>
              <Shield size={22} className={styles.logoIcon} />
            </div>
            <span className={styles.brandName}>Capitaledgehub</span> */}

            <span className="m-auto mt-10">
              <img src="/assets/phn.avif" className="w-64" />
            </span>
          </div>

          <div className={styles.brandContent}>
            <h2>Start Trading Today</h2>
            <p>
              Create your account and unlock access to professional trading
              tools, advanced charts, and institutional-grade security.
            </p>
          </div>

          <div className={styles.brandFooter}>
            © {new Date().getFullYear()} Capitaledgehub. All rights reserved.
          </div>
        </div>

        {/* Right Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1>Create Your Account</h1>
            <p>Start your trading journey in less than 2 minutes.</p>
          </div>

          <div className={styles.divider}>
            <span>Secure registration</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label htmlFor="fullname" className={styles.fieldLabel}>
                Full Name
              </label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="fullname"
                  type="text"
                  className={styles.formInput}
                  placeholder="John Doe"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                Ensure this email can receive verification info.
              </small>
            </div>

            {/* Account Type */}
            <div className={styles.formGroup}>
              <label htmlFor="accountType" className={styles.fieldLabel}>
                Account Type
              </label>
              <div className={styles.inputWrapper}>
                <svg
                  className={styles.inputIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <select
                  id="accountType"
                  className={`${styles.formInput} ${styles.selectInput}`}
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select account type</option>
                  <option value="Basic Account">Basic Account</option>
                  <option value="Standard Account">Standard Account</option>
                  <option value="Premium Account">Premium Account</option>
                  <option value="vip Account">VIP Account</option>
                </select>
              </div>
              <small className={styles.fieldHint}>
                Select the account type that best suits your trading needs.
              </small>
            </div>

            {/* Password */}
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {password && (
                <div className={styles.passwordRequirements}>
                  <div className={styles.requirementItem}>
                    <CheckCircle
                      size={14}
                      className={
                        hasMinLength
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }
                    />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={styles.requirementItem}>
                    <CheckCircle
                      size={14}
                      className={
                        hasUppercase
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }
                    />
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={styles.requirementItem}>
                    <CheckCircle
                      size={14}
                      className={
                        hasNumber
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }
                    />
                    <span>At least one number</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.fieldLabel}>
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.formInput} ${styles.withToggle}`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {confirmPassword && password && (
                <div className={styles.passwordRequirements}>
                  <div className={styles.requirementItem}>
                    <CheckCircle
                      size={14}
                      className={
                        passwordsMatch
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }
                    />
                    <span>Passwords match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className={styles.termsRow}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.signupText}>
            Already registered? <Link href="/auth">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
