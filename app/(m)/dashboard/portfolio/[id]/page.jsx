"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Bell,
  Search,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "../coin-detail.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function CoinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const coinId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Format currency with user's symbol
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Format number
  const formatNumber = (num, precision = 2) => {
    if (num === 0 || !num) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    if (num < 1000) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Fetch coin details
  const fetchCoinDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/portfolio.php?coin_id=${coinId}`);
      const res = response.data;

      if (res.success) {
        setCoinData(res.data);
      } else {
        throw new Error(res.message || "Failed to load coin details");
      }
    } catch (err) {
      console.error("Failed to fetch coin details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load coin details",
      );
      toast.error("Failed to load coin details");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for this coin
  const fetchTransactions = async () => {
    setTransactionsLoading(true);

    try {
      const response = await api.get(
        `/user/coin-transactions.php?coin_id=${coinId}`,
      );
      const res = response.data;

      if (res.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (coinId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCoinDetails();
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        t.type?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q) ||
        t.coin_name?.toLowerCase().includes(q),
    );
  }, [transactions, query]);

  // Calculate percentages for allocation
  const availablePercentage = useMemo(() => {
    if (!coinData || coinData.total_balance === 0) return 0;
    return (coinData.available_balance / coinData.total_balance) * 100;
  }, [coinData]);

  const onOrderPercentage = useMemo(() => {
    if (!coinData || coinData.total_balance === 0) return 0;
    return (coinData.on_order_balance / coinData.total_balance) * 100;
  }, [coinData]);

  const stakedPercentage = useMemo(() => {
    if (!coinData || coinData.total_balance === 0) return 0;
    return (coinData.staked_balance / coinData.total_balance) * 100;
  }, [coinData]);

  // Navigation handlers
  const goBack = () => {
    router.push("/dashboard");
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonIcon} />
            <div>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonSub} />
            </div>
          </div>
          <div className={styles.skeletonValue}>
            <div className={styles.skeletonAmount} />
            <div className={styles.skeletonSubAmount} />
          </div>
          <div className={styles.skeletonActions}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeletonAction} />
            ))}
          </div>
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonMain} />
            <div className={styles.skeletonSidebar} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !coinData) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Portfolio</h2>
          <p>{error || "Coin not found"}</p>
          <button onClick={goBack} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isUp = coinData.day_change_pct >= 0;

  // Helper to determine transaction sign and color based on method
  const getTransactionDisplay = (tx) => {
    const isCredit = tx.method === "credit";
    const sign = isCredit ? "+" : "-";
    const colorClass = isCredit ? styles.txAmountPos : styles.txAmountNeg;
    return {
      sign,
      colorClass,
      amount: formatCurrency(Math.abs(tx.amount)),
    };
  };

  return (
    <div className={styles.page}>
      {/* Back Button */}

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIdentity}>
          <span className={styles.coinMark}>
            {coinData.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coinData.photo}
                alt={coinData.coin_name}
                className={styles.coinImage}
              />
            ) : (
              <span className={styles.coinInitial}>
                {coinData.coin_name?.charAt(0) || "?"}
              </span>
            )}
          </span>
          <div>
            <div className={styles.coinNameRow}>
              <h1 className={styles.coinSymbol}>
                {coinData.coin_name?.toUpperCase()}
              </h1>
              <span className={styles.coinName}>{coinData.coin_title}</span>
            </div>
            <span className={isUp ? styles.dayChangeUp : styles.dayChangeDown}>
              {isUp ? "▲" : "▼"} {Math.abs(coinData.day_change_pct || 0)}% today
            </span>
          </div>
        </div>

        <div className={styles.heroValue}>
          <span className={styles.portfolioLabel}>Total Portfolio</span>
          <span className={styles.portfolioValue}>
            {formatCurrency(coinData.total_balance)}
          </span>
          <span className={styles.portfolioSub}>
            ≈ {formatNumber(coinData.total_value)}{" "}
            {coinData.coin_name?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Quick actions rail */}
      <div className={styles.actionsRail}>
        <button
          type="button"
          className={styles.actionTile}
          onClick={() => router.push(`/dashboard/deposit/${coinId}`)}
        >
          <span className={styles.actionIconWrap}>
            <ArrowDown size={18} />
          </span>
          <span className={styles.actionLabel}>Deposit</span>
        </button>
        <button
          type="button"
          className={styles.actionTile}
          onClick={() => router.push(`/dashboard/withdraw/${coinId}`)}
        >
          <span className={styles.actionIconWrap}>
            <ArrowUp size={18} />
          </span>
          <span className={styles.actionLabel}>Withdraw</span>
        </button>
        <button
          type="button"
          className={styles.actionTile}
          onClick={() => router.push(`/dashboard/swap`)}
        >
          <span className={styles.actionIconWrap}>
            <ArrowLeftRight size={18} />
          </span>
          <span className={styles.actionLabel}>Exchange</span>
        </button>
        <button
          type="button"
          className={styles.actionTile}
          onClick={() => router.push(`/dashboard/activity`)}
        >
          <span className={styles.actionIconWrap}>
            <Bell size={18} />
          </span>
          <span className={styles.actionLabel}>Alerts</span>
        </button>
      </div>

      <div className={styles.contentGrid}>
        {/* Main column */}
        <div className={styles.mainCol}>
          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <span className={styles.tabMarker} />
              Recent History
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "about" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <span className={styles.tabMarker} />
              About Coin
            </button>
          </div>

          {activeTab === "history" ? (
            <div className={styles.historyPanel}>
              <div className={styles.historyHeader}>
                <div className={styles.searchWrapper}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.timeline}>
                {transactionsLoading ? (
                  <div className={styles.loadingState}>
                    Loading transactions...
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <p className={styles.emptyState}>
                    {query
                      ? "No transactions match your search."
                      : "No transactions found."}
                  </p>
                ) : (
                  filteredTransactions.map((tx) => {
                    const display = getTransactionDisplay(tx);
                    return (
                      <div key={tx.id} className={styles.timelineRow}>
                        <div className={styles.timelineRail}>
                          <span
                            className={styles.timelineDot}
                            style={{
                              background:
                                tx.method === "credit" ? "#22c55e" : "#ef4444",
                            }}
                          />
                          <span className={styles.timelineLine} />
                        </div>
                        <div className={styles.timelineBody}>
                          <div className={styles.timelineTop}>
                            <span className={styles.txType}>{tx.type}</span>
                            <span className={display.colorClass}>
                              {display.sign}
                              {display.amount}
                            </span>
                          </div>
                          <div className={styles.timelineBottom}>
                            <span className={styles.txDate}>
                              {new Date(tx.createdAt).toLocaleString()}
                            </span>
                            <span
                              className={
                                tx.status === "Completed" ||
                                tx.status === "Approved"
                                  ? styles.statusCompleted
                                  : styles.statusPending
                              }
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className={styles.aboutPanel}>
              <p className={styles.aboutDescription}>
                {coinData.deposit_instructions ||
                  "No additional information available for this coin."}
              </p>
              <div className={styles.aboutStats}>
                <div>
                  <span className={styles.statLabel}>Market Cap</span>
                  <span className={styles.statValue}>
                    ${coinData.market_cap || "N/A"}
                  </span>
                </div>
                <div>
                  <span className={styles.statLabel}>Circulating Supply</span>
                  <span className={styles.statValue}>
                    {coinData.circulating_supply || "N/A"}{" "}
                    {coinData.coin_name?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className={styles.statLabel}>Spot Price</span>
                  <span className={styles.statValue}>
                    {formatCurrency(coinData.coin_rate)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarPanel}>
            <h2 className={styles.panelTitle}>Asset Summary</h2>
            <div className={styles.statList}>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>Available</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textGreen}>
                    {formatCurrency(coinData.available_balance)}
                  </span>
                  <span className={styles.statRowSub}>
                    {formatNumber(coinData.available_value)}{" "}
                    {coinData.coin_name?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>On Order</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textRed}>
                    {formatCurrency(coinData.on_order_balance)}
                  </span>
                  <span className={styles.statRowSub}>
                    {formatNumber(coinData.on_order_value)}{" "}
                    {coinData.coin_name?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>Staked</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textOrange}>
                    {formatCurrency(coinData.staked_balance)}
                  </span>
                  <span className={styles.statRowSub}>
                    {formatNumber(coinData.staked_value)}{" "}
                    {coinData.coin_name?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>Spot Price</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textGreen}>
                    {formatCurrency(coinData.coin_rate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarPanel}>
            <h2 className={styles.panelTitle}>Allocation</h2>
            <div className={styles.stackedBar}>
              {availablePercentage > 0 && (
                <div
                  className={styles.stackedSegment}
                  style={{
                    width: `${availablePercentage}%`,
                    background: "#22c55e",
                  }}
                />
              )}
              {onOrderPercentage > 0 && (
                <div
                  className={styles.stackedSegment}
                  style={{
                    width: `${onOrderPercentage}%`,
                    background: "#ef4444",
                  }}
                />
              )}
              {stakedPercentage > 0 && (
                <div
                  className={styles.stackedSegment}
                  style={{
                    width: `${stakedPercentage}%`,
                    background: "#f59e0b",
                  }}
                />
              )}
            </div>
            <div className={styles.legendList}>
              <div className={styles.legendRow}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#22c55e" }}
                />
                <span className={styles.legendLabel}>Available</span>
                <span className={styles.legendPct}>
                  {availablePercentage.toFixed(1)}%
                </span>
              </div>
              <div className={styles.legendRow}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#ef4444" }}
                />
                <span className={styles.legendLabel}>On Order</span>
                <span className={styles.legendPct}>
                  {onOrderPercentage.toFixed(1)}%
                </span>
              </div>
              <div className={styles.legendRow}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#f59e0b" }}
                />
                <span className={styles.legendLabel}>Staked</span>
                <span className={styles.legendPct}>
                  {stakedPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
