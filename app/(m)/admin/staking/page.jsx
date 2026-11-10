"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Coins,
  Clock,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function StakingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Extract fetch function so both useEffect and deletePlan can call it safely
  const fetchPlans = async (query = searchQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) {
        params.append("search", query);
      }

      const url = `/admin/staking-list.php${params.toString() ? `?${params}` : ""}`;
      console.log("Fetching staking plans from:", url);

      const response = await api.get(url);
      const res = response.data;

      if (res.success) {
        setPlans(res.plans || []);
      } else {
        const errorMsg = res.message || "Failed to load staking plans";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Fetch staking plans error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load staking plans";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch on initial render or when searchQuery changes
  useEffect(() => {
    fetchPlans(searchQuery);
  }, [searchQuery]);

  // Delete staking plan
  const deletePlan = async (planId, planTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete staking plan "${planTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await api.post("/admin/staking-delete.php", {
        id: planId,
      });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Staking plan deleted successfully!");
        await fetchPlans(); // Correctly triggers refetch now
      } else {
        toast.error(res.message || "Failed to delete staking plan");
      }
    } catch (err) {
      console.error("Delete staking plan error:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete staking plan",
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

  // Format amount
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
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

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            Staking Plans Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all staking plans, APY rates, and lock periods
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total Plans: {plans?.length || 0}
          </span>
          <Link
            href="/admin/staking/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New Plan
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
          placeholder="Search plans by title or coin..."
          onChange={handleSearch}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-white dark:placeholder:text-[#8b93a7]"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-red-500 bg-white p-8 text-center dark:bg-[#12161f]">
          <XCircle size={32} className="text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => fetchPlans()}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Loading staking plans...
              </p>
            </div>
          ) : plans?.length === 0 && !error ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Coins
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No staking plans found
              </p>
              <Link
                href="/admin/staking/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create First Plan
              </Link>
            </div>
          ) : plans?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Plan Details
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Coin & APY
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Investment Range
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Lock Period
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
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-lg text-white ${
                            plan.type === "Locked"
                              ? "bg-gradient-to-br from-green-600 to-green-700"
                              : "bg-gradient-to-br from-green-600 to-green-700"
                          }`}
                        >
                          {plan.type === "Locked" ? (
                            <Lock size={18} />
                          ) : (
                            <Unlock size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {plan.title}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              plan.type === "Locked"
                                ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                                : "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                            }`}
                          >
                            {plan.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-yellow-500 dark:text-yellow-400">
                          {plan.coin}
                        </span>
                        <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                          {plan.apy}% APY
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-sm text-zinc-500 dark:text-[#8b93a7]">
                        <span>Min: {formatAmount(plan.minimum_amount)}</span>
                        <span>
                          Max:{" "}
                          {plan.maximum_amount
                            ? formatAmount(plan.maximum_amount)
                            : "Unlimited"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-[#8b93a7]">
                        <Clock size={14} />
                        <span>{plan.lock_period} Days</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          plan.status === "true"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {plan.status === "true" ? (
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
                        <Calendar size={14} />
                        <span>{formatDate(plan.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/staking/${plan.id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit Plan"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>
                        <button
                          onClick={() => deletePlan(plan.id, plan.title)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Plan"
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
          ) : null}
        </div>

        {/* Table Footer */}
        {plans?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Showing {plans.length} of {plans.length} staking plans
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
