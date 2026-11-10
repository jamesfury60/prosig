"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import "./dashboard.global.css";
import styles from "./dashboard.module.css";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/lib/auth";

// Import components
import AssetsSection from "./AssetsSection";
import RecentActivity from "./RecentActivity";
import MarketNews from "./MarketNews";
import Watchlist from "./Watchlist";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(amount, currency = "$") {
  const numericAmount = toNumber(amount);
  const symbol =
    typeof currency === "string" && currency.trim() ? currency.trim() : "$";
  return `${symbol}${numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function splitCurrency(amount, currency = "$") {
  const numericAmount = toNumber(amount);
  const symbol =
    typeof currency === "string" && currency.trim() ? currency.trim() : "$";
  const formatted = numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, cents] = formatted.split(".");
  return { symbol, amount: whole, cents: cents || "00" };
}

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;

  // -------------------------------------------------------------------
  // Wallet deck
  // -------------------------------------------------------------------

  const [activeWalletIndex, setActiveWalletIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const startXRef = useRef(0);

  // -------------------------------------------------------------------
  // Portfolio chart
  // -------------------------------------------------------------------

  const [activeRange, setActiveRange] = useState("1D");
  const pathRef = useRef(null);

  const CHART_RANGES = ["1D", "1W", "1M", "1Y"];
  const CHART_RANGE_DATA = {
    "1D": "M4 70 L40 55 L76 62 L112 40 L148 48 L184 22 L220 34 L256 18 L292 30 L328 10",
    "1W": "M4 50 L40 60 L76 45 L112 58 L148 38 L184 44 L220 26 L256 40 L292 24 L328 30",
    "1M": "M4 30 L40 42 L76 28 L112 50 L148 34 L184 55 L220 40 L256 62 L292 45 L328 58",
    "1Y": "M4 62 L40 44 L76 50 L112 24 L148 36 L184 20 L220 32 L256 14 L292 26 L328 8",
  };
  const currentPath = CHART_RANGE_DATA[activeRange] ?? CHART_RANGE_DATA["1D"];

  // -------------------------------------------------------------------
  // Overall balances API
  // -------------------------------------------------------------------

  const {
    data: balanceResponse,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    error: balanceError,
    refetch: refetchBalances,
    isFetching: isBalanceFetching,
  } = useQuery({
    queryKey: ["overall-balances"],
    queryFn: async () => {
      const response = await api.get("/user/overall-balances.php");
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load overall balances.",
        );
      }
      return response.data;
    },
    staleTime: 15000,
    refetchInterval: 90000,
  });

  // -------------------------------------------------------------------
  // Normalize balance response
  // -------------------------------------------------------------------

  const balances = useMemo(() => {
    const apiBalances = balanceResponse?.data;
    return {
      total_value: toNumber(apiBalances?.total_value),
      available_value: toNumber(apiBalances?.available_value),
      on_order_value: toNumber(apiBalances?.on_order_value),
      staked_value: toNumber(apiBalances?.staked_value),
      total_coins: toNumber(apiBalances?.total_coins),
    };
  }, [balanceResponse]);

  const accountType =
    balanceResponse?.account_type ?? userData?.account_type ?? "";
  const currency = userData?.currency || balanceResponse?.currency || "$";

  // -------------------------------------------------------------------
  // Wallet cards
  // -------------------------------------------------------------------

  function calculateChangePercent(current, previous) {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;
    if (previousValue === 0) {
      return currentValue > 0 ? "+100%" : "0%";
    }
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  }

  const WALLETS = useMemo(
    () => [
      {
        label: "Total Balance",
        balance: balances.total_value,
        changeValue: `~${formatCurrency(balances.total_value, currency)}`,
        changePercent: calculateChangePercent(
          balances.total_value,
          balances.previous_total_value,
        ),
        isPositive: true,
        cardBg:
          "linear-gradient(135deg, #08150f 0%, #0f2a1b 50%, #052e16 100%)",
        accentGlow: "rgba(34, 197, 94, 0.25)",
        tag: "Main",
      },
      {
        label: "Available",
        balance: balances.available_value,
        changeValue: `~${formatCurrency(balances.available_value, currency)}`,
        changePercent: calculateChangePercent(
          balances.available_value,
          balances.previous_available_value,
        ),
        isPositive: true,
        cardBg:
          "linear-gradient(135deg, #052e16 0%, #0b3d24 50%, #041c10 100%)",
        accentGlow: "rgba(20, 241, 149, 0.25)",
        tag: "Ready",
      },
      {
        label: "Profit",
        balance: toNumber(userData?.profit),
        changeValue: `~${formatCurrency(userData?.profit, currency)}`,
        changePercent: "0%",
        isPositive: true,
        cardBg:
          "linear-gradient(135deg, #052e16 0%, #0b3d24 50%, #04160d 100%)",
        accentGlow: "rgba(74, 222, 128, 0.25)",
        tag: "Earnings",
      },
      {
        label: "Deposit",
        balance: toNumber(userData?.deposit),
        changeValue: `~${formatCurrency(userData?.deposit, currency)}`,
        changePercent: "0%",
        isPositive: true,
        cardBg:
          "linear-gradient(135deg, #2b1d03 0%, #4a3307 50%, #1c1202 100%)",
        accentGlow: "rgba(245, 158, 11, 0.25)",
        tag: "Vault",
      },
      {
        label: "Payout",
        balance: toNumber(userData?.withdrawal),
        changeValue: `~${formatCurrency(userData?.withdrawal, currency)}`,
        changePercent: "0%",
        isPositive: false,
        cardBg:
          "linear-gradient(135deg, #310a11 0%, #52131e 50%, #1f0308 100%)",
        accentGlow: "rgba(244, 63, 94, 0.25)",
        tag: "Pending",
      },
      {
        label: "Bonus Balance",
        balance: toNumber(userData?.bonus),
        changeValue: `~${formatCurrency(userData?.bonus, currency)}`,
        changePercent: "5%",
        isPositive: true,
        cardBg:
          "linear-gradient(135deg, #092e1e 0%, #0f4d33 50%, #041d13 100%)",
        accentGlow: "rgba(16, 185, 129, 0.25)",
        tag: "Reward",
      },
    ],
    [
      balances,
      currency,
      userData?.profit,
      userData?.deposit,
      userData?.withdrawal,
      userData?.bonus,
    ],
  );

  useEffect(() => {
    if (activeWalletIndex >= WALLETS.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveWalletIndex(0);
    }
  }, [activeWalletIndex, WALLETS.length]);

  const activeWallet = WALLETS[activeWalletIndex] ?? WALLETS[0];
  const activeWalletFormatted = splitCurrency(
    activeWallet?.balance ?? 0,
    currency,
  );

  // -------------------------------------------------------------------
  // Chart animation
  // -------------------------------------------------------------------

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const length = pathEl.getTotalLength();
    pathEl.style.transition = "none";
    pathEl.style.strokeDasharray = `${length}`;
    pathEl.style.strokeDashoffset = `${length}`;
    pathEl.getBoundingClientRect();
    pathEl.style.transition = "stroke-dashoffset 0.7s ease";
    pathEl.style.strokeDashoffset = "0";
  }, [currentPath]);

  // -------------------------------------------------------------------
  // Wallet swipe
  // -------------------------------------------------------------------

  function handleTouchStart(e) {
    startXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragOffset(currentX - startXRef.current);
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    const threshold = 50;
    if (dragOffset < -threshold && activeWalletIndex < WALLETS.length - 1) {
      setActiveWalletIndex((index) => index + 1);
    } else if (dragOffset > threshold && activeWalletIndex > 0) {
      setActiveWalletIndex((index) => index - 1);
    }
    setDragOffset(0);
    setIsDragging(false);
  }

  // -------------------------------------------------------------------
  // Quick actions
  // -------------------------------------------------------------------

  function goSend() {
    router.push("/dashboard/transfer");
  }

  function goSwap() {
    router.push("/dashboard/swap");
  }

  async function deposit() {
    router.push("/dashboard/deposit/1");
  }

  async function DemoAccount() {
    router.push("/dashboard/demo_dash");
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className={styles["dashboard-page"]}>
      {/* Demo Account Header Banner */}
      <div
        className={cx(
          styles["demo-banner"],
          DemoAccount && styles["active-demo"],
        )}
      >
        <div className={styles["demo-info"]}>
          <div className={styles["demo-status"]}>
            <span className={cx(styles["status-badge"], styles.live)}>
              <span className={styles["pulse-dot"]} />
              Demo Account Active
            </span>
          </div>
          <div className={styles["demo-balance-group"]}>
            <span className={styles["demo-balance-label"]}>Demo Balance</span>
            <span className={styles["demo-balance-amount"]}>
              {hideBalance
                ? "••••"
                : formatCurrency(userData?.demobal, currency)}
            </span>
          </div>
        </div>
        <button className={styles["btn-demo-toggle"]} onClick={DemoAccount}>
          Switch to Demo Trading
        </button>
      </div>
      {/* Top Grid */}
      <div className={styles["top-grid"]}>
        {/* Wallet Deck */}
        <div
          className={styles["deck-container"]}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Swipeable wallet balances"
        >
          <div className={styles["story-pagination"]}>
            {WALLETS.map((wallet, index) => (
              <button
                key={wallet.label}
                className={styles["story-segment"]}
                onClick={() => setActiveWalletIndex(index)}
                aria-label={`Go to ${wallet.label}`}
              >
                <div
                  className={styles["story-progress"]}
                  style={{
                    width: index <= activeWalletIndex ? "100%" : "0%",
                    opacity:
                      index === activeWalletIndex
                        ? 1
                        : index < activeWalletIndex
                          ? 0.7
                          : 0.3,
                  }}
                />
              </button>
            ))}
          </div>

          <div className={styles["cards-stack"]}>
            {WALLETS.map((wallet, index) => {
              const offset = index - activeWalletIndex;
              const isTop = index === activeWalletIndex;
              if (offset < 0 || offset > 2) return null;

              return (
                <div
                  key={wallet.label}
                  className={styles["stacked-card"]}
                  style={{
                    background: wallet.cardBg,
                    boxShadow: `0 16px 32px -8px ${wallet.accentGlow}, 0 4px 12px rgba(0,0,0,0.5)`,
                    transform: `
                      translateX(${isTop ? dragOffset : 0}px)
                      translateY(${offset * 12}px)
                      scale(${1 - offset * 0.05})
                      rotate(${isTop ? dragOffset * 0.03 : offset * -1.5}deg)
                    `,
                    zIndex: WALLETS.length - index,
                    opacity: 1 - offset * 0.2,
                    transition:
                      isDragging && isTop
                        ? "none"
                        : "all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  <div className={styles["card-inner-content"]}>
                    <div className={styles["card-header"]}>
                      <div className={styles["wallet-badge"]}>
                        <span
                          className={styles["badge-dot"]}
                          style={{ background: wallet.accentGlow }}
                        />
                        <span className={styles["badge-text"]}>
                          {wallet.tag}
                        </span>
                      </div>
                      <button
                        className={styles["eye-btn"]}
                        onClick={(event) => {
                          event.stopPropagation();
                          setHideBalance((previous) => !previous);
                        }}
                        aria-label="Toggle balance visibility"
                      >
                        {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className={styles["card-body"]}>
                      <span className={styles["card-label-text"]}>
                        {wallet.label}
                      </span>
                      <div className={styles["balance-display"]}>
                        <span className={styles["currency-symbol"]}>
                          {hideBalance ? "" : currency}
                        </span>
                        <span className={styles["balance-main"]}>
                          {hideBalance
                            ? "••••"
                            : toNumber(wallet.balance).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                        </span>
                      </div>
                    </div>

                    <div className={styles["card-footer"]}>
                      <div
                        className={cx(
                          styles["change-pill"],
                          !wallet.isPositive && styles.negative,
                        )}
                      >
                        <span>{hideBalance ? "••••" : wallet.changeValue}</span>
                        <span className={styles["change-percent"]}>
                          {hideBalance ? "" : `(${wallet.changePercent})`}
                        </span>
                      </div>
                      <span className={styles["swipe-hint"]}>Swipe next →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className={styles["chart-wrapper"]}>
          <div className={styles["chart-panel"]}>
            <div className={styles["chart-header"]}>
              <div>
                <p className={styles.eyebrow}>Portfolio</p>
                <div className={styles["balance-row"]}>
                  <span className={styles.balance}>
                    {hideBalance
                      ? "••••"
                      : `${activeWalletFormatted.symbol}${activeWalletFormatted.amount}`}
                    {!hideBalance && (
                      <span className={styles.cents}>
                        .{activeWalletFormatted.cents}
                      </span>
                    )}
                  </span>
                  <span
                    className={cx(
                      styles.change,
                      activeWallet.isPositive
                        ? styles.positive
                        : styles.negative,
                    )}
                  >
                    {hideBalance
                      ? "••••"
                      : `${activeWallet.changeValue} (${activeWallet.changePercent})`}
                  </span>
                </div>
              </div>

              <div className={styles["range-toggle"]}>
                {CHART_RANGES.map((range) => (
                  <button
                    key={range}
                    className={cx(
                      styles["range-pill"],
                      range === activeRange && styles.active,
                    )}
                    onClick={() => setActiveRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles["chart-area"]}>
              <svg
                viewBox="0 0 332 80"
                preserveAspectRatio="none"
                className={styles["chart-svg"]}
              >
                <line
                  x1="0"
                  y1="20"
                  x2="332"
                  y2="20"
                  className={styles["grid-line"]}
                />
                <line
                  x1="0"
                  y1="50"
                  x2="332"
                  y2="50"
                  className={styles["grid-line"]}
                />
                <path
                  ref={pathRef}
                  d={currentPath}
                  className={styles["chart-line"]}
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Balance Loading/Error Indicator */}
      {isBalanceError && (
        <div
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            color: "#ff6b81",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{balanceError?.message || "Could not load balances."}</span>
          <button
            onClick={() => refetchBalances()}
            style={{
              border: 0,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
        </div>
      )}
      {isBalanceFetching && !isBalanceLoading && (
        <div style={{ fontSize: "11px", opacity: 0.45, marginBottom: "8px" }}>
          Updating balances...
        </div>
      )}
      {/* Action Bar & Key Metrics */}
      <div className={styles["middle-grid"]}>
        <div className={styles["quick-actions"]}>
          <button
            className={cx(styles["btn-action"], styles.primary)}
            onClick={goSend}
          >
            <ArrowUpRight size={18} />
            <span>Send</span>
          </button>
          <button className={styles["btn-action"]} onClick={deposit}>
            <ArrowDownLeft size={18} />
            <span>Deposit</span>
          </button>
          <button className={styles["btn-action"]} onClick={goSwap}>
            <RefreshCw size={18} />
            <span>Swap</span>
          </button>
        </div>

        <div className={styles["metrics-row"]}>
          <div className={styles["metric-card"]}>
            <div className={styles["metric-icon"]}>
              <Wallet size={18} />
            </div>
            <div className={styles["metric-info"]}>
              <span className={styles.label}>Available</span>
              <span className={styles.value}>
                {hideBalance
                  ? "••••"
                  : formatCurrency(balances.available_value, currency)}
              </span>
            </div>
          </div>

          <div className={styles["metric-card"]}>
            <div className={styles["metric-icon"]}>
              <ShieldCheck size={18} />
            </div>
            <div className={styles["metric-info"]}>
              <span className={styles.label}>Offshore</span>
              <span className={styles.value}>
                {hideBalance
                  ? "••••"
                  : formatCurrency(userData?.offbal, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Grid - Assets + Recent Activity */}
      <div className={styles["bottom-grid"]}>
        <AssetsSection />
        <RecentActivity />
      </div>
      {/* Watchlist / Markets */}
      <Watchlist />

      {/* Market News */}
      <MarketNews />
    </div>
  );
}
