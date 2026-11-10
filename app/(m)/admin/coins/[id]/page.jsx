"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  RefreshCw,
  DollarSign,
  Image,
  Wallet,
  Percent,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

const coinTypes = ["Stocks", "Crypto", "Meme"];

export default function EditCoinPage() {
  const router = useRouter();
  const params = useParams();
  const coinId = params.id;

  const [form, setForm] = useState({
    coin_name: "",
    coin_title: "",
    coin_rate: 0,
    photo: "",
    with_min: "",
    with_max: "",
    with_instructions: "",
    deposit_instructions: "",
    deposit_address: "Please contact support for wallet address",
    percent: "",
    coin_visible: "true",
    type: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // Fetch coin details
  const fetchCoin = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(`/admin/coin-single.php?id=${coinId}`);
      const res = response.data;

      if (res.success) {
        const coin = res.coin;
        setForm({
          coin_name: coin.coin_name || "",
          coin_title: coin.coin_title || "",
          coin_rate: coin.coin_rate || 0,
          photo: coin.photo || "",
          with_min: coin.with_min || "",
          with_max: coin.with_max || "",
          with_instructions: coin.with_instructions || "",
          deposit_instructions: coin.deposit_instructions || "",
          deposit_address:
            coin.deposit_address || "Please contact support for wallet address",
          percent: coin.percent || "",
          coin_visible: coin.coin_visible || "true",
          type: coin.type || "",
        });
      } else {
        toast.error(res.message || "Coin not found");
        setTimeout(() => {
          router.push("/admin/coins");
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch coin error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load coin details",
      );
      setTimeout(() => {
        router.push("/admin/coins");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Update coin
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.coin_name || !form.coin_title || form.coin_rate <= 0) {
      toast.error("Coin name, title, and rate are required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.post("/admin/coin-update.php", {
        coin_id: parseInt(coinId),
        ...form,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Coin updated successfully!");
        setTimeout(() => {
          router.push("/admin/coins");
        }, 600);
      } else {
        toast.error(res.message || "Failed to update coin");
      }
    } catch (error) {
      console.error("Update coin error:", error);
      toast.error(error.response?.data?.message || "Failed to update coin");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch current price
  const fetchCurrentPrice = async () => {
    if (!form.coin_name) {
      toast.error("Please enter coin name first");
      return;
    }

    setIsFetchingPrice(true);

    try {
      const response = await api.get("/admin/coin-autoprice.php");
      const res = response.data;

      if (res.success && res.updated) {
        await fetchCoin();
        toast.success("Price updated successfully!");
      } else {
        toast.info(res.message || "Price is already up to date");
      }

      if (res.errors && res.errors.length > 0) {
        console.error("Price update errors:", res.errors);
      }
    } catch (error) {
      console.error("Fetch price error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch current price",
      );
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Reset form to original values
  const resetForm = async () => {
    await fetchCoin();
    toast.dismiss();
    toast.info("Form has been reset");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  // Get coin icon color
  const getCoinIconColor = (name) => {
    const colors = {
      BTC: "linear-gradient(135deg, #f7931a, #f7931a)",
      ETH: "linear-gradient(135deg, #627eea, #627eea)",
      USDT: "linear-gradient(135deg, #26a17b, #26a17b)",
      BNB: "linear-gradient(135deg, #f3ba2f, #f3ba2f)",
      SOL: "linear-gradient(135deg, #9945ff, #14f195)",
      XRP: "linear-gradient(135deg, #00aae4, #00aae4)",
      ADA: "linear-gradient(135deg, #0033ad, #0033ad)",
      DOGE: "linear-gradient(135deg, #c2a633, #c2a633)",
      DOT: "linear-gradient(135deg, #e6007a, #e6007a)",
      LTC: "linear-gradient(135deg, #bfbbbb, #bfbbbb)",
      LINK: "linear-gradient(135deg, #2a5ada, #2a5ada)",
      AVAX: "linear-gradient(135deg, #e84142, #e84142)",
    };
    return (
      colors[name?.toUpperCase()] || "linear-gradient(135deg, #16a34a, #16a34a)"
    );
  };

  // Get coin symbol
  const getCoinSymbol = (name) => {
    const symbols = {
      BTC: "₿",
      ETH: "⟠",
      USDT: "$",
      BNB: "◆",
      SOL: "◎",
      XRP: "✕",
      ADA: "₳",
      DOGE: "Ð",
      DOT: "●",
      LTC: "Ł",
      LINK: "🔗",
      AVAX: "▲",
    };
    return (
      symbols[name?.toUpperCase()] || name?.charAt(0)?.toUpperCase() || "₿"
    );
  };

  // Load coin data on mount
  useEffect(() => {
    fetchCoin();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 lg:p-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
            <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Loading coin details...
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
          href="/admin/coins"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Coins
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Edit Cryptocurrency
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update coin information and settings
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Coin Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Coin Preview
            </h3>
            <div className="flex items-center gap-4 md:gap-6">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.coin_name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{
                    background: getCoinIconColor(form.coin_name),
                  }}
                >
                  {getCoinSymbol(form.coin_name)}
                </div>
              )}
              <div className="flex-1">
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {form.coin_name || "N/A"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                  {form.coin_title || "N/A"}
                </div>
                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(form.coin_rate)}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="coin_name"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Coin Symbol *
                </label>
                <input
                  id="coin_name"
                  type="text"
                  placeholder="e.g., BTC, ETH, USDT"
                  value={form.coin_name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="coin_title"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Coin Title *
                </label>
                <input
                  id="coin_title"
                  type="text"
                  placeholder="e.g., Bitcoin, Ethereum, Tether"
                  value={form.coin_title}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="coin_rate"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Current Price (USD) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      id="coin_rate"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="45000.00"
                      value={form.coin_rate}
                      onChange={handleChange}
                      disabled={isSaving || isFetchingPrice}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchCurrentPrice}
                    disabled={isFetchingPrice || isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                  >
                    {isFetchingPrice ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Fetch Live Price
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Current market price in USD
                </p>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Coin Type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="">Select type</option>
                  {coinTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="photo"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Coin Icon URL
                </label>
                <div className="relative">
                  <Image
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="photo"
                    type="url"
                    placeholder="https://example.com/bitcoin.png"
                    value={form.photo}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  URL to coin icon image
                </p>
              </div>
            </div>
          </div>

          {/* Withdrawal Settings */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Withdrawal Settings
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="with_min"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Minimum Withdrawal
                </label>
                <input
                  id="with_min"
                  type="number"
                  step="0.00000001"
                  placeholder="0.001"
                  value={form.with_min}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Minimum amount for withdrawal
                </p>
              </div>

              <div>
                <label
                  htmlFor="with_max"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Maximum Withdrawal
                </label>
                <input
                  id="with_max"
                  type="number"
                  step="0.00000001"
                  placeholder="1000"
                  value={form.with_max}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Maximum amount for withdrawal
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="with_instructions"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Withdrawal Instructions
                </label>
                <textarea
                  id="with_instructions"
                  rows="3"
                  placeholder="Instructions for withdrawing this coin..."
                  value={form.with_instructions}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Instructions shown to users during withdrawal
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Settings */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Deposit Settings
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="deposit_instructions"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  About Coin/Stocks/Others
                </label>
                <textarea
                  id="deposit_instructions"
                  rows="3"
                  placeholder="More about the crypto coin/stock/others..."
                  value={form.deposit_instructions}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Information shown to users about this coin
                </p>
              </div>

              <div>
                <label
                  htmlFor="deposit_address"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Deposit Address
                </label>
                <div className="relative">
                  <Wallet
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="deposit_address"
                    type="text"
                    placeholder="Wallet address for deposits"
                    value={form.deposit_address}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Wallet address for user deposits
                </p>
              </div>

              <div>
                <label
                  htmlFor="percent"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Transaction Fee (%)
                </label>
                <div className="relative">
                  <Percent
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="percent"
                    type="text"
                    placeholder="0.1"
                    value={form.percent}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Transaction fee percentage
                </p>
              </div>

              <div>
                <label
                  htmlFor="coin_visible"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Visibility
                </label>
                <select
                  id="coin_visible"
                  value={form.coin_visible}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="true">
                    ✅ Visible - Users can see and use this coin
                  </option>
                  <option value="false">
                    ❌ Hidden - Users cannot see this coin
                  </option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Control coin visibility to users
                </p>
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
                  Updating Coin...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Coin
                </>
              )}
            </button>

            <Link
              href="/admin/coins"
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
