"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, ShoppingCart, X } from "lucide-react";
import toast from "react-hot-toast";

import styles from "../stock-detail.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

// Format number
const formatNumber = (num, precision = 2) => {
  if (num == null) return "0." + "0".repeat(precision);
  if (num === 0) return "0." + "0".repeat(precision);
  if (num < 0.000001) return num.toExponential(4);
  if (num < 0.001) return num.toFixed(6);
  if (num < 1) return num.toFixed(precision);
  if (num < 1000) return num.toFixed(precision);
  return num.toLocaleString("en-US", { maximumFractionDigits: precision });
};

// Generate price series for chart
function generateSeries(points = 60, base = 440) {
  const series = [];
  for (let i = 0; i < points; i++) {
    const decline = i < 22 ? -i * 2.6 : -22 * 2.6;
    const recover = i > 22 ? (i - 22) * 3.1 : 0;
    const wave = Math.sin(i * 0.5) * 6 + Math.sin(i * 0.13) * 10;
    series.push(base + decline + recover + wave);
  }
  return series;
}

// Area Chart Component
function AreaChart({ series }) {
  const width = 1000;
  const height = 320;
  const paddingRight = 70;
  const plotWidth = width - paddingRight;

  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;

  function x(i) {
    return (i / (series.length - 1)) * plotWidth;
  }
  function y(v) {
    return height - ((v - min) / range) * height;
  }

  const linePath = series
    .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
    .join(" ");
  const areaPath = `${linePath} L ${plotWidth} ${height} L 0 ${height} Z`;

  const last = series[series.length - 1];
  const gridCount = 6;
  const gridValues = Array.from(
    { length: gridCount },
    (_, i) => min + (range / (gridCount - 1)) * i,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.chartSvg}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridValues.map((v, i) => (
        <line
          key={i}
          x1="0"
          y1={y(v)}
          x2={plotWidth}
          y2={y(v)}
          className={styles.gridLine}
        />
      ))}

      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" className={styles.linePath} />

      <line
        x1="0"
        y1={y(last)}
        x2={plotWidth}
        y2={y(last)}
        className={styles.currentLine}
      />
      <circle cx={plotWidth} cy={y(last)} r="4" className={styles.currentDot} />

      {gridValues.map((v, i) => (
        <text
          key={`l-${i}`}
          x={plotWidth + 10}
          y={y(v) + 4}
          className={styles.axisLabel}
        >
          ${v.toFixed(0)}
        </text>
      ))}
    </svg>
  );
}

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];
const MONTH_LABELS = ["Jun", "Jul", "Aug", "Sep"];
const SERIES = generateSeries();

export default function StockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const stockId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("1D");
  const [activeTab, setActiveTab] = useState("history");
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Buy/Sell Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [orderForm, setOrderForm] = useState({
    amount: 0,
    action: "buy",
  });

  // Format currency
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Fetch stock details
  const fetchStockDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/portfolio.php?coin_id=${stockId}`);
      const res = response.data;

      if (res.success) {
        setStockData({
          ...res.data,
          available_balance: Number(res.data.available_balance) || 0,
          total_balance: Number(res.data.total_balance) || 0,
          on_order_balance: Number(res.data.on_order_balance) || 0,
          staked_balance: Number(res.data.staked_balance) || 0,
          total_value: Number(res.data.total_value) || 0,
          available_value: Number(res.data.available_value) || 0,
          coin_rate: Number(res.data.coin_rate) || 0,
        });
      } else {
        throw new Error(res.message || "Failed to load stock details");
      }
    } catch (err) {
      console.error("Failed to fetch stock details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load stock details",
      );
      toast.error("Failed to load stock details");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for this stock
  const fetchTransactions = async () => {
    setTransactionsLoading(true);

    try {
      const response = await api.get(
        `/user/coin-transactions.php?coin_id=${stockId}`,
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
    if (stockId) {
      fetchStockDetails();
      fetchTransactions();
    }
  }, [stockId]);

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
    if (!stockData || stockData.total_balance === 0) return 0;
    return (stockData.available_balance / stockData.total_balance) * 100;
  }, [stockData]);

  const onOrderPercentage = useMemo(() => {
    if (!stockData || stockData.total_balance === 0) return 0;
    return (stockData.on_order_balance / stockData.total_balance) * 100;
  }, [stockData]);

  const stakedPercentage = useMemo(() => {
    if (!stockData || stockData.total_balance === 0) return 0;
    return (stockData.staked_balance / stockData.total_balance) * 100;
  }, [stockData]);

  // Open modal
  const openModal = () => {
    setShowModal(true);
    setOrderForm({ amount: 0, action: "buy" });
    setModalError("");
    setSuccessMessage("");
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setOrderForm({ amount: 0, action: "buy" });
    setModalError("");
    setSuccessMessage("");
  };

  // Place order
  const placeOrder = async (e) => {
    e.preventDefault();

    if (orderForm.amount <= 0) {
      setModalError("Amount must be greater than 0");
      return;
    }

    if (
      orderForm.action === "sell" &&
      orderForm.amount > (stockData?.available_balance || 0)
    ) {
      setModalError(
        `Amount exceeds available balance (${formatCurrency(
          stockData?.available_balance || 0,
        )})`,
      );
      return;
    }

    setIsSubmitting(true);
    setModalError("");
    setSuccessMessage("");

    try {
      const response = await api.post("/user/stockup.php", {
        coin_id: parseInt(stockId),
        amount: parseFloat(orderForm.amount),
        action: orderForm.action.toUpperCase(),
      });

      const res = response.data;

      if (res.success) {
        setSuccessMessage(
          `Order placed successfully: ${res.data.action} ${formatNumber(
            res.data.amount,
            2,
          )} of ${res.data.coin}`,
        );

        // Wait 5 seconds then close modal and refresh
        setTimeout(() => {
          closeModal();
          fetchStockDetails();
          fetchTransactions();
        }, 5000);
      } else {
        throw new Error(res.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      setModalError(
        err?.response?.data?.message || err?.message || "Failed to place order",
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back
  const goBack = () => {
    router.push("/dashboard");
  };

  // Loading state
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
          <div className={styles.skeletonChart} />
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonMain} />
            <div className={styles.skeletonSidebar} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stockData) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Stock</h2>
          <p>{error || "Stock not found"}</p>
          <button onClick={goBack} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isUp = stockData.day_change_pct >= 0;
  const last = SERIES[SERIES.length - 1];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIdentity}>
          <span className={styles.stockMark}>
            {stockData.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stockData.photo}
                alt={stockData.coin_name}
                className={styles.stockImage}
              />
            ) : (
              <span className={styles.stockInitial}>
                {stockData.coin_name?.charAt(0) || "?"}
              </span>
            )}
          </span>
          <div>
            <div className={styles.nameRow}>
              <h1 className={styles.symbol}>
                {stockData.coin_title || stockData.coin_name}
              </h1>
              <span className={styles.ticker}>
                ({stockData.coin_name?.toUpperCase()})
              </span>
            </div>
            <span className={isUp ? styles.dayChangeUp : styles.dayChangeDown}>
              {isUp ? "▲" : "▼"} {Math.abs(stockData.day_change_pct || 0)}%
              today
            </span>
          </div>
        </div>

        <div className={styles.heroValue}>
          <span className={styles.portfolioLabel}>Total Portfolio</span>
          <span className={styles.portfolioValue}>
            {formatCurrency(stockData.total_balance)}
          </span>
          <span className={styles.portfolioSub}>
            ≈ {formatNumber(stockData.total_value)}{" "}
            {stockData.coin_name?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Chart panel */}
      <div className={styles.chartPanel}>
        <div className={styles.chartHeader}>
          <div className={styles.timeframeRow}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                className={`${styles.timeframeBtn} ${timeframe === tf ? styles.timeframeBtnActive : ""}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className={styles.chartPrice}>
            <span className={styles.chartPriceValue}>
              {formatCurrency(stockData.coin_rate || last)}
            </span>
            <span className={isUp ? styles.changeUp : styles.changeDown}>
              {isUp ? "+" : ""}
              {(stockData.day_change_pct || 0).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className={styles.chartCanvas}>
          <AreaChart series={SERIES} />
          <span className={styles.priceTag}>
            {formatCurrency(stockData.coin_rate || last)}
          </span>
        </div>

        <div className={styles.monthAxis}>
          {MONTH_LABELS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
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
              About Stock
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
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className={styles.timelineRow}>
                      <div className={styles.timelineRail}>
                        <span
                          className={styles.timelineDot}
                          style={{
                            background: tx.amount < 0 ? "#ef4444" : "#22c55e",
                          }}
                        />
                        <span className={styles.timelineLine} />
                      </div>
                      <div className={styles.timelineBody}>
                        <div className={styles.timelineTop}>
                          <span className={styles.txType}>{tx.type}</span>
                          <span
                            className={
                              tx.amount < 0
                                ? styles.txAmountNeg
                                : styles.txAmountPos
                            }
                          >
                            {tx.amount < 0 ? "-" : "+"}
                            {formatCurrency(Math.abs(tx.amount))}
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
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className={styles.aboutPanel}>
              <p className={styles.aboutDescription}>
                {stockData.deposit_instructions ||
                  "No additional information available for this stock."}
              </p>
              <div className={styles.aboutStats}>
                <div>
                  <span className={styles.statLabel}>Market Cap</span>
                  <span className={styles.statValue}>
                    ${stockData.market_cap || "N/A"}
                  </span>
                </div>
                <div>
                  <span className={styles.statLabel}>Sector</span>
                  <span className={styles.statValue}>
                    {stockData.sector || "N/A"}
                  </span>
                </div>
                <div>
                  <span className={styles.statLabel}>Exchange</span>
                  <span className={styles.statValue}>
                    {stockData.exchange || "N/A"}
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
                    {formatCurrency(stockData.available_balance)}
                  </span>
                  <span className={styles.statRowSub}>
                    {formatNumber(stockData.available_value)}{" "}
                    {stockData.coin_name?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>On Order</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textDim}>
                    {formatCurrency(stockData.on_order_balance)}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>Staked</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textDim}>
                    {formatCurrency(stockData.staked_balance)}
                  </span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statRowLabel}>Spot Price</span>
                <div className={styles.statRowValues}>
                  <span className={styles.textGreen}>
                    {formatCurrency(stockData.coin_rate)}
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
                    background: "#22c55e",
                  }}
                />
              )}
              {stakedPercentage > 0 && (
                <div
                  className={styles.stackedSegment}
                  style={{
                    width: `${stakedPercentage}%`,
                    background: "#22c55e",
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
                  style={{ background: "#22c55e" }}
                />
                <span className={styles.legendLabel}>On Order</span>
                <span className={styles.legendPct}>
                  {onOrderPercentage.toFixed(1)}%
                </span>
              </div>
              <div className={styles.legendRow}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#22c55e" }}
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

      {/* Fixed Place Order Button */}
      <div
        style={{
          position: "fixed",
          bottom: "165px",
          right: "20px",
          zIndex: 3000,
        }}
      >
        <button
          onClick={openModal}
          className="bg-red-700 hover:bg-red-800 dark:bg-green-800 dark:hover:bg-green-900 text-white px-4 py-2 rounded-full shadow-md transition-colors duration-300 cursor-pointer flex items-center gap-2"
        >
          <ShoppingCart size={20} />
        </button>
      </div>

      {/* Modal - Using theme variables */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            if (!isSubmitting) closeModal();
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => {
                if (!isSubmitting) closeModal();
              }}
              disabled={isSubmitting}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h3 className={styles.modalTitle}>Place Order</h3>

            {/* Success Message */}
            {successMessage && (
              <div className={styles.modalSuccess}>
                <span>✅ {successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {modalError && !successMessage && (
              <div className={styles.modalError}>
                <span>⚠️ {modalError}</span>
              </div>
            )}

            {/* Form (hidden when success message is shown) */}
            {!successMessage && (
              <form onSubmit={placeOrder}>
                {/* Amount */}
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={`${styles.modalInput} ${
                      orderForm.amount <= 0 ||
                      (orderForm.action === "sell" &&
                        orderForm.amount > (stockData?.available_balance || 0))
                        ? styles.modalInputError
                        : ""
                    }`}
                    placeholder="Enter amount"
                    value={orderForm.amount}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    disabled={isSubmitting}
                  />
                  {orderForm.amount <= 0 && (
                    <div className={styles.modalHintError}>
                      Amount must be greater than 0
                    </div>
                  )}
                  {orderForm.action === "sell" &&
                    orderForm.amount > (stockData?.available_balance || 0) && (
                      <div className={styles.modalHintError}>
                        Amount exceeds available balance (
                        {formatCurrency(stockData?.available_balance || 0)})
                      </div>
                    )}
                </div>

                {/* Buy/Sell Select */}
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Action</label>
                  <select
                    className={styles.modalSelect}
                    value={orderForm.action}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        action: e.target.value,
                      })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
                  disabled={
                    isSubmitting ||
                    orderForm.amount <= 0 ||
                    (orderForm.action === "sell" &&
                      orderForm.amount > (stockData?.available_balance || 0))
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Submitting...
                    </>
                  ) : (
                    "Submit Order"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
