"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  Clock,
  Users,
  Percent,
  RefreshCw,
  FileText,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function CreateSubscriptionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    plan_name: "",
    plan_des: "",
    max_ins: "",
    days_duration: "",
    daily_interest_rate: "",
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Create investment plan
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (
      !form.plan_name ||
      !form.plan_des ||
      form.max_ins <= 0 ||
      form.days_duration <= 0 ||
      !form.daily_interest_rate
    ) {
      toast.error("All fields are required and must have valid values");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/bot-create.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Investment plan created successfully!");

        // Reset form
        setForm({
          plan_name: "",
          plan_des: "",
          max_ins: "",
          days_duration: "",
          daily_interest_rate: "",
          status: "active",
        });

        setTimeout(() => {
          router.push("/admin/subscriptions");
        }, 600);
      } else {
        toast.error(res.message || "Failed to create investment plan");
      }
    } catch (error) {
      console.error("Create investment plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create investment plan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form
  function resetForm() {
    setForm({
      plan_name: "",
      plan_des: "",
      max_ins: "",
      days_duration: "",
      daily_interest_rate: "",
      status: "active",
    });
    toast.dismiss();
    toast.info("Form has been reset");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/subscriptions"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Bots
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Create Investment Plan
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Add a new investment plan for users to subscribe to
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Plan Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Plan Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="plan_name"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Plan Name *
                </label>
                <div className="relative">
                  <Tag
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="plan_name"
                    type="text"
                    placeholder="e.g., Starter Plan, Premium Plan, VIP Plan"
                    value={form.plan_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="plan_des"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Plan Description *
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-3 text-zinc-400"
                  />
                  <textarea
                    name="plan_des"
                    rows="4"
                    placeholder="Describe the plan details, benefits, and terms..."
                    value={form.plan_des}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Investment Terms */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Investment Terms
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="max_ins"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Maximum Investors *
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="max_ins"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={form.max_ins}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Maximum number of investors allowed
                </p>
              </div>

              <div>
                <label
                  htmlFor="days_duration"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Days Duration *
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="days_duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={form.days_duration}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Number of days for the investment period
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="daily_interest_rate"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Daily Interest Rate (%) *
                </label>
                <div className="relative">
                  <Percent
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="daily_interest_rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="1.25"
                    value={form.daily_interest_rate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Daily interest rate percentage (e.g., 1% = 1.0)
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Settings
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Plan Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="active">
                    ✅ Active - Available for investment
                  </option>
                  <option value="inactive">❌ Inactive - Not available</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Plan Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Plan Name
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.plan_name || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Max Investors
                </span>
                <span className="block font-semibold text-yellow-500 dark:text-yellow-400">
                  {form.max_ins || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Duration
                </span>
                <span className="block font-semibold text-emerald-500 dark:text-emerald-400">
                  {form.days_duration || "—"} Days
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Daily Rate
                </span>
                <span className="block font-semibold text-green-500 dark:text-green-400">
                  {form.daily_interest_rate || "—"}%
                </span>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-[#232a3b] dark:bg-[#12161f]">
              <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                Description:
              </span>
              <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
                {form.plan_des || "No description"}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Investment Plan
                </>
              )}
            </button>

            <Link
              href="/admin/subscriptions"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              <X size={18} />
              Cancel
            </Link>

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
