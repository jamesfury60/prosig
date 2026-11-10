"use client";

import { useState } from "react";
import { Shield, Lock, Mail, Key, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/axios";

export default function SettingsPage() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_email: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Update credentials
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.current_password || !form.new_password) {
      toast.error("Current password and new password are required");
      return;
    }

    // Validate password length
    if (form.new_password.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/admin-security.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Credentials updated successfully!");

        // Clear form inputs
        setForm({
          current_password: "",
          new_password: "",
          new_email: "",
        });
      } else {
        toast.error(res.message || "Failed to update credentials");
      }
    } catch (error) {
      console.error("Update credentials error:", error);

      // Handle specific error responses
      if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message ||
            "Invalid current password or email already in use",
        );
      } else if (error.response?.status === 401) {
        toast.error("Current password is incorrect. Please try again.");
      } else {
        toast.error(
          error.response?.data?.message || "Update failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form
  function resetForm() {
    setForm({
      current_password: "",
      new_password: "",
      new_email: "",
    });
    toast.dismiss();
    toast("Form has been reset", {
      icon: "🔄",
      duration: 3000,
    });
  }

  // Get password strength
  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "", width: 0 };
    if (password.length < 6) {
      return { label: "Weak", color: "bg-red-500", width: "33%" };
    } else if (password.length < 10) {
      return { label: "Medium", color: "bg-amber-500", width: "66%" };
    } else {
      return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    }
  };

  const strength = getPasswordStrength(form.new_password);

  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Security Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update your admin email or password to keep your account secure
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Security Icon */}
          <div className="mb-6 border-b border-zinc-200 pb-6 text-center dark:border-[#232a3b]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-600 text-white shadow-lg shadow-green-500/25">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Account Security
            </h2>
            <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Keep your credentials secure and up to date
            </p>
          </div>

          {/* New Email */}
          <div className="mb-4">
            <label
              htmlFor="new_email"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              <Mail size={16} />
              New Email (optional)
            </label>
            <input
              name="new_email"
              type="email"
              placeholder="admin@example.com"
              value={form.new_email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              Leave blank to keep current email
            </p>
          </div>

          {/* Current Password */}
          <div className="mb-4">
            <label
              htmlFor="current_password"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              <Lock size={16} />
              Current Password *
            </label>
            <div className="relative">
              <Key
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                name="current_password"
                type="password"
                placeholder="Enter your current password"
                value={form.current_password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label
              htmlFor="new_password"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              <Lock size={16} />
              New Password *
            </label>
            <div className="relative">
              <Key
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                name="new_password"
                type="password"
                placeholder="Enter your new password"
                value={form.new_password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              Enter a strong password with at least 8 characters
            </p>
          </div>

          {/* Password Strength Indicator */}
          {form.new_password && form.new_password.length > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-[#232a3b] dark:bg-[#1a2035]">
              <span className="text-xs font-medium text-zinc-500 dark:text-[#8b93a7]">
                Password Strength:
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#232a3b]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <span
                className={`text-xs font-semibold ${
                  strength.label === "Weak"
                    ? "text-red-500"
                    : strength.label === "Medium"
                      ? "text-amber-500"
                      : "text-emerald-500"
                }`}
              >
                {strength.label}
              </span>
            </div>
          )}

          {/* Security Tips */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
              Security Tips
            </h3>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-[#8b93a7]">
              <li>🔒 Use a unique password that you don't use elsewhere</li>
              <li>
                🔑 Include a mix of uppercase, lowercase, numbers, and symbols
              </li>
              <li>📧 Keep your email address updated for account recovery</li>
              <li>🛡️ Never share your credentials with anyone</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Credentials
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
