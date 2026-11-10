"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  Zap,
  History as HistoryIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./demo-dashboard.module.css";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

export default function DemoDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useMe();
  const userData = user.data?.user;

  const [stats, setStats] = useState({
    total_trades: 0,
    total_pnl: 0,
    active_trades: 0,
  });

  // Controls the initial page loading screen.
  const [pageLoading, setPageLoading] = useState(true);

  const [isResetting, setIsResetting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  /**
   * User currency.
   */
  const currency =
    typeof userData?.currency === "string" && userData.currency.trim()
      ? userData.currency.trim()
      : "£";

  /**
   * Convert value to a number safely.
   */
  function numericAmount(amount) {
    const number = Number(amount);
    return Number.isFinite(number) ? number : 0;
  }

  /**
   * Format currency.
   */
  function formatCurrency(amount, currencySymbol = currency) {
    const value = numericAmount(amount);

    const symbol =
      typeof currencySymbol === "string" && currencySymbol.trim()
        ? currencySymbol.trim()
        : "£";

    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Demo balance.
   */
  const demoBalance = numericAmount(userData?.demobal);

  /**
   * Load dashboard data.
   *
   * We wait for useMe() first.
   * Once the user is available, we fetch the demo statistics.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      // Wait until useMe() has finished loading.
      if (user.isLoading) {
        return;
      }

      // If there is no authenticated user, stop loading.
      if (!userData) {
        if (!cancelled) {
          setPageLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/user/demo_history.php?limit=1");

        if (cancelled) return;

        const res = response.data;

        if (res?.success) {
          setStats(
            res.stats || {
              total_trades: 0,
              total_pnl: 0,
              active_trades: 0,
            },
          );
        } else {
          toast.error(res?.message || "Failed to load demo statistics");

          setStats({
            total_trades: 0,
            total_pnl: 0,
            active_trades: 0,
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load demo dashboard:", error);

        toast.error("Failed to load demo statistics");

        setStats({
          total_trades: 0,
          total_pnl: 0,
          active_trades: 0,
        });
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user.isLoading, userData]);

  /**
   * Refresh demo statistics.
   *
   * Used after resetting the demo account.
   */
  async function fetchStats() {
    try {
      const response = await api.get("/user/demo_history.php?limit=1");
      const res = response.data;

      if (res?.success) {
        setStats(
          res.stats || {
            total_trades: 0,
            total_pnl: 0,
            active_trades: 0,
          },
        );
      } else {
        toast.error(res?.message || "Failed to load stats");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load stats");
    }
  }

  /**
   * Open reset confirmation modal.
   */
  function handleOpenResetModal() {
    if (isResetting) return;

    setShowResetModal(true);
  }

  /**
   * Close reset confirmation modal.
   */
  function handleCloseResetModal() {
    if (isResetting) return;

    setShowResetModal(false);
  }

  /**
   * Reset demo account.
   */
  async function handleConfirmReset() {
    if (isResetting) return;

    setShowResetModal(false);
    setIsResetting(true);

    toast.dismiss();

    try {
      const response = await api.post("/user/demo_reset.php");
      const res = response.data;

      if (!res?.success) {
        throw new Error(res?.message || "Failed to reset demo account.");
      }

      // Refresh user data.
      await queryClient.invalidateQueries({
        queryKey: ["session"],
      });

      // Refresh activities if your app uses them.
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });

      toast.success(
        `Demo account reset to ${
          res.data?.formatted_balance || formatCurrency(100000)
        }`,
      );

      // Refresh demo statistics.
      await fetchStats();
    } catch (err) {
      console.error("Demo reset failed:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  /**
   * Switch to live trading.
   */
  async function handleSwitchToLive() {
    if (isSwitching) return;

    toast.dismiss();
    setIsSwitching(true);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      router.push("/dashboard/markets");
    } catch (err) {
      console.error("Failed to switch to live trading:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not switch to live trading.",
      );

      setIsSwitching(false);
    }
  }

  /**
   * Handle overlay click to close modal.
   */
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleCloseResetModal();
    }
  }

  /**
   * INITIAL PAGE LOADER
   *
   * The complete dashboard stays hidden until:
   *
   * 1. useMe() has finished loading.
   * 2. User data is available.
   * 3. Demo statistics have loaded.
   */
  if (user.isLoading || pageLoading) {
    return <LoadingDiamond />;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Demo Trading Dashboard</h1>

          <p className={styles.subtitle}>
            Practice trading with virtual money - Risk Free!
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => router.push("/dashboard/demo_trade")}
          >
            <Plus size={17} />
            <span>Start Demo Trade</span>
          </button>

          <button
            type="button"
            className={styles.btnMuted}
            onClick={() => router.push("/dashboard/demo_history")}
          >
            <Clock size={17} />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Balance Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroBadges}>
            <span className={styles.liveDot} />

            <span className={styles.heroEyebrow}>DEMO MODE ACTIVE</span>

            <span className={styles.riskFreePill}>RISK FREE</span>
          </div>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.btnSuccess}
              onClick={handleSwitchToLive}
              disabled={isSwitching}
            >
              <TrendingUp size={17} />

              <span>
                {isSwitching ? "Switching..." : "Switch to Live Trading"}
              </span>
            </button>

            <button
              type="button"
              className={styles.btnMuted}
              onClick={handleOpenResetModal}
              disabled={isResetting}
            >
              <RotateCcw size={17} />

              <span>{isResetting ? "Resetting..." : "Reset Account"}</span>
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className={styles.balanceFigure}>
          {formatCurrency(demoBalance)}
        </div>

        <p className={styles.balanceLabel}>Virtual Trading Balance</p>

        <div className={styles.heroTags}>
          <span className={styles.heroTag}>
            <ShieldCheck size={14} />
            Protected Environment
          </span>

          <span className={styles.heroTag}>
            <TrendingUp size={14} />
            Real Market Data
          </span>
        </div>

        <div className={styles.heroDivider} />

        <div className={styles.heroDots}>
          <span className={styles.dotItem}>
            <span className={styles.dotAccent} />
            Unlimited Practice Trades
          </span>

          <span className={styles.dotItem}>
            <span className={styles.dotGreen} />
            No Financial Risk
          </span>

          <span className={styles.dotItem}>
            <span className={styles.dotAccent2} />
            Real-time Market Prices
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {/* Total Trades */}
        <div className={styles.statCard}>
          <div>
            <span className={styles.statValue}>{stats.total_trades}</span>

            <span className={styles.statLabel}>Total Trades</span>
          </div>

          <span
            className={styles.statIcon}
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            <TrendingUp size={18} />
          </span>
        </div>

        {/* Total P&L */}
        <div className={styles.statCard}>
          <div>
            <span
              className={`${styles.statValue} ${
                stats.total_pnl >= 0 ? styles.positive : styles.negative
              }`}
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

        {/* Active Trades */}
        <div className={styles.statCard}>
          <div>
            <span className={styles.statValue}>{stats.active_trades}</span>

            <span className={styles.statLabel}>Active Trades</span>
          </div>

          <span
            className={styles.statIcon}
            style={{
              background: "rgba(249,115,22,0.14)",
              color: "#f97316",
            }}
          >
            <Zap size={18} />
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsPanel}>
        <h3 className={styles.quickActionsTitle}>Quick Actions</h3>

        <div className={styles.quickActionsGrid}>
          <button
            type="button"
            className={styles.qaGreen}
            onClick={() => router.push("/dashboard/demo_trade")}
          >
            <Plus size={17} />
            <span>Demo Trade</span>
          </button>

          <button
            type="button"
            className={styles.qaMuted}
            onClick={() => router.push("/dashboard/demo_history")}
          >
            <HistoryIcon size={17} />
            <span>History</span>
          </button>

          <button
            type="button"
            className={styles.qaGreen}
            onClick={handleSwitchToLive}
            disabled={isSwitching}
          >
            <TrendingUp size={17} />

            <span>{isSwitching ? "Switching..." : "Live Trading"}</span>
          </button>

          <button
            type="button"
            className={styles.qaOrange}
            onClick={handleOpenResetModal}
            disabled={isResetting}
          >
            <RotateCcw size={17} />

            <span>{isResetting ? "Resetting..." : "Reset Account"}</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className={styles.modalOverlay}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-demo-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="reset-demo-title" className={styles.modalTitle}>
                Reset Demo Account
              </h3>

              <button
                type="button"
                onClick={handleCloseResetModal}
                className={styles.modalCloseBtn}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                This action will reset your demo account balance to{" "}
                <strong>{formatCurrency(100000)}</strong>
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={handleCloseResetModal}
                className={styles.modalCancelBtn}
                disabled={isResetting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReset}
                className={styles.modalConfirmBtn}
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
