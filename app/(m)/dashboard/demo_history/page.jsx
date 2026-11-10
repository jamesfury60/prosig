"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, DollarSign as BalanceIcon, X } from "lucide-react";
import toast from "react-hot-toast";

import styles from "./demo-history.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

// Column plan for the skeleton rows — kept in one place so the placeholder
// widths are easy to tweak without hunting through JSX.
const SKELETON_COLUMNS = [
  { width: 64 }, // Asset
  { width: 52, pill: true }, // Type
  { width: 68 }, // Amount
  { width: 36 }, // Leverage
  { width: 60 }, // Entry
  { width: 60 }, // Current
  { width: 70, twoLine: true }, // P&L
  { width: 64, pill: true }, // Status
  { width: 72, twoLine: true }, // Date
  { width: 28, circle: true }, // Actions
];

const SKELETON_ROW_COUNT = 6;

function SkeletonRows({ count = SKELETON_ROW_COUNT }) {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className={styles.skeletonRow}>
          {SKELETON_COLUMNS.map((col, colIndex) => (
            <td key={colIndex}>
              {col.twoLine ? (
                <>
                  <span
                    className={styles.skeletonBar}
                    style={{ width: col.width }}
                  />
                  <span
                    className={styles.skeletonBar}
                    style={{ width: col.width * 0.6, marginTop: 6 }}
                  />
                </>
              ) : col.circle ? (
                <span
                  className={`${styles.skeletonBar} ${styles.skeletonCircle}`}
                />
              ) : (
                <span
                  className={`${styles.skeletonBar} ${
                    col.pill ? styles.skeletonPill : ""
                  }`}
                  style={{ width: col.width }}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function DemoHistoryPage() {
  const router = useRouter();
  const user = useMe();
  const userData = user.data?.user;

  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    total_trades: 0,
    win_rate: 0,
    total_pnl: 0,
    active_trades: 0,
  });
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("$");
  const [isLoading, setIsLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);

  /**
   * Format currency.
   */
  function formatCurrency(amount, currencySymbol = currency) {
    const value = Number(amount) || 0;
    const symbol = currencySymbol || "$";
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Fetch demo history
   */
  async function fetchHistory() {
    setIsLoading(true);

    try {
      const response = await api.get("/user/demo_history.php");
      const res = response.data;

      if (res.success) {
        setTrades(res.data || []);
        setStats(
          res.stats || {
            total_trades: 0,
            win_rate: 0,
            total_pnl: 0,
            active_trades: 0,
          },
        );
        setBalance(res.balance || 0);
        setCurrency(res.currency || "$");
      } else {
        toast.error(res.message || "Failed to load trading history");
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load trading history");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Close a demo trade
   */
  async function handleCloseTrade(tradeId) {
    if (!confirm("Are you sure you want to close this trade?")) {
      return;
    }

    setClosingId(tradeId);

    try {
      const response = await api.post("/user/demo_close.php", {
        trade_id: tradeId,
      });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Trade closed successfully!");
        await fetchHistory();
      } else {
        toast.error(res.message || "Failed to close trade");
      }
    } catch (error) {
      console.error("Failed to close trade:", error);
      toast.error(error.response?.data?.message || "Failed to close trade");
    } finally {
      setClosingId(null);
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Get status badge class
  function getStatusClass(status) {
    if (status === "Active") return styles.statusActive;
    if (status === "Won" || status === "Profit") return styles.statusWon;
    if (status === "Loss") return styles.statusLost;
    if (status === "Closed") return styles.statusClosed;
    return styles.statusOther;
  }

  // Get status display text
  function getStatusDisplay(status) {
    if (status === "Active") return "Active";
    if (status === "Won" || status === "Profit") return "Won";
    if (status === "Loss") return "Lost";
    if (status === "Closed") return "Closed";
    return status || "N/A";
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Format time
  function formatTime(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Demo Trading History</h1>
          <p className={styles.subtitle}>
            Review your past demo trades and track your performance
          </p>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.balanceChip}>
            <BalanceIcon size={15} />
            Balance: {formatCurrency(balance)}
          </span>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => router.push("/dashboard/demo_trade")}
          >
            <Plus size={17} />
            <span>New Trade</span>
          </button>
          <button
            type="button"
            className={styles.btnMuted}
            onClick={() => router.push("/dashboard/demo_dash")}
          >
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {/* <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <span className={styles.statValue}>{stats.total_trades}</span>
            <span className={styles.statLabel}>Total Trades</span>
          </div>
          <span
            className={styles.statIcon}
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <TrendingUp size={18} />
          </span>
        </div>

        <div className={styles.statCard}>
          <div>
            <span className={styles.statValue}>{stats.win_rate}%</span>
            <span className={styles.statLabel}>Win Rate</span>
          </div>
          <span
            className={styles.statIcon}
            style={{
              background: "var(--success-soft)",
              color: "var(--success)",
            }}
          >
            <CheckCircle2 size={18} />
          </span>
        </div>

        <div className={styles.statCard}>
          <div>
            <span
              className={`${styles.statValue} ${stats.total_pnl >= 0 ? styles.positive : styles.negative}`}
            >
              {stats.total_pnl >= 0 ? "+" : ""}
              {formatCurrency(stats.total_pnl)}
            </span>
            <span className={styles.statLabel}>Total P&amp;L</span>
          </div>
          <span
            className={styles.statIcon}
            style={{
              background:
                stats.total_pnl >= 0
                  ? "var(--success-soft)"
                  : "rgba(239,68,68,0.14)",
              color: stats.total_pnl >= 0 ? "var(--success)" : "#ef4444",
            }}
          >
            <DollarSign size={18} />
          </span>
        </div>

        <div className={styles.statCard}>
          <div>
            <span className={styles.statValue}>{stats.active_trades}</span>
            <span className={styles.statLabel}>Active Trades</span>
          </div>
          <span
            className={styles.statIcon}
            style={{ background: "rgba(249,115,22,0.14)", color: "#f97316" }}
          >
            <Zap size={18} />
          </span>
        </div>
      </div> */}

      {/* Trading history table */}
      <div className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Trading History</h3>
          <span className={styles.countPill}>
            {isLoading ? "—" : trades.length} Trades
          </span>
        </div>

        <div className={styles.tableScroll}>
          {!isLoading && trades.length === 0 ? (
            <div
              className={`${styles.emptyState} justify-center mt-5 items-center p-5`}
            >
              <p>No trades found</p>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => router.push("/dashboard/demo_trade")}
              >
                <Plus size={17} />
                <span>Start Your First Trade</span>
              </button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Mdat</th>
                  <th>Leverage</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>P&amp;L</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows />
                ) : (
                  trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className={styles.assetCell}>{trade.asset}</td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${
                            trade.type === "Buy"
                              ? styles.typeBuy
                              : styles.typeSell
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td>{formatCurrency(trade.amount)}</td>
                      <td>{formatCurrency(trade.mdat)}</td>
                      <td>{trade.leverage}x</td>
                      <td>{formatCurrency(trade.entry, "$")}</td>
                      <td>{formatCurrency(trade.current, "$")}</td>
                      <td>
                        <span
                          className={
                            trade.pnl_value >= 0
                              ? styles.pnlPositive
                              : styles.pnlNegative
                          }
                        >
                          {trade.pnl_value >= 0 ? "+" : ""}
                          {formatCurrency(trade.pnl_value)}
                        </span>
                        <br />
                        <span className={styles.pnlPercent}>
                          ({trade.pnl_value >= 0 ? "+" : ""}
                          {trade.pnl_percent.toFixed(2)}%)
                        </span>
                      </td>
                      <td>
                        <span className={getStatusClass(trade.status)}>
                          {getStatusDisplay(trade.status)}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {formatDate(trade.trade_date)}
                        <br />
                        {formatTime(trade.trade_date)}
                      </td>
                      <td className={styles.actionsCell}>
                        {trade.status === "Active" && (
                          <button
                            onClick={() => handleCloseTrade(trade.id)}
                            disabled={closingId === trade.id}
                            className={styles.closeBtn}
                            title="Close Trade"
                          >
                            {closingId === trade.id ? (
                              <span className={styles.spinner} />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        )}
                        {trade.status !== "Active" && (
                          <span className={styles.closedText}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className={styles.footerNote}>
          {isLoading ? "Loading trades..." : `Showing ${trades.length} trades`}
        </p>
      </div>
    </div>
  );
}
