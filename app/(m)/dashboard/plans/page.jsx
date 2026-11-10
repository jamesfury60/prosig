"use client";

import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  TrendingUp,
  PiggyBank,
  Unlock,
  Lock,
  Sparkles,
  ShieldCheck,
  X,
  Check,
  Wallet,
  Percent,
  Layers,
  Inbox,
  Loader2,
  Calendar,
  Bookmark,
  List,
} from "lucide-react";
import styles from "./InvestmentPlans.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatNum(n, digits = 2) {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function InvestmentPlansPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestmentsLoading, setIsInvestmentsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "invested"

  // Fetch plans
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/plans-all.php");
      const res = response.data;
      if (res.success) {
        setPlans(res.data || []);
      } else {
        toast.error(res.message || "Failed to load plans");
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user investments
  const fetchInvestments = async () => {
    if (!userData) return;
    setIsInvestmentsLoading(true);
    try {
      const response = await api.get(
        `/user/user-investments.php?userid=${userData.userid}`,
      );
      const res = response.data;
      if (res.success) {
        setInvestments(res.data || []);
      } else {
        toast.error(res.message || "Failed to load investments");
      }
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      toast.error("Failed to load investments");
    } finally {
      setIsInvestmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    if (userData) {
      fetchInvestments();
    }
  }, [userData]);

  const stats = useMemo(() => {
    const active = investments.filter((i) => i.status === "active").length;
    const totalInvested = investments.reduce(
      (sum, i) => sum + i.amount_invested,
      0,
    );
    const totalEarned = investments.reduce(
      (sum, i) => sum + (i.profit_earned || 0),
      0,
    );
    const avgApy = investments.length
      ? investments.reduce((sum, i) => sum + i.daily_interest_rate, 0) /
        investments.length
      : 0;
    return {
      count: investments.length,
      active,
      avgApy,
      totalEarned,
      totalInvested,
    };
  }, [investments]);

  function openPlan(plan) {
    setSelectedPlan(plan);
    setAmount("");
    setError("");
  }

  function closeModal() {
    setSelectedPlan(null);
  }

  const numericAmount = parseFloat(amount) || 0;
  const projectedEarnings = selectedPlan
    ? (numericAmount *
        selectedPlan.daily_interest_rate *
        selectedPlan.days_duration) /
      100
    : 0;
  const projectedTotal = numericAmount + projectedEarnings;

  function handleQuickAmount(mult) {
    if (!selectedPlan) return;
    setAmount(String(selectedPlan.min_ins * mult));
    setError("");
  }

  async function handleConfirmInvest() {
    if (!selectedPlan) return;
    if (!numericAmount || numericAmount < selectedPlan.min_ins) {
      setError(`Minimum investment is ${currency}${selectedPlan.min_ins}.`);
      return;
    }

    setSubmitting(true);
    toast.dismiss();

    try {
      const response = await api.post("/user/invest.php", {
        plan_id: selectedPlan.id,
        amount: numericAmount,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Investment created successfully!");
        await fetchInvestments();
        closeModal();
      } else {
        toast.error(res.message || "Failed to create investment");
      }
    } catch (error) {
      console.error("Investment error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to create investment";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className={cx(styles.statusBadge, styles.statusActive)}>
            Active
          </span>
        );
      case "completed":
        return (
          <span className={cx(styles.statusBadge, styles.statusCompleted)}>
            Completed
          </span>
        );
      default:
        return (
          <span className={cx(styles.statusBadge, styles.statusUnknown)}>
            {status}
          </span>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles["page-container"]}>
        <div className={styles["page-header"]}>
          <div className={styles["header-icon"]}>
            <Layers size={22} />
          </div>
          <div>
            <h1 className={styles["page-title"]}>Investment Plans</h1>
            <p className={styles["page-subtitle"]}>Loading plans...</p>
          </div>
        </div>
        <div className={styles["plans-grid"]}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`${styles["plan-card"]} ${styles.skeleton}`}
            >
              <div className={styles.skeletonShimmer} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["page-container"]}>
      {/* Page Header */}
      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <Layers size={22} />
        </div>
        <div>
          <h1 className={styles["page-title"]}>Investment Plans</h1>
          <p className={styles["page-subtitle"]}>
            Put your assets to work with flexible and fixed-term earning plans.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-icon"]}>
            <Layers size={17} />
          </div>
          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Active Plans</span>
            <span className={styles["stat-value"]}>{stats.active}</span>
          </div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={cx(styles["stat-icon"], styles.success)}>
            <TrendingUp size={17} />
          </div>
          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Total Earned</span>
            <span className={styles["stat-value"]}>
              {currency}
              {formatNum(stats.totalEarned)}
            </span>
          </div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-icon"]}>
            <Percent size={17} />
          </div>
          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Avg. Daily Rate</span>
            <span className={styles["stat-value"]}>
              {formatNum(stats.avgApy, 1)}%
            </span>
          </div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={cx(styles["stat-icon"], styles.neutral)}>
            <Wallet size={17} />
          </div>
          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Total Invested</span>
            <span className={styles["stat-value"]}>
              {currency}
              {formatNum(stats.totalInvested)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "all" ? styles.tabBtnActive : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          <List size={18} />
          All Plans
          <span className={styles.tabCount}>{plans.length}</span>
        </button>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "invested" ? styles.tabBtnActive : ""
          }`}
          onClick={() => setActiveTab("invested")}
        >
          <Bookmark size={18} />
          My Investments
          <span className={styles.tabCount}>{investments.length}</span>
        </button>
      </div>

      {activeTab === "all" ? (
        /* Available Plans */
        <div>
          <div className={styles["plans-grid"]}>
            {plans.map((plan) => {
              const isSubscribed = investments.some(
                (inv) => inv.plan_id === plan.id && inv.status === "active",
              );
              return (
                <div
                  key={plan.id}
                  className={cx(
                    styles["plan-card"],
                    isSubscribed && styles.subscribed,
                  )}
                >
                  <div className={styles["plan-top"]}>
                    <div className={styles["plan-icon"]}>
                      <PiggyBank size={20} />
                    </div>
                    {isSubscribed && (
                      <span className={styles["plan-featured-badge"]}>
                        <Check size={12} /> Invested
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className={styles["plan-name"]}>{plan.plan_name}</h3>
                    <p className={styles["plan-desc"]}>{plan.plan_des}</p>
                  </div>

                  <div className={styles["plan-apy-row"]}>
                    <span className={styles["plan-apy-value"]}>
                      {plan.daily_interest_rate}%
                    </span>
                    <span className={styles["plan-apy-label"]}>
                      Daily Interest
                    </span>
                  </div>

                  <div className={styles["plan-details"]}>
                    <div className={styles["plan-detail"]}>
                      <span className={styles["plan-detail-label"]}>
                        Duration
                      </span>
                      <span className={styles["plan-detail-value"]}>
                        {plan.days_duration} days
                      </span>
                    </div>
                    <div className={styles["plan-detail"]}>
                      <span className={styles["plan-detail-label"]}>
                        Min. Amount
                      </span>
                      <span className={styles["plan-detail-value"]}>
                        {currency}
                        {formatNum(plan.min_ins)}
                      </span>
                    </div>
                    <div className={styles["plan-detail"]}>
                      <span className={styles["plan-detail-label"]}>
                        Total Return
                      </span>
                      <span className={styles["plan-detail-value"]}>
                        {plan.total_return_percentage}%
                      </span>
                    </div>
                    <div className={styles["plan-detail"]}>
                      <span className={styles["plan-detail-label"]}>
                        Max Earn
                      </span>
                      <span className={styles["plan-detail-value"]}>
                        {plan.max_earn}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={cx(
                      styles["btn-invest"],
                      isSubscribed && styles.btnSubscribed,
                    )}
                    onClick={() => openPlan(plan)}
                    disabled={isSubscribed}
                  >
                    {isSubscribed ? "Already Invested" : "Invest Now"}
                  </button>
                </div>
              );
            })}
          </div>

          {plans.length === 0 && (
            <div className={styles["empty-state"]}>
              <div className={styles["empty-icon"]}>
                <Inbox size={22} />
              </div>
              <p className={styles["empty-title"]}>No plans available</p>
              <p className={styles["empty-desc"]}>
                Check back later for new investment opportunities.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* My Investments Tab */
        <div className={styles.panel}>
          {isInvestmentsLoading ? (
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} />
              <p>Loading your investments...</p>
            </div>
          ) : investments.length === 0 ? (
            <div className={styles["empty-state"]}>
              <div className={styles["empty-icon"]}>
                <Inbox size={22} />
              </div>
              <p className={styles["empty-title"]}>No investments yet</p>
              <p className={styles["empty-desc"]}>
                Choose a plan above to start earning on your assets.
              </p>
            </div>
          ) : (
            <div className={styles["investments-list"]}>
              {investments.map((inv) => (
                <div key={inv.id} className={styles["investment-row"]}>
                  <div className={styles["investment-icon"]}>
                    <Layers size={16} />
                  </div>

                  <div className={styles["investment-meta"]}>
                    <div className={styles["investment-title-row"]}>
                      <span className={styles["investment-title"]}>
                        {inv.plan_name}
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <span className={styles["investment-sub"]}>
                      {inv.daily_interest_rate}% Daily · Started{" "}
                      {new Date(inv.start_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles["investment-progress-wrap"]}>
                    <div className={styles["progress-track"]}>
                      <div
                        className={cx(
                          styles["progress-fill"],
                          inv.status === "completed" && styles.matured,
                        )}
                        style={{ width: `${inv.progress}%` }}
                      />
                    </div>
                    <div className={styles["progress-meta"]}>
                      <span>
                        {inv.status === "completed"
                          ? "Completed"
                          : `${inv.days_elapsed}/${inv.days_duration} days`}
                      </span>
                      <span>{inv.progress}%</span>
                    </div>
                  </div>

                  <div className={styles["investment-values"]}>
                    <span className={styles["investment-value"]}>
                      {currency}
                      {formatNum(inv.current_value)}
                    </span>
                    <span
                      className={cx(
                        styles["investment-gain"],
                        inv.profit_earned >= 0
                          ? styles.positive
                          : styles.negative,
                      )}
                    >
                      {inv.profit_earned >= 0 ? "+" : ""}
                      {currency}
                      {formatNum(inv.profit_earned)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invest Modal */}
      {selectedPlan && (
        <div className={styles["modal-overlay"]} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles["modal-header"]}>
              <div>
                <h3>Invest in {selectedPlan.plan_name}</h3>
                <p>
                  {selectedPlan.daily_interest_rate}% Daily ·{" "}
                  {selectedPlan.days_duration} days
                </p>
              </div>
              <button
                className={styles["modal-close"]}
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.field}>
              <label className={styles["field-label"]}>
                Amount ({currency})
              </label>
              <div className={styles["amount-input-wrapper"]}>
                <input
                  type="number"
                  className={styles["field-input"]}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError("");
                  }}
                />
                <span className={styles["amount-asset"]}>USDT</span>
              </div>
              {error ? (
                <span className={styles["error-text"]}>{error}</span>
              ) : (
                <span className={styles["field-hint"]}>
                  Minimum {currency}
                  {selectedPlan.min_ins}
                </span>
              )}
              <div className={styles["quick-amounts"]}>
                <button
                  type="button"
                  className={styles["quick-amount-btn"]}
                  onClick={() => handleQuickAmount(1)}
                >
                  Min
                </button>
                <button
                  type="button"
                  className={styles["quick-amount-btn"]}
                  onClick={() => handleQuickAmount(5)}
                >
                  5x Min
                </button>
                <button
                  type="button"
                  className={styles["quick-amount-btn"]}
                  onClick={() => handleQuickAmount(10)}
                >
                  10x Min
                </button>
              </div>
            </div>

            <div className={styles["summary-box"]}>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>Duration</span>
                <span className={styles["summary-value"]}>
                  {selectedPlan.days_duration} days
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>Daily Rate</span>
                <span className={styles["summary-value"]}>
                  {selectedPlan.daily_interest_rate}%
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>Total Return</span>
                <span className={styles["summary-value"]}>
                  {selectedPlan.total_return_percentage}%
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>
                  Estimated earnings
                </span>
                <span className={styles["summary-value"]}>
                  {currency}
                  {formatNum(projectedEarnings)}
                </span>
              </div>
              <div className={cx(styles["summary-row"], styles.highlight)}>
                <span className={styles["summary-key"]}>Total at maturity</span>
                <span className={styles["summary-value"]}>
                  {currency}
                  {formatNum(projectedTotal)}
                </span>
              </div>
            </div>

            <div className={styles["modal-actions"]}>
              <button
                type="button"
                className={styles["btn-secondary"]}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles["btn-primary"]}
                onClick={handleConfirmInvest}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} />
                    Confirming...
                  </>
                ) : (
                  <>
                    <span className="flex flex-row justify-center">
                      Confirm Investment
                      <Check size={15} style={{ marginLeft: 6 }} />
                    </span>
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
