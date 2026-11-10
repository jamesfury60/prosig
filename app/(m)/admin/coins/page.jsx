"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Coins,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function CoinsPage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const priceUpdateIntervalRef = useRef(null);

  // Fetch coins
  const fetchCoins = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`/admin/coin-list.php?${params}`);
      const res = response.data;

      if (res.success) {
        setCoins(res.coins || []);
      } else {
        toast.error(res.message || "Failed to load coins");
      }
    } catch (error) {
      console.error("Fetch coins error:", error);
      toast.error(error.response?.data?.message || "Failed to load coins");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Update prices
  const updatePrices = async () => {
    setIsUpdatingPrices(true);

    try {
      const response = await api.get("/admin/coin-autoprice.php");
      const res = response.data;

      if (res.success) {
        if (res.updated) {
          toast.success(res.message || "Prices updated successfully!");
          await fetchCoins();
        } else {
          toast.info(res.message || "Prices are up to date");
        }

        if (res.errors && res.errors.length > 0) {
          console.error("Price update errors:", res.errors);
        }
      } else {
        toast.error(res.message || "Failed to update prices");
      }
    } catch (error) {
      console.error("Update prices error:", error);
      toast.error(error.response?.data?.message || "Failed to update prices");
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // Delete coin
  const deleteCoin = async (coinId, coinName) => {
    if (
      !confirm(
        `Are you sure you want to delete coin "${coinName}"? This will also delete all user balances for this coin.`,
      )
    ) {
      return;
    }

    try {
      // const response = await api.post('/admin/coin-delete.php', { coin_id: coinId });
      // const res = response.data;
      toast.error("Unable to delete coin");
      // if (res.success) {
      //   toast.success(res.message || 'Coin deleted successfully!');
      //   await fetchCoins();
      // } else {
      //   toast.error(res.message || 'Failed to delete coin');
      // }
    } catch (error) {
      console.error("Delete coin error:", error);
      toast.error(error.response?.data?.message || "Failed to delete coin");
    }
  };

  // Search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // Load coins on mount
  useEffect(() => {
    const loadCoins = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await api.get(`/admin/coin-list.php?${params}`);
        const res = response.data;

        if (res.success) {
          setCoins(res.coins || []);
        } else {
          toast.error(res.message || "Failed to load coins");
        }
      } catch (error) {
        console.error("Fetch coins error:", error);
        toast.error(error.response?.data?.message || "Failed to load coins");
      } finally {
        setIsLoading(false);
      }
    };

    loadCoins();
  }, [searchQuery]);

  // Set up auto-update interval (5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      updatePrices();
    }, 300000); // 5 minutes

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [updatePrices]);

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            Coin Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all cryptocurrencies, prices, and withdrawal limits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total Coins: {coins?.length || 0}
          </span>
          <button
            onClick={updatePrices}
            disabled={isUpdatingPrices}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {isUpdatingPrices ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Update Prices
              </>
            )}
          </button>
          <Link
            href="/admin/coins/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New Coin
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#8b93a7]"
        />
        <input
          type="text"
          placeholder="Search coins by name or title..."
          onChange={handleSearch}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-white dark:placeholder:text-[#8b93a7]"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Loading coins...
              </p>
            </div>
          ) : coins?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Coins
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No coins found
              </p>
              <Link
                href="/admin/coins/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Add First Coin
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Coin
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Price & Info
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Withdrawal Limits
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Last Updated
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin) => (
                  <tr
                    key={coin.coin_id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {coin.photo ? (
                          <img
                            src={coin.photo}
                            alt={coin.coin_name}
                            className="h-9 w-9 min-w-[2.25rem] rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-full text-white"
                            style={{
                              background: getCoinIconColor(coin.coin_name),
                            }}
                          >
                            <span className="font-bold">
                              {getCoinSymbol(coin.coin_name)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {coin.coin_name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                            {coin.coin_title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(coin.coin_rate)}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                          Type: {coin.type || "N/A"}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                          Fee: {coin.percent || "N/A"}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-sm text-zinc-500 dark:text-[#8b93a7]">
                        <span>Min: {coin.with_min || "N/A"}</span>
                        <span>Max: {coin.with_max || "N/A"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          coin.coin_visible === "true"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {coin.coin_visible === "true" ? (
                          <>
                            <Eye size={12} />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Hidden
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                        <Clock size={14} />
                        <span>{formatDate(coin.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/coins/${coin.coin_id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit Coin"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>
                        <button
                          onClick={() =>
                            deleteCoin(coin.coin_id, coin.coin_name)
                          }
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Coin"
                        >
                          <Trash2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-red-600 dark:text-[#8b93a7] dark:hover:text-red-400"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        {coins?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Showing {coins.length} of {coins.length} coins
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <RefreshCw size={12} className="animate-spin" />
                Auto-updates every 5 min
              </span>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]">
                Previous
              </button>
              <button className="rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white transition hover:bg-green-700">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
