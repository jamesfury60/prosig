"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Users,
  TrendingUp,
  Trophy,
  BarChart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function CopytradersPage() {
  const [copytraders, setCopytraders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);

  // Fetch copytraders
  const fetchCopytraders = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`/admin/copytrader-list.php?${params}`);
      const res = response.data;

      if (res.success) {
        setCopytraders(res.copytraders || []);
      } else {
        toast.error(res.message || "Failed to load copytraders");
      }
    } catch (error) {
      console.error("Fetch copytraders error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load copytraders",
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Delete copytrader
  const deleteCopytrader = async (copytraderId, copytraderName) => {
    if (
      !confirm(
        `Are you sure you want to delete copytrader "${copytraderName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await api.post("/admin/copytrader-delete.php", {
        id: copytraderId,
      });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Copytrader deleted successfully!");
        await fetchCopytraders();
      } else {
        toast.error(res.message || "Failed to delete copytrader");
      }
    } catch (error) {
      console.error("Delete copytrader error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete copytrader",
      );
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    return status === "active" ? "active" : "inactive";
  };

  // Get rank color
  const getRankColor = (rank) => {
    const colors = {
      Excellent: "text-emerald-400",
      Pro: "text-green-400",
      "High achiever": "text-green-400",
      "Top trader": "text-yellow-400",
      Expert: "text-red-400",
    };
    return colors[rank] || "";
  };

  // Load copytraders on mount
  useEffect(() => {
    fetchCopytraders();
  }, [fetchCopytraders]);

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            CopyTraders Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all copytraders, their performance, and statistics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total: {copytraders?.length || 0}
          </span>
          <Link
            href="/admin/copytrader/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New
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
          placeholder="Search copytraders by name or strategy..."
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
                Loading copytraders...
              </p>
            </div>
          ) : copytraders?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Users
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No copytraders found
              </p>
              <Link
                href="/admin/copytrader/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create First Copytrader
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Copytrader
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Stats
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Performance
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Created
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {copytraders.map((ct) => (
                  <tr
                    key={ct.id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    <td className="px-4 py-3">
                      <div className="relative flex items-center gap-3">
                        {ct.photo ? (
                          <img
                            src={ct.photo}
                            alt={ct.name}
                            className="h-9 w-9 min-w-[2.25rem] rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              // Show fallback avatar
                              const parent = e.target.parentElement;
                              const fallback = document.createElement("div");
                              fallback.className =
                                "absolute left-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-sm font-bold text-white";
                              fallback.textContent = ct.name?.charAt(0) || "?";
                              parent.prepend(fallback);
                            }}
                          />
                        ) : (
                          <div className="flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-sm font-bold text-white">
                            <span>{ct.name?.charAt(0) || "?"}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {ct.name}
                          </p>
                          <p className={`text-xs ${getRankColor(ct.rank)}`}>
                            Rank: {ct.rank}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                            Code:{" "}
                            <b className="text-zinc-900 dark:text-white">
                              {ct.copy_code}
                            </b>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <TrendingUp size={14} />
                          <span>Trades: {ct.notrades || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <Users size={14} />
                          <span>Copiers: {ct.nocopiers || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <Trophy size={14} />
                          <span>Wins: {ct.nowins || 0}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <TrendingUp size={14} />
                          <span>Profit: {ct.profit || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                          <BarChart size={14} />
                          <span>Loss: {ct.loss || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <DollarSign size={14} />
                          <span>
                            Commission: {formatCurrency(ct.commision)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          ct.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {ct.status === "active" ? (
                          <>
                            <CheckCircle size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                        <Clock size={14} />
                        <span>{formatDate(ct.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/copytrader/${ct.id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit Copytrader"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>
                        <button
                          onClick={() => deleteCopytrader(ct.id, ct.name)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Copytrader"
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
        {copytraders?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Showing {copytraders.length} of {copytraders.length} copytraders
              </p>
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
