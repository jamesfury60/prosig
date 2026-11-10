"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id;

  const [form, setForm] = useState({
    plan_name: "",
    plan_des: "",
    min_ins: "",
    max_ins: "",
    days_duration: "",
    daily_interest_rate: "",
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Fetch plan details
  async function fetchPlan() {
    setIsLoading(true);

    try {
      const response = await api.get(`/admin/plan-single.php?id=${planId}`);
      const res = response.data;

      if (res.success) {
        const plan = res.plan;
        setForm({
          plan_name: plan.plan_name || "",
          plan_des: plan.plan_des || "",
          min_ins: plan.min_ins || "",
          max_ins: plan.max_ins || "",
          days_duration: plan.days_duration || "",
          daily_interest_rate: plan.daily_interest_rate || "",
          status: plan.status || "active",
        });
      } else {
        toast.error(res.message || "Trading plan not found");
        setTimeout(() => {
          router.push("/admin/plans");
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load trading plan details",
      );
      setTimeout(() => {
        router.push("/admin/plans");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  }

  // Update plan
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.plan_name || !form.plan_des) {
      toast.error("Plan name and description are required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.post("/admin/plan-update.php", {
        id: parseInt(planId),
        ...form,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Trading plan updated successfully!");
        setTimeout(() => {
          router.push("/admin/plans");
        }, 600);
      } else {
        toast.error(res.message || "Failed to update trading plan");
      }
    } catch (error) {
      console.error("Update plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update trading plan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Reset form to original values
  async function resetForm() {
    await fetchPlan();
    toast.dismiss();
    toast.info("Form has been reset");
  }

  // Load plan data on mount
  useEffect(() => {
    fetchPlan();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 lg:p-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
            <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Loading plan details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/plans"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Trading Plans
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Edit Trading Plan
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update trading plan information and settings
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
                <input
                  name="plan_name"
                  type="text"
                  placeholder="e.g., Beginner Package, Premium Plan"
                  value={form.plan_name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="plan_des"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Plan Description *
                </label>
                <textarea
                  name="plan_des"
                  rows="3"
                  placeholder="Describe this trading plan in detail..."
                  value={form.plan_des}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Investment Details
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="min_ins"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Minimum Investment
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="min_ins"
                    type="number"
                    placeholder="100"
                    value={form.min_ins}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Enter the minimum investment amount
                </p>
              </div>

              <div>
                <label
                  htmlFor="max_ins"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Maximum Investment
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="max_ins"
                    type="number"
                    placeholder="5000"
                    value={form.max_ins}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Enter the maximum investment amount
                </p>
              </div>
            </div>
          </div>

          {/* Duration & Returns */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Duration & Returns
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="days_duration"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Duration (Days)
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="days_duration"
                    type="text"
                    placeholder="30"
                    value={form.days_duration}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Plan duration in days
                </p>
              </div>

              <div>
                <label
                  htmlFor="daily_interest_rate"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Daily Interest Rate
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="daily_interest_rate"
                    type="number"
                    step="0.01"
                    placeholder="1.5"
                    value={form.daily_interest_rate}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Daily interest rate percentage
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
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="active">
                    🟢 Active - Plan is available for investment
                  </option>
                  <option value="inactive">
                    🔴 Inactive - Plan is not available
                  </option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Control plan availability
                </p>
              </div>
            </div>
          </div>

          {/* Plan Summary Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Plan Summary Preview
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
                  Investment Range
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.min_ins || "—"} Min - {form.max_ins || "—"} Max
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Duration
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.days_duration || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Daily Interest
                </span>
                <span className="block font-semibold text-emerald-500 dark:text-emerald-400">
                  {form.daily_interest_rate || "—"}%
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Trading Plan
                </>
              )}
            </button>

            <Link
              href="/admin/plans"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              <X size={18} />
              Cancel
            </Link>

            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              Reset Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
