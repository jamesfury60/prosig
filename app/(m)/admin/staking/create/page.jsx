"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
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

export default function CreateStakingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    coin: "",
    apy: "",
    lock_period: 30,
    minimum_amount: "",
    maximum_amount: "",
    type: "Locked",
    status: "true",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOtherCoin, setShowOtherCoin] = useState(false);

  // Unified change handler using name attribute
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle coin selection
  const handleCoinChange = (e) => {
    const value = e.target.value;
    if (value === "other") {
      setShowOtherCoin(true);
      setForm((prev) => ({ ...prev, coin: "" }));
    } else {
      setShowOtherCoin(false);
      setForm((prev) => ({ ...prev, coin: value }));
    }
  };

  // Create staking plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.title || !form.coin || !form.apy || form.lock_period <= 0) {
      toast.error("Title, coin, APY, and lock period are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/staking-create.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Staking plan created successfully!");

        // Reset form
        setForm({
          title: "",
          coin: "",
          apy: "",
          lock_period: 30,
          minimum_amount: "",
          maximum_amount: "",
          type: "Locked",
          status: "true",
        });
        setShowOtherCoin(false);

        setTimeout(() => {
          router.push("/admin/staking");
        }, 600);
      } else {
        toast.error(res.message || "Failed to create staking plan");
      }
    } catch (error) {
      console.error("Create staking plan error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create staking plan",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      coin: "",
      apy: "",
      lock_period: 30,
      minimum_amount: "",
      maximum_amount: "",
      type: "Locked",
      status: "true",
    });
    setShowOtherCoin(false);
    toast.dismiss();
    toast.info("Form has been reset");
  };

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
          Create New Staking Plan
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Add a new staking plan for users to earn rewards
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Staking Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Staking Title *
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g., Bitcoin Staking, Ethereum Flexible Savings"
                  value={form.title}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                {showOtherCoin && (
                  <input
                    name="coin"
                    type="text"
                    placeholder="Enter cryptocurrency symbol"
                    value={form.coin}
                    onChange={handleChange}
                    disabled={isLoading}
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
                    type="number"
                    step="0.01"
                    placeholder="5.25"
                    value={form.apy}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Enter the annual percentage yield
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
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Number of days funds are locked
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="Locked">🔒 Locked Staking</option>
                  <option value="Flexible">🔄 Flexible Staking</option>
                </select>
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
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
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
                    type="number"
                    step="0.00000001"
                    placeholder="1000"
                    value={form.maximum_amount}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Leave empty for unlimited
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
                  Staking Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="true">
                    🟢 Active - Available for staking
                  </option>
                  <option value="false">🔴 Inactive - Not available</option>
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
                  Coin
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
                  Type
                </span>
                <span className="block font-semibold text-green-500 dark:text-green-400">
                  {form.type === "Locked" ? "🔒 Locked" : "🔄 Flexible"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Staking Plan
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
