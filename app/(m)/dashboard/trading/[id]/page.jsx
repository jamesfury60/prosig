"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  SlidersHorizontal,
  BarChart3,
  LineChart,
  ChevronDown,
  Maximize2,
  Crosshair,
  Minus,
  List,
  Share2,
  Flag,
  PenTool,
  Type,
  Smile,
  Ruler,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "../trade.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import TradingViewWidget from "@/components/TradingViewWidget";

const TIMEFRAMES = [
  { label: "1m", tv: "1" },
  { label: "5m", tv: "5" },
  { label: "30m", tv: "30" },
  { label: "1h", tv: "60" },
  { label: "D", tv: "D" },
  { label: "1W", tv: "W" },
];

const ORDER_TYPES = ["Market Order", "Limit Order", "Stop Order"];
const LEVERAGE_OPTIONS = ["1x", "2x", "5x", "10x", "20x", "50x"];
const DURATION_OPTIONS = [
  "5 Minutes",
  "15 Minutes",
  "1 Hour",
  "4 Hours",
  "1 Day",
  "Good Till Cancelled",
];
const QUICK_PERCENTS = [25, 50, 75, 100];

// Map your spot.title / spot.name to a TradingView symbol.
// Add more entries here as you add coins to the spot table.
// Format: EXCHANGE:TICKER (use BINANCE, NASDAQ, NYSE, FX, TVC, etc.)
const TV_SYMBOL_MAP = {
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  XRP: "BINANCE:XRPUSDT",
  SOL: "BINANCE:SOLUSDT",
  BNB: "BINANCE:BNBUSDT",
  TRX: "BINANCE:TRXUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  ADA: "BINANCE:ADAUSDT",
  LINK: "BINANCE:LINKUSDT",
  AVAX: "BINANCE:AVAXUSDT",
  LTC: "BINANCE:LTCUSDT",
  DOT: "BINANCE:DOTUSDT",
  UNI: "BINANCE:UNIUSDT",
  SHIB: "BINANCE:SHIBUSDT",
  XLM: "BINANCE:XLMUSDT",
  NEAR: "BINANCE:NEARUSDT",
  TON: "BINANCE:TONUSDT",
  XMR: "BINANCE:XMRUSDT",
  BCH: "BINANCE:BCHUSDT",
  ETC: "BINANCE:ETCUSDT",
  ICP: "BINANCE:ICPUSDT",
  HYPE: "BINANCE:HYPEUSDT",
  OKB: "OKX:OKBUSDT",
  MNT: "BINANCE:MNTUSDT",
  SUI: "BINANCE:SUIUSDT",
  PEPE: "BINANCE:PEPEUSDT",
  APT: "BINANCE:APTUSDT",
  AAVE: "BINANCE:AAVEUSDT",
  HBAR: "BINANCE:HBARUSDT",
  CRO: "BINANCE:CROUSDT",
  TAO: "BINANCE:TAOUSDT",
  PI: "OKX:PIUSDT",
  WETH: "BINANCE:WETHUSDT",
  WBTC: "BINANCE:WBTCUSDT",
  STETH: "BINANCE:STETHUSDT",
  WSTETH: "BINANCE:WSTETHUSDT",
  WEETH: "BINANCE:WEETHUSDT",
  WBETH: "BINANCE:WBETHUSDT",
  CBBTC: "COINBASE:CBBTCUSD",
  JITOSOL: "BINANCE:JITOSOLUSDT",
  USDE: "BINANCE:USDEUSDT",
  SUSDE: "BINANCE:SUSDEUSDT",
  ENA: "BINANCE:ENAUSDT",
  BGB: "BINANCE:BGBUSDT",
  LEO: "BINANCE:LEOUSDT",
  WBT: "BINANCE:WBTUSDT",
  // Equities
  AAPL: "NASDAQ:AAPL",
  MSFT: "NASDAQ:MSFT",
  NVDA: "NASDAQ:NVDA",
  AMZN: "NASDAQ:AMZN",
  GOOGL: "NASDAQ:GOOGL",
  META: "NASDAQ:META",
  TSLA: "NASDAQ:TSLA",
  NFLX: "NASDAQ:NFLX",
  ADBE: "NASDAQ:ADBE",
  INTC: "NASDAQ:INTC",
  AMD: "NASDAQ:AMD",
  // Commodities / FX
  WTI: "TVC:USOIL",
  XAUUSD: "TVC:GOLD",
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
  AUDUSD: "FX:AUDUSD",
};

// Try to build a TradingView symbol from spot data
function buildTradingViewSymbol(spotData) {
  if (!spotData) return "BINANCE:BTCUSDT";

  // Extract the ticker from title (e.g. "BTC/USD" -> "BTC", "AAPL" -> "AAPL")
  const titleOrName = (spotData.title || spotData.name || "").trim();
  const ticker = titleOrName.split("/")[0].trim().toUpperCase();

  // Try direct lookup by ticker first
  if (TV_SYMBOL_MAP[ticker]) return TV_SYMBOL_MAP[ticker];

  // Then by full title/name
  const fullKey = titleOrName.toUpperCase();
  if (TV_SYMBOL_MAP[fullKey]) return TV_SYMBOL_MAP[fullKey];

  // Fallback for stocks: try NASDAQ
  const type = (spotData.type || "").toLowerCase();
  if (type === "stock" || type === "stocks") {
    return `NASDAQ:${ticker}`;
  }

  // Fallback for crypto: default to Binance USDT pair
  if (type === "crypto") {
    return `BINANCE:${ticker}USDT`;
  }

  // Last resort
  return "BINANCE:BTCUSDT";
}

export default function TradingPage() {
  const router = useRouter();
  const params = useParams();
  const spotId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [spotData, setSpotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tradeHistory, setTradeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [timeframe, setTimeframe] = useState("D");
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState(ORDER_TYPES[0]);
  const [leverage, setLeverage] = useState("");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const pricePollRef = useRef(null);

  // ----------------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------------
  const numericAmount = Number(amount) || 0;
  const availableBalance = spotData?.available_balance || 0;
  const units =
    spotData?.last_price > 0 ? numericAmount / spotData.last_price : 0;
  const balancePct = Math.min(
    100,
    (numericAmount / (availableBalance || 1)) * 100,
  );

  const tvSymbol = buildTradingViewSymbol(spotData);
  const tvInterval = TIMEFRAMES.find((t) => t.label === timeframe)?.tv ?? "D";

  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  const safeToFixed = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0." + "0".repeat(decimals);
    }
    return Number(value).toFixed(decimals);
  };

  // ----------------------------------------------------------------
  // Fetch spot data
  // ----------------------------------------------------------------
  const fetchSpotData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/markets-single.php?id=${spotId}`);
      const res = response.data;

      if (res.success) {
        setSpotData(res.data);
      } else {
        throw new Error(res.message || "Failed to load spot data");
      }
    } catch (err) {
      console.error("Failed to fetch spot data:", err);
      if (!silent) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load spot data",
        );
        toast.error("Failed to load spot data");
        setTimeout(() => {
          router.push("/dashboard/markets");
        }, 1500);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Trade history
  // ----------------------------------------------------------------
  const fetchTradeHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get("/user/trade_history.php");
      const res = response.data;
      if (res.success) {
        setTradeHistory(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch trade history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Mount + polling
  // ----------------------------------------------------------------
  useEffect(() => {
    if (spotId) {
      fetchSpotData();
      fetchTradeHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  // Silent polling every 30s for live price in header / order panel
  useEffect(() => {
    if (!spotId) return;
    pricePollRef.current = setInterval(() => {
      fetchSpotData(true);
    }, 30000);
    return () => {
      if (pricePollRef.current) clearInterval(pricePollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  function setQuickAmount(pct) {
    const value = (availableBalance * pct) / 100;
    setAmount(value.toFixed(2));
  }

  // ----------------------------------------------------------------
  // Place order
  // ----------------------------------------------------------------
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setSubmitError("");
    setSubmitSuccess("");

    if (numericAmount <= 0) {
      toast.error("Please enter an investment amount.");
      return;
    }
    if (!leverage) {
      toast.error("Please select leverage.");
      return;
    }
    if (!duration) {
      toast.error("Please select an expiration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/user/trade-now.php", {
        amount: numericAmount,
        coin_id: parseInt(spotId),
        coin_name: spotData?.name || spotData?.title || "USDT",
        trading_spot: spotData?.title || spotData?.name || "SPOT",
        trade_type: side === "buy" ? "BUY" : "SELL",
        market_type: "Spot",
        leverage: parseInt(leverage.replace("x", "")),
        sl: null,
        tp: null,
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(res.message || "Trade placed successfully!");
        toast.success(res.message || "Trade placed successfully!");
        setAmount("");
        await fetchSpotData(true);
        await fetchTradeHistory();
        setTimeout(() => setSubmitSuccess(""), 5000);
      } else {
        throw new Error(res.message || "Failed to place trade");
      }
    } catch (err) {
      console.error("Trade error:", err);
      setSubmitError(
        err?.response?.data?.message || err?.message || "Failed to place trade",
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to place trade",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------
  // Render guards
  // ----------------------------------------------------------------
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <Loader2 size={40} className={styles.loadingSpinner} />
          <p>Loading trading data...</p>
        </div>
      </div>
    );
  }

  if (error || !spotData) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h2>Failed to Load Trading Data</h2>
          <p>{error || "Spot not found"}</p>
          <button
            onClick={() => router.push("/dashboard/markets")}
            className={styles.backBtn}
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {/* Instrument header — unchanged */}
          <div className={styles.instrumentHeader}>
            <div className={styles.instrumentLeft}>
              {spotData.photo ? (
                <img
                  src={spotData.photo}
                  alt={spotData.name}
                  className={styles.instrumentAvatar}
                />
              ) : (
                <span className={styles.instrumentAvatarText}>
                  {spotData.name?.slice(0, 2).toUpperCase() || "??"}
                </span>
              )}
              <div>
                <h1 className={styles.instrumentSymbol}>{spotData.name}</h1>
                <p className={styles.instrumentSub}>{spotData.title}</p>
              </div>
            </div>

            <div className={styles.instrumentRight}>
              <span className={styles.instrumentPrice}>
                {formatCurrency(spotData.last_price)}
              </span>
              <span
                className={
                  spotData.changehours >= 0
                    ? styles.changeUp
                    : styles.changeDown
                }
              >
                {spotData.changehours >= 0 ? (
                  <TrendingUp size={15} />
                ) : (
                  <TrendingDown size={15} />
                )}
                {spotData.changehours >= 0 ? "+" : ""}
                {safeToFixed(spotData.changehours, 2)}%
              </span>
            </div>
          </div>

          {/* Chart panel — TradingView */}
          <div className={styles.chartPanel}>
            <h2 className={styles.chartTitle}>Price Chart</h2>

            <div className={styles.chartToolbar}>
              <div className={styles.symbolSearch}>
                <Search size={14} />
                <span>{spotData.name}</span>
              </div>
              <button
                type="button"
                className={styles.toolbarIconBtn}
                aria-label="Add"
              >
                <Plus size={15} />
              </button>

              <div className={styles.toolbarDivider} />

              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  type="button"
                  className={`${styles.timeframeBtn} ${timeframe === tf.label ? styles.timeframeBtnActive : ""}`}
                  onClick={() => setTimeframe(tf.label)}
                >
                  {tf.label}
                </button>
              ))}
              <button
                type="button"
                className={styles.toolbarIconBtn}
                aria-label="More timeframes"
              >
                <ChevronDown size={14} />
              </button>

              <div className={styles.toolbarDivider} />

              <button
                type="button"
                className={styles.toolbarIconBtn}
                aria-label="Settings"
              >
                <SlidersHorizontal size={15} />
              </button>
              <button
                type="button"
                className={`${styles.toolbarIconBtn} ${styles.toolbarIconBtnActive}`}
                aria-label="Candlestick style"
              >
                <BarChart3 size={15} />
              </button>
              <button
                type="button"
                className={styles.toolbarIconBtn}
                aria-label="Line chart"
              >
                <LineChart size={15} />
              </button>
              <button
                type="button"
                className={styles.toolbarIconBtn}
                aria-label="More chart types"
              >
                <ChevronDown size={14} />
              </button>

              <button type="button" className={styles.indicatorsBtn}>
                <TrendingUp size={14} />
                Indicators
              </button>

              <button
                type="button"
                className={styles.toolbarIconBtnEnd}
                aria-label="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            <div className={styles.chartArea}>
              <div className={styles.drawToolsRail}>
                {[
                  Crosshair,
                  Minus,
                  List,
                  Share2,
                  Flag,
                  PenTool,
                  Type,
                  Smile,
                  Ruler,
                ].map((Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.railIconBtn}
                    aria-label="Drawing tool"
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>

              <div className={styles.chartCanvas}>
                <div className={styles.chartSvgWrapper}>
                  <TradingViewWidget
                    symbol={tvSymbol}
                    interval={tvInterval}
                    theme="dark"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order panel — unchanged */}
        <aside className={styles.orderPanel}>
          <h2 className={styles.orderTitle}>Place Live Order</h2>

          <div className={styles.sideToggle}>
            <button
              type="button"
              className={`${styles.sideBtn} ${side === "buy" ? styles.sideBtnBuy : ""}`}
              onClick={() => setSide("buy")}
            >
              Buy
            </button>
            <button
              type="button"
              className={`${styles.sideBtn} ${side === "sell" ? styles.sideBtnSell : ""}`}
              onClick={() => setSide("sell")}
            >
              Sell
            </button>
          </div>

          <form className={styles.orderForm} onSubmit={handlePlaceOrder}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="orderType">
                Order Type
              </label>
              <select
                id="orderType"
                className={styles.select}
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                {ORDER_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="leverage">
                Leverage
              </label>
              <select
                id="leverage"
                className={styles.select}
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
              >
                <option value="">Select Leverage</option>
                {LEVERAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="duration">
                Expiration
              </label>
              <select
                id="duration"
                className={styles.select}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Select Duration</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="amount">
                Investment Amount ({currency})
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="any"
                className={styles.input}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className={styles.balanceHint}>
                Available: {formatCurrency(availableBalance)}
              </p>
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Investment Amount:</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(numericAmount)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Units:</span>
                <span className={styles.summaryValue}>
                  {safeToFixed(units, 4)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Available Balance:</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(availableBalance)}
                </span>
              </div>
              <div className={styles.balanceTrack}>
                <div
                  className={styles.balanceFill}
                  style={{ width: `${balancePct}%` }}
                />
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Quick amounts:</span>
              <div className={styles.quickAmountsRow}>
                {QUICK_PERCENTS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={styles.quickAmountBtn}
                    onClick={() => setQuickAmount(pct)}
                  >
                    {pct === 100 ? "Max" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {submitError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className={styles.successMessage}>
                <span>✅</span>
                <span>{submitSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className={
                side === "buy" ? styles.submitBtnBuy : styles.submitBtnSell
              }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Placing order..."
                : side === "buy"
                  ? "Place Buy Order"
                  : "Place Sell Order"}
            </button>
          </form>
        </aside>
      </div>

      {/* Trade History — unchanged */}
      <section className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>Trade History</h2>
        </div>

        <div className={styles.historyTableWrapper}>
          {historyLoading ? (
            <div className={styles.historyLoading}>
              <Loader2 size={30} className={styles.spinner} />
              <p>Loading trade history...</p>
            </div>
          ) : tradeHistory.length === 0 ? (
            <div className={styles.historyEmpty}>
              <p>No trade history found.</p>
            </div>
          ) : (
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>(P/L)</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>Leverage</th>
                  <th>Result</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade) => (
                  <tr key={trade.id}>
                    <td className={styles.historySymbol}>
                      {trade.symbol || trade.coin_name || "N/A"}
                    </td>
                    <td>
                      <span
                        className={
                          trade.type === "BUY"
                            ? styles.historyTypeBuy
                            : styles.historyTypeSell
                        }
                      >
                        {trade.type || "N/A"}
                      </span>
                    </td>
                    <td>{formatCurrency(trade.volume || trade.amount)}</td>
                    <td>
                      <span
                        className={`
                          ${trade.mdat > 0 ? "text-green-400 font-bold" : ""}
                          ${trade.mdat < 0 ? "text-red-400 font-bold" : ""}
                          ${trade.mdat === 0 ? "font-bold" : ""}
                        `}
                      >
                        {" "}
                        {formatCurrency(Math.abs(trade.mdat))}
                      </span>
                    </td>
                    <td>{formatCurrency(trade.bgat || trade.entry)}</td>
                    <td>{formatCurrency(trade.sdat || trade.current)}</td>
                    <td>{trade.leverage || "1"}x</td>
                    <td>
                      <span
                        className={
                          trade.trade_result === "WON" ||
                          trade.trade_result === "Profit"
                            ? styles.historyPnlPositive
                            : styles.historyPnlNegative
                        }
                      >
                        {trade.trade_result || "PENDING"}
                      </span>
                    </td>
                    <td className={styles.historyDate}>
                      {trade.created_at
                        ? new Date(trade.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
