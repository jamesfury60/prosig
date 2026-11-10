"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  PlayCircle,
  RotateCcw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./demo-trade.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function DemoTradePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useMe();
  const userData = user.data?.user;

  const [spots, setSpots] = useState([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(true);
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState(null);
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("1x (No Leverage)");
  const [duration, setDuration] = useState("5 Minutes");

  const [isExecuting, setIsExecuting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  /*
   * ---------------------------------------------------------
   * Currency
   * ---------------------------------------------------------
   */

  const currency =
    typeof userData?.currency === "string" && userData.currency.trim()
      ? userData.currency.trim()
      : "£";

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function formatCurrency(amount, currencySymbol = currency) {
    const value = toNumber(amount);

    const symbol =
      typeof currencySymbol === "string" && currencySymbol.trim()
        ? currencySymbol.trim()
        : "£";

    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /*
   * ---------------------------------------------------------
   * Demo account balance
   * ---------------------------------------------------------
   */

  const availableBalance = toNumber(userData?.demobal);

  /*
   * ---------------------------------------------------------
   * Trade amount
   * ---------------------------------------------------------
   */

  const numericAmount = toNumber(amount);

  const maxRisk = useMemo(() => {
    return numericAmount;
  }, [numericAmount]);

  /*
   * ---------------------------------------------------------
   * Demo trading options
   * ---------------------------------------------------------
   */

  const LEVERAGE_OPTIONS = ["1x (No Leverage)", "2x", "5x", "10x", "20x"];

  const DURATION_OPTIONS = [
    "5 Minutes",
    "15 Minutes",
    "1 Hour",
    "4 Hours",
    "1 Day",
  ];

  /*
   * ---------------------------------------------------------
   * Trading tips
   * ---------------------------------------------------------
   */

  const TIPS = [
    {
      color: "var(--accent)",
      title: "Risk Management",
      body: "Never risk more than you can afford to lose, even in demo trading.",
    },
    {
      color: "var(--success)",
      title: "Start Small",
      body: "Begin with smaller amounts and lower leverage to learn the basics.",
    },
    {
      color: "#f59e0b",
      title: "Leverage Caution",
      body: "Higher leverage amplifies both profits and losses significantly.",
    },
    {
      color: "var(--accent-2)",
      title: "Practice Makes Perfect",
      body: "Use demo trading to test strategies before going live.",
    },
  ];

  /*
   * ---------------------------------------------------------
   * Fetch spots from API
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function fetchSpots() {
      setIsLoadingSpots(true);
      try {
        const response = await api.get("/user/spot_lists.php");
        const res = response?.data;

        if (res?.success) {
          setSpots(res.data || []);
        } else {
          toast.error(res?.message || "Failed to load trading assets");
        }
      } catch (error) {
        console.error("Failed to fetch spots:", error);
        toast.error("Failed to load trading assets");
      } finally {
        setIsLoadingSpots(false);
      }
    }

    fetchSpots();
  }, []);

  /*
   * ---------------------------------------------------------
   * Get asset ID from symbol
   * ---------------------------------------------------------
   */

  function getAssetId(symbol) {
    const spot = spots.find((s) => s.name === symbol || s.title === symbol);
    return spot?.id || 0;
  }

  /*
   * ---------------------------------------------------------
   * Get leverage value
   * ---------------------------------------------------------
   */

  function getLeverageValue(leverageString) {
    const match = leverageString.match(/(\d+)x/);
    return match ? parseInt(match[1]) : 1;
  }

  /*
   * ---------------------------------------------------------
   * Execute demo trade
   * ---------------------------------------------------------
   */

  async function handleExecute(e) {
    e.preventDefault();

    toast.dismiss();

    if (!asset) {
      toast.error("Please select an asset to trade.");
      return;
    }

    if (!direction) {
      toast.error("Please choose Buy or Sell.");
      return;
    }

    if (numericAmount <= 0) {
      toast.error("Please enter an investment amount.");
      return;
    }

    if (numericAmount > availableBalance) {
      toast.error("Amount exceeds your available balance.");
      return;
    }

    setIsExecuting(true);

    try {
      const assetId = getAssetId(asset);
      const orderType = direction === "buy" ? "Buy" : "Sell";
      const leverageValue = getLeverageValue(leverage);

      const response = await api.post("/user/demo_trade.php", {
        asset_id: assetId,
        order_type: orderType,
        amount: numericAmount,
        leverage: leverageValue,
        expire: duration,
      });

      const res = response?.data;

      if (res?.success) {
        toast.success(res.message || "Demo trade executed successfully!");

        // Refresh user balance after trade
        await queryClient.invalidateQueries({
          queryKey: ["session"],
        });

        // Refresh activities
        await queryClient.invalidateQueries({
          queryKey: ["activities"],
        });

        // Redirect to history after short delay
        setTimeout(() => {
          router.push("/dashboard/demo_history");
        }, 1500);
      } else {
        toast.error(res?.message || "Failed to execute demo trade");
      }
    } catch (error) {
      console.error("Demo trade failed:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsExecuting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * Open reset confirmation modal
   * ---------------------------------------------------------
   */

  function handleOpenResetModal() {
    if (isResetting) return;
    setShowResetModal(true);
  }

  /*
   * ---------------------------------------------------------
   * Close reset confirmation modal
   * ---------------------------------------------------------
   */

  function handleCloseResetModal() {
    setShowResetModal(false);
  }

  /*
   * ---------------------------------------------------------
   * RESET DEMO ACCOUNT
   * ---------------------------------------------------------
   */

  async function handleConfirmReset() {
    setShowResetModal(false);
    setIsResetting(true);

    try {
      const response = await api.post("/user/demo_reset.php");

      const res = response?.data;

      if (!res?.success) {
        throw new Error(res?.message || "Failed to reset demo account.");
      }

      // Refresh logged-in user data
      await queryClient.invalidateQueries({
        queryKey: ["session"],
      });

      // Refresh activities/notifications
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });

      // Clear the current trade form
      setAsset("");
      setDirection(null);
      setAmount("");
      setLeverage("1x (No Leverage)");
      setDuration("5 Minutes");

      // Show the actual balance returned by PHP
      toast.success(
        `Demo account reset to ${
          res?.data?.formatted_balance ||
          formatCurrency(res?.data?.balance || 0)
        }`,
      );
    } catch (error) {
      console.error("Demo reset failed:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * Handle overlay click to close modal
   * ---------------------------------------------------------
   */

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleCloseResetModal();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* =====================================================
            MAIN COLUMN
        ====================================================== */}

        <div className={styles.mainCol}>
          <div className={styles.mainHeader}>
            <div>
              <h1 className={styles.title}>Place Demo Trade</h1>

              <p className={styles.subtitle}>
                Select an asset and configure your virtual trade
              </p>
            </div>

            <span className={styles.virtualPill}>
              <ShieldCheck size={14} />
              Virtual Money
            </span>
          </div>

          <form className={styles.form} onSubmit={handleExecute}>
            {/* =================================================
                ASSET
            ================================================== */}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="asset">
                Select Asset <span className={styles.required}>*</span>
              </label>

              <select
                id="asset"
                className={styles.select}
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                disabled={isLoadingSpots}
              >
                <option value="">
                  {isLoadingSpots
                    ? "Loading assets..."
                    : "Choose an asset to trade..."}
                </option>

                {spots.map((spot) => (
                  <option key={spot.id} value={spot.name}>
                    {spot.name} - {spot.title} ({spot.type})
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                DIRECTION + AMOUNT
            ================================================== */}

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Trade Direction <span className={styles.required}>*</span>
                </label>

                <div className={styles.directionRow}>
                  <button
                    type="button"
                    className={`${styles.directionCard} ${
                      direction === "buy" ? styles.directionBuyActive : ""
                    }`}
                    onClick={() => setDirection("buy")}
                  >
                    <span className={styles.directionIconBuy}>
                      <TrendingUp size={18} />
                    </span>

                    <span className={styles.directionLabel}>BUY</span>

                    <span className={styles.directionHint}>Price goes up</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.directionCard} ${
                      direction === "sell" ? styles.directionSellActive : ""
                    }`}
                    onClick={() => setDirection("sell")}
                  >
                    <span className={styles.directionIconSell}>
                      <TrendingDown size={18} />
                    </span>

                    <span className={styles.directionLabel}>SELL</span>

                    <span className={styles.directionHint}>
                      Price goes down
                    </span>
                  </button>
                </div>
              </div>

              {/* AMOUNT */}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="amount">
                  Investment Amount <span className={styles.required}>*</span>
                </label>

                <div className={styles.amountWrapper}>
                  <span className={styles.amountPrefix}>{currency}</span>

                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="any"
                    className={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <p className={styles.hint}>
                  Max: {formatCurrency(availableBalance)}
                </p>
              </div>
            </div>

            {/* =================================================
                LEVERAGE + DURATION
            ================================================== */}

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="leverage">
                  Leverage <span className={styles.required}>*</span>
                </label>

                <select
                  id="leverage"
                  className={styles.select}
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                >
                  {LEVERAGE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="duration">
                  Trade Duration <span className={styles.required}>*</span>
                </label>

                <select
                  id="duration"
                  className={styles.select}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  {DURATION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className={styles.leverageHint}>
              Higher leverage = Higher potential profit/loss
            </p>

            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className={styles.summaryBox}>
              <h3 className={styles.summaryTitle}>Trade Summary</h3>

              <div className={styles.summaryGrid}>
                <div>
                  <span className={styles.summaryLabel}>Asset:</span>

                  <span className={styles.summaryValue}>{asset || "-"}</span>
                </div>

                <div>
                  <span className={styles.summaryLabel}>Amount:</span>

                  <span className={styles.summaryValue}>
                    {formatCurrency(numericAmount)}
                  </span>
                </div>

                <div>
                  <span className={styles.summaryLabel}>Leverage:</span>

                  <span className={styles.summaryValue}>
                    {leverage.split(" ")[0]}
                  </span>
                </div>

                <div>
                  <span className={styles.summaryLabel}>Max Risk:</span>

                  <span className={styles.summaryValueRisk}>
                    {formatCurrency(maxRisk)}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                EXECUTE
            ================================================== */}

            <button
              type="submit"
              className={styles.executeBtn}
              disabled={isExecuting || isLoadingSpots}
            >
              <PlayCircle size={18} />

              <span>{isExecuting ? "Executing..." : "Execute Demo Trade"}</span>
            </button>
          </form>
        </div>

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className={styles.sidebar}>
          {/* =================================================
              TIPS
          ================================================== */}

          <div className={styles.sidebarBlock}>
            <h3 className={styles.sidebarTitle}>Trading Tips</h3>

            <div className={styles.tipsList}>
              {TIPS.map((tip) => (
                <div key={tip.title} className={styles.tipItem}>
                  <span
                    className={styles.tipDot}
                    style={{
                      background: tip.color,
                    }}
                  />

                  <div>
                    <p className={styles.tipTitle}>{tip.title}</p>

                    <p className={styles.tipBody}>{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              DEMO ACCOUNT
          ================================================== */}

          <div className={styles.sidebarBlock}>
            <h3 className={styles.sidebarTitle}>Demo Account</h3>

            <div className={styles.accountRows}>
              <div className={styles.accountRow}>
                <span>Available Balance</span>

                <span className={styles.accountValue}>
                  {formatCurrency(availableBalance)}
                </span>
              </div>

              <div className={styles.accountRow}>
                <span>Currency</span>

                <span className={styles.accountValue}>{currency}</span>
              </div>

              <div className={styles.accountRow}>
                <span>Trading Mode</span>

                <span className={styles.demoBadge}>Demo</span>
              </div>
            </div>

            {/* =================================================
                RESET BUTTON WITH CONFIRMATION
            ================================================== */}

            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleOpenResetModal}
              disabled={isResetting}
            >
              <RotateCcw size={16} className={isResetting ? styles.spin : ""} />

              <span>{isResetting ? "Resetting..." : "Reset Demo Account"}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* =====================================================
          SIMPLE RESET CONFIRMATION MODAL
      ====================================================== */}

      {showResetModal && (
        <div
          className={styles.modalOverlay}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reset Demo Account</h3>
              <button
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
