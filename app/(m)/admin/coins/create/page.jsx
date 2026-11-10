"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Image,
  Wallet,
  Percent,
  Coins,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

// CoinGecko ID mapping for popular cryptocurrencies
const coinGeckoMapping = {
  bitcoin: "bitcoin",
  btc: "bitcoin",
  ethereum: "ethereum",
  eth: "ethereum",
  tether: "tether",
  usdt: "tether",
  "usd-coin": "usd-coin",
  usdc: "usd-coin",
  "binance-usd": "binance-usd",
  busd: "binance-usd",
  binancecoin: "binancecoin",
  bnb: "binancecoin",
  ripple: "ripple",
  xrp: "ripple",
  cardano: "cardano",
  ada: "cardano",
  solana: "solana",
  sol: "solana",
  polkadot: "polkadot",
  dot: "polkadot",
  dogecoin: "dogecoin",
  doge: "dogecoin",
  "matic-network": "matic-network",
  matic: "matic-network",
  litecoin: "litecoin",
  ltc: "litecoin",
  chainlink: "chainlink",
  link: "chainlink",
  "avalanche-2": "avalanche-2",
  avax: "avalanche-2",
};

const coinTypes = ["Stocks", "Crypto", "Meme"];

export default function CreateCoinPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // Create coin
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.coin_name || !form.coin_title || form.coin_rate <= 0) {
      toast.error("Coin name, title, and rate are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/coin-create.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Coin created successfully!");

        // Reset form
        setForm({
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

        setTimeout(() => {
          router.push("/admin/coins");
        }, 600);
      } else {
        toast.error(res.message || "Failed to create coin");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coin");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current price from CoinGecko API
  const fetchCurrentPrice = async () => {
    if (!form.coin_title) {
      toast.error("Please enter coin title first (must match CoinGecko ID)");
      return;
    }

    setIsFetchingPrice(true);

    try {
      const coinId = form.coin_title.toLowerCase().trim();
      const geckoId = coinGeckoMapping[coinId] || coinId;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          geckoId,
        )}&vs_currencies=usd`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data[geckoId] && data[geckoId].usd) {
        const price = data[geckoId].usd;
        setForm((prev) => ({ ...prev, coin_rate: parseFloat(price) }));
        toast.success(
          `Successfully fetched current price: $${price.toLocaleString()}`,
        );

        // Auto-fill coin name if empty
        if (!form.coin_name) {
          setForm((prev) => ({
            ...prev,
            coin_name: form.coin_title.toUpperCase(),
          }));
        }
      } else {
        throw new Error("Coin not found or price data unavailable");
      }
    } catch (error) {
      console.error("Price fetch error:", error);

      let errorMsg = `Failed to fetch price: ${error.message}`;
      if (error.message.includes("not found")) {
        errorMsg +=
          "\n\nCommon CoinGecko IDs: bitcoin, ethereum, tether, binancecoin, ripple, cardano, solana, dogecoin";
      }
      toast.error(errorMsg);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
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
    toast.dismiss();
    toast.info("Form has been reset");
  };

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
          Add New Cryptocurrency
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Add a new cryptocurrency for users to trade and invest in
        </p>
      </div>

      {/* Form */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="coin_title"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Coin Title (CoinGecko ID) *
                </label>
                <div className="flex items-center gap-2">
                  <a
                    href="https://api.coingecko.com/api/v3/coins/list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400"
                  >
                    Get listed coins on CoinGecko
                  </a>
                </div>
                <p className="mb-1.5 mt-1 text-xs text-red-400">
                  Make sure the coin title matches the CoinGecko ID exactly
                </p>
                <input
                  id="coin_title"
                  type="text"
                  placeholder="e.g., bitcoin, ethereum, tether"
                  value={form.coin_title}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
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
                      disabled={isLoading || isFetchingPrice}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchCurrentPrice}
                    disabled={isFetchingPrice || !form.coin_title || isLoading}
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
                        Fetch Price
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Enter CoinGecko ID above first, then click Fetch Price
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
                  disabled={isLoading}
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
                    alt=""
                  />
                  <input
                    id="photo"
                    type="url"
                    placeholder="https://example.com/bitcoin.png"
                    value={form.photo}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>

                {/* Photo Preview */}
                {form.photo && (
                  <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
                      Photo Preview
                    </h3>
                    <img
                      src={form.photo}
                      alt={form.coin_title || "Coin preview"}
                      className="h-32 w-auto max-w-full rounded-md object-contain"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                />
              </div>

              <div className="md:col-span-2">
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
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
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
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
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
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="true">🟢 Visible to users</option>
                  <option value="false">🔴 Hidden from users</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Coin Summary Preview
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Coin Symbol
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.coin_name || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Coin Title
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.coin_title || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Price (USD)
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  ${form.coin_rate || "0.00"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Status
                </span>
                <span
                  className={`block font-semibold ${
                    form.coin_visible === "true"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {form.coin_visible === "true" ? "🟢 Visible" : "🔴 Hidden"}
                </span>
              </div>
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
                  Create Coin
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
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              <Coins size={18} />
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
