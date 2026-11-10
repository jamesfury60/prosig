"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import styles from "./reset-password.module.css";

function resolveTheme() {
  const stored = localStorage.getItem("vaultline-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidAccess, setIsValidAccess] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState("Weak");
  const [passwordStrengthWidth, setPasswordStrengthWidth] = useState("0%");

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

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

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;

  const isFormValid =
    hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  // Validate access - must have email and token
  useEffect(() => {
    toast.dismiss();

    if (!email || !token) {
      setIsValidAccess(false);
      setIsCheckingAccess(false);
      toast.error(
        "Invalid or expired password reset link. Please request a new one.",
      );

      setTimeout(() => {
        router.push("/auth/forgot");
      }, 3000);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setIsValidAccess(false);
      setIsCheckingAccess(false);
      toast.error("Invalid email address in reset link.");

      setTimeout(() => {
        router.push("/auth/forgot");
      }, 3000);
      return;
    }

    if (token.length < 6) {
      setIsValidAccess(false);
      setIsCheckingAccess(false);
      toast.error("Invalid reset token format.");

      setTimeout(() => {
        router.push("/auth/forgot");
      }, 3000);
      return;
    }

    setIsValidAccess(true);
    setIsCheckingAccess(false);
  }, [email, token, router]);

  // Validate password strength
  useEffect(() => {
    let strength = 0;
    if (hasMinLength) strength += 25;
    if (hasUppercase) strength += 25;
    if (hasNumber) strength += 25;
    if (hasSpecial) strength += 25;

    setPasswordStrengthWidth(`${strength}%`);
    setPasswordStrength(
      strength >= 75 ? "Strong" : strength >= 50 ? "Medium" : "Weak",
    );
  }, [newPassword, hasMinLength, hasUppercase, hasNumber, hasSpecial]);

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!isValidAccess) {
      toast.error("Invalid access. Please request a new reset link.");
      router.push("/auth/forgot");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/reset-password.php", {
        email: email,
        token: token,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(
          res.message || "Password reset failed. Please try again.",
        );
      }

      toast.success(
        res.message || "Password reset successfully! You can now login.",
        {
          duration: 3000,
        },
      );

      setTimeout(() => {
        router.push("/auth/");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.gridBg} />
        <div className={`${styles.glowSphere} ${styles.glowPrimary}`} />
        <div className={`${styles.glowSphere} ${styles.glowGreen}`} />
        <div className={styles.card}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinnerWrapper}>
              <div className={styles.spinnerOuter}></div>
              <div className={styles.spinnerInner}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If access is invalid, show nothing (will redirect)
  if (!isValidAccess) {
    return null;
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

        <div className={styles.iconBadge}>
          <Lock size={26} />
        </div>

        <div className={styles.formHeader}>
          <h1>Create New Password</h1>
          <p>
            Choose a strong, unique password to secure your trading account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* New Password */}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.fieldLabel}>
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                className={`${styles.formInput} ${styles.withToggle}`}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Password Requirements */}
            {newPassword && (
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
                <div className={styles.requirementItem}>
                  <CheckCircle
                    size={14}
                    className={
                      hasSpecial
                        ? styles.requirementMet
                        : styles.requirementUnmet
                    }
                  />
                  <span>At least one special character</span>
                </div>
              </div>
            )}

            {/* Password Strength */}
            {newPassword && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthLabel}>
                  <span>Password Strength</span>
                  <span
                    className={
                      passwordStrength === "Strong"
                        ? styles.strengthStrong
                        : passwordStrength === "Medium"
                          ? styles.strengthMedium
                          : styles.strengthWeak
                    }
                  >
                    {passwordStrength}
                  </span>
                </div>
                <div className={styles.strengthBar}>
                  <div
                    className={
                      passwordStrength === "Strong"
                        ? styles.strengthBarStrong
                        : passwordStrength === "Medium"
                          ? styles.strengthBarMedium
                          : styles.strengthBarWeak
                    }
                    style={{ width: passwordStrengthWidth }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.fieldLabel}>
              Confirm New Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`${styles.formInput} ${styles.withToggle}`}
                placeholder="Confirm new password"
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && newPassword && (
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

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <span>Resetting Password...</span>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <Link href="/auth/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
