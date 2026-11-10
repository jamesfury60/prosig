"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Monitor,
  ArrowRight,
  Loader2,
  Bookmark,
  List,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./bots.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function BotsPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [bots, setBots] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investingId, setInvestingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "invested"

  // Fetch bots
  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/bots-all.php");
      const res = response.data;
      if (res.success) {
        setBots(res.data || []);
      } else {
        toast.error(res.message || "Failed to load bots");
      }
    } catch (err) {
      console.error("Failed to fetch bots:", err);
      toast.error("Failed to load bots");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user bot investments
  const fetchInvestments = async () => {
    if (!userData) return;
    try {
      const response = await api.get(
        `/user/user-bot-investments.php?userid=${userData.userid}`,
      );
      const res = response.data;
      if (res.success) {
        setInvestments(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch investments:", err);
    }
  };

  useEffect(() => {
    fetchBots();
    if (userData) {
      fetchInvestments();
    }
  }, [userData]);

  async function handleInvest(bot) {
    toast.dismiss();

    if (!userData) {
      toast.error("Please login to invest");
      return;
    }

    setIsInvesting(true);
    setInvestingId(bot.id);

    try {
      const response = await api.post("/user/bot-invest.php", {
        plan_id: bot.id,
        amount: bot.max_ins, // Use max_ins as investment amount
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Bot investment created successfully!");
        await fetchInvestments();
        await fetchBots();
      } else {
        toast.error(res.message || "Failed to invest");
      }
    } catch (error) {
      console.error("Invest error:", error);
      const errorMsg = error.response?.data?.message || "Failed to invest";
      toast.error(errorMsg);
    } finally {
      setIsInvesting(false);
      setInvestingId(null);
    }
  }

  function formatCurrency(amount) {
    if (!amount && amount !== 0) return "0.00";
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            Active
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
            Completed
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusUnknown}`}>
            {status}
          </span>
        );
    }
  }

  const isInvested = (planId) => {
    return investments.some(
      (inv) => inv.plan_id === planId && inv.status === "active",
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Available Trading Bots</h1>
            <p className={styles.subtitle}>Loading bots...</p>
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
          <h1 className={styles.title}>Available Trading Bots</h1>
          <p className={styles.subtitle}>
            Choose from our AI-powered trading bots
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <List size={18} />
          All Bots
          <span className={styles.tabCount}>{bots.length}</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "invested" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("invested")}
        >
          <Bookmark size={18} />
          My Bot
          <span className={styles.tabCount}>{investments.length}</span>
        </button>
      </div>

      {activeTab === "all" ? (
        /* All Bots */
        <div className={styles.grid}>
          {bots.map((bot) => {
            const invested = isInvested(bot.id);
            return (
              <div
                key={bot.id}
                className={`${styles.card} ${invested ? styles.invested : ""}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.botIcon}>
                    <Monitor size={26} />
                  </span>
                  <div className={styles.botHeading}>
                    <h3 className={styles.botName}>
                      {bot.plan_name}
                      {invested && (
                        <span className={styles.investedBadge}>
                          <CheckCircle size={14} /> Invested
                        </span>
                      )}
                    </h3>
                    <p className={styles.botCategory}>Trading Bot</p>
                  </div>
                  <div className={styles.successBadge}>
                    <span className={styles.successValue}>
                      {bot.daily_interest_rate}%
                    </span>
                    <span className={styles.successLabel}>Daily ROI</span>
                  </div>
                </div>

                <p className={styles.description}>{bot.plan_des}</p>

                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <span className={styles.statValue}>
                      {bot.daily_interest_rate}%
                    </span>
                    <span className={styles.statLabel}>Daily ROI</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statValue}>
                      {bot.days_duration} Days
                    </span>
                    <span className={styles.statLabel}>Duration</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statValue}>
                      {bot.trades_per_day || 0}
                    </span>
                    <span className={styles.statLabel}>Trades/Day</span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Investment:</span>
                  <span className={styles.infoValue}>
                    {currency}
                    {formatCurrency(bot.max_ins)}
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.investBtn} ${invested ? styles.investedBtn : ""}`}
                  onClick={() => handleInvest(bot)}
                  disabled={investingId === bot.id || invested || isInvesting}
                >
                  {investingId === bot.id ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Investing...
                    </>
                  ) : invested ? (
                    <>
                      <CheckCircle size={18} />
                      Already Activated
                    </>
                  ) : (
                    <>
                      Invest Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {bots.length === 0 && (
            <p className={styles.emptyState}>
              No bots available at the moment.
            </p>
          )}
        </div>
      ) : (
        /* My Bot Investments */
        <div>
          {investments.length === 0 ? (
            <div className={styles.emptyState}>
              <Monitor size={48} className={styles.emptyIcon} />
              <h3>No Bot Investments</h3>
              <p>You haven&apos;t invested in any bots yet.</p>
              <button
                className={styles.browseBtn}
                onClick={() => setActiveTab("all")}
              >
                Browse Bots
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.investmentsList}>
              {investments.map((inv) => (
                <div key={inv.id} className={styles.investmentCard}>
                  <div className={styles.investmentHeader}>
                    <div className={styles.investmentIcon}>
                      <Monitor size={20} />
                    </div>
                    <div className={styles.investmentInfo}>
                      <h4 className={styles.investmentName}>{inv.plan_name}</h4>
                      <span className={styles.investmentMeta}>
                        {inv.daily_interest_rate}% Daily · {inv.days_duration}{" "}
                        days
                      </span>
                    </div>
                    {getStatusBadge(inv.status)}
                  </div>

                  <div className={styles.investmentDetails}>
                    <div className={styles.investmentStat}>
                      <span className={styles.investmentLabel}>Invested</span>
                      <span className={styles.investmentValue}>
                        {currency}
                        {formatCurrency(inv.amount_invested)}
                      </span>
                    </div>
                    <div className={styles.investmentStat}>
                      <span className={styles.investmentLabel}>
                        Current Value
                      </span>
                      <span className={styles.investmentValue}>
                        {currency}
                        {formatCurrency(inv.current_value)}
                      </span>
                    </div>

                    <div className={styles.investmentStat}>
                      <span className={styles.investmentLabel}>Progress</span>
                      <div className={styles.progressWrapper}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${Math.min(inv.progress, 100)}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>
                          {/* {inv.progress}% */}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.investmentFooter}>
                    <span className={styles.investmentDate}>
                      Started: {formatDate(inv.start_date)}
                    </span>
                    <span className={styles.investmentDate}>
                      Matures: {formatDate(inv.end_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
