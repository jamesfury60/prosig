"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

const popularCoins = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "BNB",
  "XRP",
  "ADA",
  "SOL",
  "DOT",
  "MATIC",
  "LTC",
  "DOGE",
  "AVAX",
  "LINK",
  "ATOM",
  "XLM",
  "BCH",
  "ETC",
  "XMR",
  "TRX",
];

export default function EditStakingPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id;

  const [form, setForm] = useState({
    title: "",
    coin: "",
    apy: "",
    lock_period: "",
    minimum_amount: "",
    maximum_amount: "",
    type: "Locked",
    status: "true",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showOtherCoin, setShowOtherCoin] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Handle coin selection
  function handleCoinChange(e) {
    const value = e.target.value;
    if (value === "other") {
      setShowOtherCoin(true);
      setForm({
        ...form,
        coin: "",
      });
    } else {
      setShowOtherCoin(false);
      setForm({
        ...form,
        coin: value,
      });
    }
  }

  // Fetch staking plan details
  async function fetchPlan() {
    setIsLoading(true);

    try {
      const response = await api.get(`/admin/staking-single.php?id=${planId}`);
      const res = response.data;

      if (res.success && res.plan) {
        const plan = res.plan;
        setForm({
          title: plan.title || "",
          coin: plan.coin || "",
          apy: plan.apy || "",
          lock_period: plan.lock_period || "",
          minimum_amount: plan.minimum_amount || "",
          maximum_amount: plan.maximum_amount || "",
          type: plan.type || "Locked",
          status: plan.status || "true",
        });

        // Check if coin is in the popular list
        if (!popularCoins.includes(plan.coin) && plan.coin) {
          setShowOtherCoin(true);
        }
      } else {
        toast.error(res.message || "Staking plan not found");
        setTimeout(() => {
          router.push("/admin/staking");
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch staking plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load staking plan details",
      );
      setTimeout(() => {
        router.push("/admin/staking");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  }

  // Update staking plan
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.title || !form.coin || !form.apy || form.lock_period <= 0) {
      toast.error("Title, coin, APY, and lock period are required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.post("/admin/staking-update.php", {
        id: parseInt(planId),
        ...form,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Staking plan updated successfully!");
        setTimeout(() => {
          router.push("/admin/staking");
        }, 600);
      } else {
        toast.error(res.message || "Failed to update staking plan");
      }
    } catch (error) {
      console.error("Update staking plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update staking plan",
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

  // Format amount
  function formatAmount(amount) {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  }

  // Get type description
  function getTypeDescription(type) {
    return type === "Locked"
      ? "Funds are locked for the entire period"
      : "Funds can be withdrawn anytime";
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
          href="/admin/staking"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Staking Plans
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Edit Staking Plan
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update staking plan information and terms
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
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Plan Title *
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g., Bitcoin Staking, Ethereum Flexible Savings"
                  value={form.title}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="coin"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Cryptocurrency *
                </label>
                <select
                  name="coin"
                  value={form.coin || ""}
                  onChange={handleCoinChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  required
                >
                  <option value="">Select cryptocurrency</option>
                  {popularCoins.map((coin) => (
                    <option key={coin} value={coin}>
                      {coin}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {(showOtherCoin ||
                  (!popularCoins.includes(form.coin) && form.coin)) && (
                  <input
                    name="coin"
                    type="text"
                    placeholder="Enter cryptocurrency symbol"
                    value={form.coin}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="apy"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  APY (Annual Percentage Yield) *
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="apy"
                    type="text"
                    placeholder="5.25"
                    value={form.apy}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Annual Percentage Yield
                </p>
              </div>
            </div>
          </div>

          {/* Staking Terms */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Staking Terms
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="lock_period"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Lock Period (Days) *
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="lock_period"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={form.lock_period}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Number of days funds will be locked
                </p>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Staking Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="Locked">🔒 Locked Staking</option>
                  <option value="Flexible">🔄 Flexible Staking</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  {getTypeDescription(form.type)}
                </p>
              </div>
            </div>
          </div>

          {/* Investment Range */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Investment Range
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="minimum_amount"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Minimum Amount ({form.coin || "Coin"})
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="minimum_amount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="0.001"
                    value={form.minimum_amount}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Minimum amount required to stake
                </p>
              </div>

              <div>
                <label
                  htmlFor="maximum_amount"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Maximum Amount ({form.coin || "Coin"})
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="maximum_amount"
                    type="text"
                    placeholder="1000 or leave empty for unlimited"
                    value={form.maximum_amount}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Maximum allowed amount (empty = unlimited)
                </p>
              </div>
            </div>
          </div>

          {/* Plan Settings */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Plan Settings
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
                  <option value="true">
                    ✅ Active - Available for staking
                  </option>
                  <option value="false">❌ Inactive - Not available</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Control plan availability to users
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
                  Cryptocurrency
                </span>
                <span className="block font-semibold text-yellow-500 dark:text-yellow-400">
                  {form.coin || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  APY
                </span>
                <span className="block font-semibold text-emerald-500 dark:text-emerald-400">
                  {form.apy || "—"}%
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Lock Period
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.lock_period || "—"} Days
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Staking Type
                </span>
                <span className="block font-semibold text-green-500 dark:text-green-400">
                  {form.type || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f] md:col-span-2">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Investment Range
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {formatAmount(form.minimum_amount)} -{" "}
                  {form.maximum_amount || "Unlimited"} {form.coin || ""}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f] md:col-span-2">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Status
                </span>
                <span
                  className={`block font-semibold ${
                    form.status === "true"
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {form.status === "true" ? "🟢 Active" : "🔴 Inactive"}
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
                  Updating Plan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Staking Plan
                </>
              )}
            </button>

            <Link
              href="/admin/staking"
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
