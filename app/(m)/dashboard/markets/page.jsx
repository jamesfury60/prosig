"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import styles from "./markets.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

// Categories mapping
const CATEGORIES = [
  { id: "all", label: "All Markets", icon: "🌐" },
  { id: "crypto", label: "Cryptocurrency", icon: "₿" },
  { id: "stock", label: "Stock", icon: "📈" },
  { id: "forex", label: "Forex", icon: "💱" },
  { id: "commodity", label: "Commodity", icon: "🏆" },
  { id: "bond", label: "Bond", icon: "💵" },
];

const CATEGORY_ICON_COLOR = {
  crypto: "#f59e0b",
  stock: "#22c55e",
  forex: "#10b981",
  commodity: "#eab308",
  bond: "#64748b",
};

function formatPrice(value) {
  if (!value && value !== 0) return "$0.00";
  if (value === 0) return "$0.000000";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 4 : 2,
  })}`;
}

function formatVolume(value) {
  if (!value || value === 0) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value}`;
}

export default function MarketsPage() {
  const router = useRouter();
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch markets from API
  const fetchMarkets = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") {
        params.append("type", activeCategory);
      }
      params.append("limit", "100");

      const response = await api.get(`/user/markets_list.php?${params}`);
      const res = response.data;

      if (res.success) {
        setMarkets(res.data || []);
      } else {
        throw new Error(res.message || "Failed to load markets");
      }
    } catch (err) {
      console.error("Failed to fetch markets:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load markets",
      );
      toast.error("Failed to load markets");
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  // Load markets on mount and when category changes
  useEffect(() => {
    fetchMarkets();
  }, [activeCategory]);

  // Get category counts
  const counts = useMemo(() => {
    const map = { all: markets.length };
    for (const inst of markets) {
      map[inst.category] = (map[inst.category] ?? 0) + 1;
    }
    return map;
  }, [markets]);

  // Filter markets by category
  const visibleInstruments = useMemo(
    () =>
      activeCategory === "all"
        ? markets
        : markets.filter((inst) => inst.category === activeCategory),
    [markets, activeCategory],
  );

  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);

  // Format currency with user's symbol
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Trading Markets</h1>
            <p className={styles.subtitle}>
              Choose from thousands of trading instruments across multiple asset
              classes
            </p>
          </div>
        </div>
        <div className={styles.skeletonContainer}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonCell} />
              <div className={styles.skeletonCell} />
              <div className={styles.skeletonCell} />
              <div className={styles.skeletonCell} />
              <div className={styles.skeletonCell} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Trading Markets</h1>
            <p className={styles.subtitle}>
              Choose from thousands of trading instruments across multiple asset
              classes
            </p>
          </div>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Failed to Load Markets</h3>
          <p>{error}</p>
          <button onClick={fetchMarkets} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Trading Markets</h1>
          <p className={styles.subtitle}>
            Choose from thousands of trading instruments across multiple asset
            classes
          </p>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <span className={styles.statValue}>{markets.length}</span>
            <span className={styles.statLabel}>Instruments</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statValue}>24/7</span>
            <span className={styles.statLabel}>Trading</span>
          </div>
        </div>
      </div>

      <div className={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.categoryPill} ${
              activeCategory === cat.id ? styles.categoryPillActive : ""
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className={styles.categoryEmoji}>{cat.icon}</span>
            {cat.label}
            <span className={styles.categoryCount}>
              ({counts[cat.id] || 0})
            </span>
          </button>
        ))}
      </div>

      <div className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <span className={styles.tableHeaderIcon}>
            {activeCategoryMeta?.icon}
          </span>
          <h3 className={styles.tableTitle}>{activeCategoryMeta?.label}</h3>
          <span className={styles.countPill}>
            {visibleInstruments.length} instruments
          </span>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Volume</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstruments.map((inst) => {
                const isUp = inst.changePct > 0;
                const isDown = inst.changePct < 0;
                const color = CATEGORY_ICON_COLOR[inst.category] || "#64748b";

                return (
                  <tr key={inst.id}>
                    <td>
                      <div className={styles.assetCell}>
                        {inst.photo ? (
                          <img
                            src={inst.photo}
                            alt={inst.symbol}
                            className={styles.assetImage}
                          />
                        ) : (
                          <span
                            className={styles.assetIcon}
                            style={{ background: `${color}22`, color }}
                          >
                            {inst.symbol?.slice(0, 2) || "??"}
                          </span>
                        )}
                        <div className={styles.assetMeta}>
                          <span className={styles.assetSymbol}>
                            {inst.symbol}
                          </span>
                          <span className={styles.assetName}>{inst.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.priceCell}>
                      {formatPrice(inst.price)}
                    </td>
                    <td>
                      <span
                        className={
                          isUp
                            ? styles.changeUp
                            : isDown
                              ? styles.changeDown
                              : styles.changeFlat
                        }
                      >
                        {isUp ? (
                          <TrendingUp size={14} />
                        ) : isDown ? (
                          <TrendingDown size={14} />
                        ) : (
                          <Minus size={14} />
                        )}
                        {isUp ? "+" : ""}
                        {inst.changePct?.toFixed(2) || "0.00"}%
                      </span>
                      <br />
                      <span className={styles.changeVal}>
                        {inst.changeVal >= 0 ? "+" : ""}$
                        {Math.abs(inst.changeVal || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className={styles.volumeCell}>
                      {formatVolume(inst.volume)}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/trading/${inst.id}`}
                        className={styles.tradeBtn}
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compact mobile list */}
        <div className={styles.mobileList}>
          {visibleInstruments.map((inst) => {
            const color = CATEGORY_ICON_COLOR[inst.category] || "#64748b";
            return (
              <div key={inst.id} className={styles.mobileRow}>
                {inst.photo ? (
                  <img
                    src={inst.photo}
                    alt={inst.symbol}
                    className={styles.mobileAssetImage}
                  />
                ) : (
                  <span
                    className={styles.assetIcon}
                    style={{ background: `${color}22`, color }}
                  >
                    {inst.symbol?.slice(0, 2) || "??"}
                  </span>
                )}
                <div className={styles.mobileMeta}>
                  <span className={styles.assetSymbol}>{inst.symbol}</span>
                  <span className={styles.assetName}>{inst.name}</span>
                </div>
                <Link
                  href={`/dashboard/trading/${inst.id}`}
                  className={styles.mobileTradeBtn}
                >
                  Trade
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
