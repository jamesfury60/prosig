"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Shield,
} from "lucide-react";
import "./Security.global.css";
import styles from "./Security.module.css";
import { api } from "@/lib/axios";

export default function SecurityPage() {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  /*
   * ---------------------------------------------------------
   * INPUT HANDLING
   * ---------------------------------------------------------
   */

  function handleInputChange(field, value) {
    setPasswordDraft((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  }

  /*
   * ---------------------------------------------------------
   * PASSWORD STRENGTH
   * ---------------------------------------------------------
   */

  const newPass = passwordDraft.newPassword;

  const hasMinLength = newPass.length >= 8;
  const hasUpper = /[A-Z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPass);

  const score = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  function getStrengthLabel() {
    if (!newPass) {
      return {
        label: "",
        color: "transparent",
      };
    }

    if (score <= 1) {
      return {
        label: "Weak",
        color: "var(--danger)",
      };
    }

    if (score <= 3) {
      return {
        label: "Medium",
        color: "var(--warning)",
      };
    }

    return {
      label: "Strong",
      color: "var(--success)",
    };
  }

  const strength = getStrengthLabel();

  /*
   * ---------------------------------------------------------
   * CHANGE PASSWORD
   * ---------------------------------------------------------
   */

  async function handlePasswordSave(e) {
    e.preventDefault();

    const newErrors = {};

    /*
     * Current password
     */
    if (!passwordDraft.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required.";
    }

    /*
     * New password
     */
    if (!passwordDraft.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (score < 2) {
      newErrors.newPassword = "Password is too weak.";
    }

    /*
     * Confirm password
     */
    if (!passwordDraft.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    /*
     * Don't submit if validation fails
     */
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    toast.dismiss();

    try {
      /*
       * Send exactly what the PHP API expects.
       */
      const response = await api.post("/user/change_password.php", {
        current_password: passwordDraft.currentPassword,

        new_password: passwordDraft.newPassword,

        confirm_password: passwordDraft.confirmPassword,
      });

      const data = response.data;

      /*
       * Handle API-level failure.
       *
       * Axios only throws automatically for HTTP errors
       * such as 400/401/500. If your PHP returns:
       *
       * {
       *   success: false,
       *   message: "..."
       * }
       *
       * with HTTP 200, we handle it here.
       */
      if (!data?.success) {
        throw new Error(data?.message || "Failed to update password.");
      }

      /*
       * Success
       */
      toast.success(data.message || "Password updated successfully!");

      /*
       * Clear password fields
       */
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Change password error:", error);

      /*
       * PHP API error response
       *
       * Axios error response:
       *
       * error.response.data.message
       */
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update password.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * TWO FACTOR AUTHENTICATION
   * ---------------------------------------------------------
   *
   * This is still frontend-only for now.
   * Replace this with your 2FA API when ready.
   */

  /*
   * ---------------------------------------------------------
   * TERMINATE SESSION
   * ---------------------------------------------------------
   *
   * Still frontend-only for now.
   */

  function terminateSession(id) {
    setSessions((prev) => prev.filter((session) => session.id !== id));

    toast.success("Session terminated.");
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className={styles["page-container"]}>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <ShieldCheck size={22} />
        </div>

        <div>
          <h1 className={styles["page-title"]}>Security & Privacy</h1>

          <p className={styles["page-subtitle"]}>
            Manage your credentials, 2FA protection, and active login sessions.
          </p>
        </div>
      </div>

      {/* =====================================================
          CONTENT GRID
      ====================================================== */}

      <div className={styles["content-grid"]}>
        {/* ===================================================
            PASSWORD MANAGEMENT
        ==================================================== */}

        <div className={styles.panel}>
          <div className={styles["panel-header"]}>
            <div className={styles["title-with-icon"]}>
              <KeyRound size={18} className="accent-icon" />

              <h2>Change Password</h2>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSave}
            className={styles["password-form"]}
          >
            {/* =================================================
                CURRENT PASSWORD
            ================================================== */}

            <div className={styles.field}>
              <label className={styles["field-label"]}>Current Password</label>

              <div className={styles["input-wrapper"]}>
                <input
                  type={showCurrentPass ? "text" : "password"}
                  className={styles["field-input"]}
                  value={passwordDraft.currentPassword}
                  onChange={(e) =>
                    handleInputChange("currentPassword", e.target.value)
                  }
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className={styles["toggle-eye"]}
                  onClick={() => setShowCurrentPass((prev) => !prev)}
                  aria-label={
                    showCurrentPass
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.currentPassword && (
                <span className={styles["error-text"]}>
                  {errors.currentPassword}
                </span>
              )}
            </div>

            {/* =================================================
                NEW PASSWORD
            ================================================== */}

            <div className={styles.field}>
              <label className={styles["field-label"]}>New Password</label>

              <div className={styles["input-wrapper"]}>
                <input
                  type={showNewPass ? "text" : "password"}
                  className={styles["field-input"]}
                  value={passwordDraft.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className={styles["toggle-eye"]}
                  onClick={() => setShowNewPass((prev) => !prev)}
                  aria-label={
                    showNewPass ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.newPassword && (
                <span className={styles["error-text"]}>
                  {errors.newPassword}
                </span>
              )}

              {/* PASSWORD STRENGTH */}

              {newPass && (
                <div className={styles["strength-meter"]}>
                  <div className={styles.bars}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={styles.bar}
                        style={{
                          backgroundColor:
                            level <= score ? strength.color : undefined,
                        }}
                      />
                    ))}
                  </div>

                  <span
                    className={styles["strength-text"]}
                    style={{
                      color: strength.color,
                    }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className={styles.field}>
              <label className={styles["field-label"]}>
                Confirm New Password
              </label>

              <div className={styles["input-wrapper"]}>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  className={styles["field-input"]}
                  value={passwordDraft.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className={styles["toggle-eye"]}
                  onClick={() => setShowConfirmPass((prev) => !prev)}
                  aria-label={
                    showConfirmPass
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <span className={styles["error-text"]}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* =================================================
                REQUIREMENTS
            ================================================== */}

            <div className={styles["requirements-box"]}>
              <span className={styles["req-title"]}>Password Requirements</span>

              <div className={styles["req-grid"]}>
                <div
                  className={`${styles["req-item"]} ${
                    hasMinLength ? styles.met : ""
                  }`}
                >
                  {hasMinLength ? <Check size={12} /> : <X size={12} />}

                  <span>At least 8 characters</span>
                </div>

                <div
                  className={`${styles["req-item"]} ${
                    hasUpper ? styles.met : ""
                  }`}
                >
                  {hasUpper ? <Check size={12} /> : <X size={12} />}

                  <span>One uppercase letter</span>
                </div>

                <div
                  className={`${styles["req-item"]} ${
                    hasNumber ? styles.met : ""
                  }`}
                >
                  {hasNumber ? <Check size={12} /> : <X size={12} />}

                  <span>One numeric digit</span>
                </div>

                <div
                  className={`${styles["req-item"]} ${
                    hasSpecial ? styles.met : ""
                  }`}
                >
                  {hasSpecial ? <Check size={12} /> : <X size={12} />}

                  <span>One special character</span>
                </div>
              </div>
            </div>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              className={styles["btn-primary"]}
              disabled={isSaving}
            >
              {isSaving ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* ===================================================
            SIDE COLUMN
        ==================================================== */}

        <div className={styles["side-col"]}>
          {/* =================================================
              2FA
          ================================================== */}

          <div className={styles.panel}>
            <div className={styles["tfa-card"]}>
              <div
                className={styles["panel-header"]}
                style={{
                  marginBottom: 0,
                }}
              >
                <div className={styles["title-with-icon"]}>
                  <Shield size={18} className="accent-icon" />

                  <h3 className={styles["tfa-title"]}>
                    Two-Factor Authentication
                  </h3>
                </div>
              </div>

              <p className={styles["tfa-desc"]}>
                Add an extra layer of security to your account using TOTP apps
                like Google Authenticator or 1Password.
              </p>

              <div className={styles["tfa-action"]}>
                <span className={styles["status-badge"]}>Secured</span>
              </div>
            </div>
          </div>

          {/* =================================================
              SECURITY NOTICE
          ================================================== */}

          <div className={`${styles.panel} ${styles["alert-panel"]}`}>
            <div className={styles["alert-content"]}>
              <AlertTriangle size={18} className="alert-icon" />

              <div className={styles["alert-text"]}>
                <h4>Security Recommendation</h4>

                <p>
                  Ensure your account email address is up to date to receive
                  instantaneous security notices regarding new device sign-ins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
