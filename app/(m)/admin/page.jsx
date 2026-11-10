"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Coins,
  TrendingUp,
  Layers,
  BarChart,
  Newspaper,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    users: 0,
    coins: 0,
    copytrader: 0,
    staking_plans: 0,
    tradingplans: 0,
    news: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------
  // Format numbers
  // ------------------------------------------
  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString();
  };

  // ------------------------------------------
  // Fetch statistics
  // ------------------------------------------
  const fetchStats = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/admin/admin-stats.php");
      const res = response.data;

      if (res.success) {
        setStats((currentStats) => ({
          ...currentStats,
          ...(res.stats || {}),
        }));
      } else {
        toast.error(res.message || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Fetch stats error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load statistics",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------
  // Load statistics on page load
  // ------------------------------------------
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ------------------------------------------
  // Stat cards
  // ------------------------------------------
  const statItems = [
    {
      title: "Users",
      value: stats.users,
      icon: Users,
      color: "green",
      label: "Total registered users",
    },
    {
      title: "Coins",
      value: stats.coins,
      icon: Coins,
      color: "amber",
      label: "Total coins",
    },
    {
      title: "Copy Traders",
      value: stats.copytrader,
      icon: TrendingUp,
      color: "emerald",
      label: "Total copytraders",
    },
    {
      title: "Staking Plans",
      value: stats.staking_plans,
      icon: Layers,
      color: "lime",
      label: "Total staking plans",
    },
    {
      title: "Trading Plans",
      value: stats.tradingplans,
      icon: BarChart,
      color: "orange",
      label: "Total trading plans",
    },
    {
      title: "News",
      value: stats.news,
      icon: Newspaper,
      color: "red",
      label: "Total news articles",
    },
  ];

  // ------------------------------------------
  // Quick actions
  // ------------------------------------------
  const quickActions = [
    {
      href: "/admin/users",
      icon: Users,
      label: "Manage Users",
      color: "green",
    },
    {
      href: "/admin/coins",
      icon: Coins,
      label: "Manage Coins",
      color: "amber",
    },
    {
      href: "/admin/copytrader",
      icon: TrendingUp,
      label: "Manage Copytraders",
      color: "emerald",
    },
    {
      href: "/admin/staking",
      icon: Layers,
      label: "Manage Staking",
      color: "lime",
    },
    {
      href: "/admin/plans",
      icon: BarChart,
      label: "Manage Trading Plans",
      color: "orange",
    },
    {
      href: "/admin/news",
      icon: Newspaper,
      label: "Manage News",
      color: "red",
    },
  ];

  // ------------------------------------------
  // Tailwind color classes
  // ------------------------------------------
  const colorClasses = {
    green: {
      icon: "text-green-500 dark:text-green-400",
      hover:
        "hover:border-green-500 hover:bg-green-50/50 dark:hover:border-green-400 dark:hover:bg-green-950/20",
    },

    amber: {
      icon: "text-amber-500 dark:text-amber-400",
      hover:
        "hover:border-amber-500 hover:bg-amber-50/50 dark:hover:border-amber-400 dark:hover:bg-amber-950/20",
    },

    emerald: {
      icon: "text-emerald-500 dark:text-emerald-400",
      hover:
        "hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/20",
    },

    lime: {
      icon: "text-lime-500 dark:text-lime-400",
      hover:
        "hover:border-lime-500 hover:bg-lime-50/50 dark:hover:border-lime-400 dark:hover:bg-lime-950/20",
    },

    orange: {
      icon: "text-orange-500 dark:text-orange-400",
      hover:
        "hover:border-orange-500 hover:bg-orange-50/50 dark:hover:border-orange-400 dark:hover:bg-orange-950/20",
    },

    red: {
      icon: "text-red-500 dark:text-red-400",
      hover:
        "hover:border-red-500 hover:bg-red-50/50 dark:hover:border-red-400 dark:hover:bg-red-950/20",
    },
  };

  return (
    <div className="p-4 lg:p-6">
      {/* ------------------------------------------
          Header
      ------------------------------------------ */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Real-time statistics and insights for your platform
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />

          {isLoading ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* ------------------------------------------
          Statistics
      ------------------------------------------ */}
      {isLoading ? (
        <div className="mb-8 flex flex-col items-center gap-4 rounded-lg border border-zinc-200 bg-white py-12 dark:border-[#232a3b] dark:bg-[#12161f]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />

          <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
            Loading statistics...
          </p>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            const colors = colorClasses[item.color];

            return (
              <div
                key={item.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#232a3b] dark:bg-[#12161f]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
                    {item.title}
                  </h3>

                  <Icon size={20} className={colors.icon} />
                </div>

                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(item.value)}
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------
          Quick Actions
      ------------------------------------------ */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#232a3b] dark:bg-[#12161f]">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color];

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`
                  flex items-center gap-2 rounded-lg
                  border border-zinc-200 bg-zinc-50
                  px-3 py-2 text-sm font-medium text-zinc-700
                  transition-all duration-200
                  hover:-translate-y-0.5
                  dark:border-[#232a3b]
                  dark:bg-[#1a2035]
                  dark:text-zinc-300
                  ${colors.hover}
                `}
              >
                <Icon size={18} className={colors.icon} />

                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------
          Security Notice
      ------------------------------------------ */}
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
        <Shield size={18} className="shrink-0" />

        <span>
          All data is encrypted and secured. Only authorized personnel have
          access.
        </span>
      </div>
    </div>
  );
}
