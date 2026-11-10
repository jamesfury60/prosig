"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  Users,
  Copy,
  Loader2,
  UserMinus,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./copytrader.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function CopyTraderPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [traders, setTraders] = useState([]);
  const [currentTrader, setCurrentTrader] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyingId, setCopyingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("roi");
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  const CATEGORIES = [
    { id: "all", label: "All Traders" },
    { id: "top", label: "Top Performers" },
    { id: "most-copied", label: "Most Copied" },
    { id: "low-risk", label: "Low Risk" },
  ];

  const SORT_OPTIONS = [
    { id: "roi", label: "Highest ROI" },
    { id: "winrate", label: "Highest Win Rate" },
    { id: "followers", label: "Most Followers" },
  ];

  // Fetch traders
  const fetchTraders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/copytrader-list.php");
      const res = response.data;
      if (res.success) {
        setTraders(res.data || []);
      } else {
        toast.error(res.message || "Failed to load traders");
      }
    } catch (err) {
      console.error("Failed to fetch traders:", err);
      toast.error("Failed to load traders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current trader (includes balance)
  const fetchCurrentTrader = async () => {
    if (!userData) return;
    try {
      const response = await api.get("/user/current-trader.php");
      const res = response.data;
      if (res.success) {
        setCurrentTrader(res.data);
        setUserBalance(res.data?.usdt_balance || 0);
      }
    } catch (err) {
      console.error("Failed to fetch current trader:", err);
    }
  };

  useEffect(() => {
    fetchTraders();
    if (userData) {
      fetchCurrentTrader();
    }
  }, [userData]);

  const counts = useMemo(() => {
    const map = { all: traders.length };
    for (const t of traders) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [traders]);

  const visibleTraders = useMemo(() => {
    let items =
      activeCategory === "all"
        ? traders
        : traders.filter((t) => t.category === activeCategory);

    const sorted = [...items];
    if (sort === "roi") sorted.sort((a, b) => b.profit_value - a.profit_value);
    if (sort === "winrate") sorted.sort((a, b) => b.win_rate - a.win_rate);
    if (sort === "followers") sorted.sort((a, b) => b.nocopiers - a.nocopiers);

    return sorted;
  }, [traders, activeCategory, sort]);

  function openInvestModal(trader) {
    setSelectedTrader(trader);
    setInvestmentAmount("");
    setShowInvestModal(true);
  }

  function closeInvestModal() {
    setShowInvestModal(false);
    setSelectedTrader(null);
    setInvestmentAmount("");
  }

  async function handleCopy() {
    if (!selectedTrader) return;

    toast.dismiss();

    const amount = parseFloat(investmentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    // Check if user has enough balance
    const commission = (amount * selectedTrader.commision) / 100;
    if (userBalance < commission) {
      toast.error(
        `Insufficient balance. Commission: ${currency}${commission.toFixed(2)}, Available: ${currency}${userBalance.toFixed(2)}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/user/copy-trader.php", {
        trader_id: selectedTrader.id,
        investment_amount: amount,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Now copying trader!");
        closeInvestModal();
        await fetchTraders();
        await fetchCurrentTrader();
      } else {
        toast.error(res.message || "Failed to copy trader");
      }
    } catch (error) {
      console.error("Copy error:", error);
      const errorMsg = error.response?.data?.message || "Failed to copy trader";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStopCopy() {
    toast.dismiss();

    if (!currentTrader?.current_trader) {
      toast.error("You are not copying any trader");
      return;
    }

    if (!confirm("Are you sure you want to stop copying this trader?")) {
      return;
    }

    try {
      const response = await api.post("/user/stop-copy-trader.php", {});
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Stopped copying trader!");
        await fetchTraders();
        await fetchCurrentTrader();
      } else {
        toast.error(res.message || "Failed to stop copying");
      }
    } catch (error) {
      console.error("Stop copy error:", error);
      toast.error(error.response?.data?.message || "Failed to stop copying");
    }
  }

  function getRiskClass(risk) {
    const riskMap = {
      Low: "riskLow",
      Medium: "riskMedium",
      High: "riskHigh",
    };
    return riskMap[risk] || "riskMedium";
  }

  // Calculate commission
  const calculateCommission = () => {
    if (!selectedTrader || !investmentAmount) return 0;
    const amount = parseFloat(investmentAmount);
    if (!amount || amount <= 0) return 0;
    return (amount * selectedTrader.commision) / 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Copy Traders</h1>
            <p className={styles.subtitle}>Loading traders...</p>
          </div>
        </div>
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Copy Traders</h1>
          <p className={styles.subtitle}>
            Automatically copy the strategies of top-performing traders
          </p>
        </div>

        {/* Current Trader Status */}
        {currentTrader?.current_trader && (
          <div className={styles.currentTraderBadge}>
            <span className={styles.badgeIcon}>✓</span>
            <span>Copying: {currentTrader.current_trader.name}</span>
            <button
              className={styles.stopCopyBtn}
              onClick={handleStopCopy}
              title="Stop copying"
            >
              <UserMinus size={16} />
            </button>
          </div>
        )}

        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort traders"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
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
            {cat.label} ({counts[cat.id] ?? 0})
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visibleTraders.map((trader) => {
          const isCopying = currentTrader?.current_trader?.id === trader.id;
          return (
            <div
              key={trader.id}
              className={`${styles.card} ${isCopying ? styles.copying : ""}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.avatar}>
                  {trader.photo ? (
                    <img
                      src={trader.photo}
                      alt={trader.name}
                      className={styles.avatarImage}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    trader.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </span>

                <div className={styles.nameBlock}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.traderName}>{trader.name}</h3>
                    {trader.rank && (
                      <BadgeCheck
                        size={16}
                        className={styles.verifiedIcon}
                        aria-label="Verified"
                      />
                    )}
                  </div>
                  <p className={styles.strategy}>{trader.rank || "Trader"}</p>
                </div>

                <span
                  className={`${styles.riskBadge} ${styles[getRiskClass(trader.risk)]}`}
                >
                  {trader.risk || "Medium"}
                </span>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statValuePositive}>
                    <TrendingUp size={14} />
                    {trader.profit_value}%
                  </span>
                  <span className={styles.statLabel}>ROI</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{trader.win_rate}%</span>
                  <span className={styles.statLabel}>Win Rate</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>
                    {trader.notrades || 0}
                  </span>
                  <span className={styles.statLabel}>Trades</span>
                </div>
              </div>

              <div className={styles.followersRow}>
                <Users size={14} />
                <span>{trader.nocopiers?.toLocaleString() || 0} copiers</span>
              </div>

              <div className={styles.traderDesc}>{trader.strategy_desc}</div>

              <div className={styles.footerRow}>
                <div>
                  <span className={styles.minLabel}>Commission</span>
                  <span className={styles.minValue}>
                    {trader.commision || 0}%
                  </span>
                </div>

                {isCopying ? (
                  <button type="button" className={styles.copyingBtn} disabled>
                    <BadgeCheck size={16} />
                    Copying
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => openInvestModal(trader)}
                    disabled={copyingId === trader.id}
                  >
                    <Copy size={16} />
                    Copy Trader
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visibleTraders.length === 0 && (
          <p className={styles.emptyState}>No traders match this filter yet.</p>
        )}
      </div>

      {/* Invest Modal */}
      {showInvestModal && selectedTrader && (
        <div
          className={styles.modalOverlay}
          onClick={closeInvestModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.investModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3>Copy {selectedTrader.name}</h3>
                <p className={styles.modalSubtitle}>
                  Enter the amount you want to invest
                </p>
              </div>
              <button
                className={styles.modalClose}
                onClick={closeInvestModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Trader Info */}
              <div className={styles.traderInfo}>
                <div className={styles.traderInfoRow}>
                  <span className={styles.traderInfoLabel}>Trader</span>
                  <span className={styles.traderInfoValue}>
                    {selectedTrader.name}
                  </span>
                </div>
                <div className={styles.traderInfoRow}>
                  <span className={styles.traderInfoLabel}>Win Rate</span>
                  <span className={styles.traderInfoValue}>
                    {selectedTrader.win_rate}%
                  </span>
                </div>
                <div className={styles.traderInfoRow}>
                  <span className={styles.traderInfoLabel}>Commission</span>
                  <span className={styles.traderInfoValue}>
                    {selectedTrader.commision || 0}%
                  </span>
                </div>
              </div>

              {/* Investment Amount */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  Investment Amount ({currency})
                </label>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.currencySymbol}>{currency}</span>
                  <input
                    type="number"
                    className={styles.fieldInput}
                    placeholder="0.00"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className={styles.fieldHint}>
                  Available balance: {currency}
                  {userBalance.toFixed(2)}
                </div>
              </div>

              {/* Commission Breakdown */}
              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className={styles.commissionBreakdown}>
                  <div className={styles.commissionRow}>
                    <span>Investment Amount</span>
                    <span>
                      {currency}
                      {parseFloat(investmentAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.commissionRow}>
                    <span>Commission ({selectedTrader.commision || 0}%)</span>
                    <span className={styles.commissionAmount}>
                      {currency}
                      {calculateCommission().toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.commissionRow}>
                    <span>Total Deducted</span>
                    <span className={styles.totalAmount}>
                      {currency}
                      {(
                        parseFloat(investmentAmount) + calculateCommission()
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.infoBox}>
                <Info size={16} className={styles.infoIcon} />
                <span className={styles.infoText}>
                  This will start copying {selectedTrader.name}&apos;s trades. A{" "}
                  {selectedTrader.commision || 0}% commission fee will be
                  deducted from your balance.
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={closeInvestModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleCopy}
                disabled={
                  isSubmitting ||
                  !investmentAmount ||
                  parseFloat(investmentAmount) <= 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Copying
                    <Copy size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
