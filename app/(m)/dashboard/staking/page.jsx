"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Coins,
  Lock,
  Unlock,
  TrendingUp,
  Info,
  Loader2,
  X,
  Bookmark,
  List,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./staking.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function StakingPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [plans, setPlans] = useState([]);
  const [stakedRecords, setStakedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStakesLoading, setIsStakesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my-stakes"
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORIES = [
    { id: "all", label: "All Pools" },
    { id: "Flexible", label: "Flexible" },
    { id: "Locked", label: "Locked" },
  ];

  // Fetch staking plans
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/staking-plans.php");
      const res = response.data;
      if (res.success) {
        setPlans(res.data || []);
      } else {
        toast.error(res.message || "Failed to load staking plans");
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      toast.error("Failed to load staking plans");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's staked records
  const fetchStakedRecords = async () => {
    if (!userData) return;
    setIsStakesLoading(true);
    try {
      const response = await api.get(
        `/user/user-stakes.php?userid=${userData.userid}`,
      );
      const res = response.data;
      if (res.success) {
        setStakedRecords(res.data || []);
      } else {
        toast.error(res.message || "Failed to load staked records");
      }
    } catch (err) {
      console.error("Failed to fetch staked records:", err);
      toast.error("Failed to load staked records");
    } finally {
      setIsStakesLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    if (userData) {
      fetchStakedRecords();
    }
  }, [userData]);

  const counts = useMemo(() => {
    const map = { all: plans.length };
    for (const p of plans) {
      map[p.type] = (map[p.type] ?? 0) + 1;
    }
    return map;
  }, [plans]);

  const visiblePlans = useMemo(() => {
    return activeCategory === "all"
      ? plans
      : plans.filter((p) => p.type === activeCategory);
  }, [plans, activeCategory]);

  function openStakeModal(plan) {
    setSelectedPlan(plan);
    setStakeAmount("");
    setShowStakeModal(true);
  }

  function closeStakeModal() {
    setShowStakeModal(false);
    setSelectedPlan(null);
    setStakeAmount("");
  }

  async function handleStake() {
    if (!selectedPlan) return;

    toast.dismiss();

    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < selectedPlan.min_amount) {
      toast.error(
        `Minimum stake is ${currency}${selectedPlan.min_amount} ${selectedPlan.coin}`,
      );
      return;
    }

    if (selectedPlan.max_amount && amount > selectedPlan.max_amount) {
      toast.error(
        `Maximum stake is ${currency}${selectedPlan.max_amount} ${selectedPlan.coin}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/user/stake-now.php", {
        plan_id: selectedPlan.id,
        amount: amount,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Staking started successfully!");
        closeStakeModal();
        await fetchPlans();
        await fetchStakedRecords();
      } else {
        toast.error(res.message || "Failed to stake");
      }
    } catch (error) {
      console.error("Stake error:", error);
      const errorMsg = error.response?.data?.message || "Failed to stake";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get lock label
  const getLockLabel = (plan) => {
    if (!plan) return "";
    if (plan.type === "Flexible") return "Flexible";
    return plan.lock_period ? `${plan.lock_period} Days` : "Locked";
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return currency + "0.00";
    return (
      currency +
      Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00 00:00:00") return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            <CheckCircle size={12} />
            Active
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
            <Clock size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusUnknown}`}>
            {status || "Unknown"}
          </span>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Staking</h1>
            <p className={styles.subtitle}>Loading staking plans...</p>
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
          <h1 className={styles.title}>Staking</h1>
          <p className={styles.subtitle}>
            Earn passive rewards by staking your crypto
          </p>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>{plans.length}</span>
            <span className={styles.headerStatLabel}>Total Plans</span>
          </div>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>
              {stakedRecords.length}
            </span>
            <span className={styles.headerStatLabel}>My Stakes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
            activeTab === "my-stakes" ? styles.tabBtnActive : ""
          }`}
          onClick={() => {
            setActiveTab("my-stakes");
            if (userData) fetchStakedRecords();
          }}
        >
          <Bookmark size={18} />
          My Stakes
          <span className={styles.tabCount}>{stakedRecords.length}</span>
        </button>
      </div>

      {activeTab === "all" ? (
        <>
          {/* Category Filter */}
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

          {/* Plans Grid */}
          <div className={styles.grid}>
            {visiblePlans.map((plan) => {
              const isFlexible = plan.type === "Flexible";
              const maxDisplay = plan.max_amount
                ? formatCurrency(plan.max_amount)
                : "∞";
              const lockLabel = getLockLabel(plan);

              return (
                <div key={plan.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.coinIcon}>
                      {plan.coin_photo ? (
                        <img
                          src={plan.coin_photo}
                          alt={plan.coin}
                          className={styles.coinImage}
                        />
                      ) : (
                        <Coins size={20} />
                      )}
                    </span>
                    <div className={styles.coinHeading}>
                      <h3 className={styles.coinName}>{plan.name}</h3>
                      <p className={styles.coinSubtitle}>{plan.coin}</p>
                    </div>
                    <span
                      className={`${styles.lockBadge} ${
                        isFlexible
                          ? styles.lockBadgeFlexible
                          : styles.lockBadgeLocked
                      }`}
                    >
                      {isFlexible ? <Unlock size={12} /> : <Lock size={12} />}
                      {lockLabel}
                    </span>
                  </div>

                  <div className={styles.apyBox}>
                    <span className={styles.apyLabel}>
                      <TrendingUp size={14} /> Estimated APY
                    </span>
                    <span className={styles.apyValue}>{plan.percent}%</span>
                  </div>

                  <div className={styles.infoGrid}>
                    <div>
                      <span className={styles.infoLabel}>Min Stake</span>
                      <span className={styles.infoValue}>
                        {formatCurrency(plan.min_amount)} {plan.coin}
                      </span>
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Max Stake</span>
                      <span className={styles.infoValue}>
                        {maxDisplay} {plan.coin}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.stakeBtn}
                    onClick={() => openStakeModal(plan)}
                  >
                    Stake Now
                  </button>
                </div>
              );
            })}

            {visiblePlans.length === 0 && (
              <p className={styles.emptyState}>
                No staking plans in this category yet.
              </p>
            )}
          </div>
        </>
      ) : (
        /* My Stakes Tab */
        <div className={styles.stakesContainer}>
          {isStakesLoading ? (
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} />
              <p>Loading your stakes...</p>
            </div>
          ) : stakedRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <Bookmark size={48} className={styles.emptyIcon} />
              <h3>No Stakes Found</h3>
              <p>You haven&apos;t staked any assets yet.</p>
              <button
                className={styles.browseBtn}
                onClick={() => setActiveTab("all")}
              >
                Browse Plans
              </button>
            </div>
          ) : (
            <div className={styles.stakesList}>
              {stakedRecords.map((stake) => (
                <div key={stake.id} className={styles.stakeCard}>
                  <div className={styles.stakeHeader}>
                    <div className={styles.stakeIcon}>
                      <Coins size={18} />
                    </div>
                    <div className={styles.stakeInfo}>
                      <h4 className={styles.stakeTitle}>{stake.title}</h4>
                      <span className={styles.stakeMeta}>
                        {stake.apy}% APY · {stake.lock_period} days
                      </span>
                    </div>
                    {getStatusBadge(stake.status)}
                  </div>

                  <div className={styles.stakeDetails}>
                    <div className={styles.stakeStat}>
                      <span className={styles.stakeLabel}>Amount Staked</span>
                      <span className={styles.stakeValue}>
                        {formatCurrency(stake.amount)} {stake.coin || "SOL"}
                      </span>
                    </div>
                    <div className={styles.stakeStat}>
                      <span className={styles.stakeLabel}>Start Date</span>
                      <span className={styles.stakeValue}>
                        <Calendar size={14} />
                        {formatDate(stake.start_date)}
                      </span>
                    </div>
                    <div className={styles.stakeStat}>
                      <span className={styles.stakeLabel}>Lock Period</span>
                      <span className={styles.stakeValue}>
                        <Lock size={14} />
                        {stake.lock_period} days
                      </span>
                    </div>
                  </div>

                  <div className={styles.stakeFooter}>
                    <span className={styles.stakeId}>ID: #{stake.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stake Modal */}
      {showStakeModal && selectedPlan && (
        <div
          className={styles.modalOverlay}
          onClick={closeStakeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.stakeModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3>Stake {selectedPlan.coin}</h3>
                <p className={styles.modalSubtitle}>
                  {selectedPlan.name} - {selectedPlan.percent}% APY
                </p>
              </div>
              <button
                className={styles.modalClose}
                onClick={closeStakeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Plan Info */}
              <div className={styles.planInfo}>
                <div className={styles.planInfoRow}>
                  <span className={styles.planInfoLabel}>Plan</span>
                  <span className={styles.planInfoValue}>
                    {selectedPlan.name}
                  </span>
                </div>
                <div className={styles.planInfoRow}>
                  <span className={styles.planInfoLabel}>Coin</span>
                  <span className={styles.planInfoValue}>
                    {selectedPlan.coin}
                  </span>
                </div>
                <div className={styles.planInfoRow}>
                  <span className={styles.planInfoLabel}>APY</span>
                  <span className={styles.planInfoValue}>
                    {selectedPlan.percent}%
                  </span>
                </div>
                <div className={styles.planInfoRow}>
                  <span className={styles.planInfoLabel}>Lock Period</span>
                  <span className={styles.planInfoValue}>
                    {getLockLabel(selectedPlan)}
                  </span>
                </div>
                <div className={styles.planInfoRow}>
                  <span className={styles.planInfoLabel}>Min / Max</span>
                  <span className={styles.planInfoValue}>
                    {formatCurrency(selectedPlan.min_amount)} /{" "}
                    {selectedPlan.max_amount
                      ? formatCurrency(selectedPlan.max_amount)
                      : "∞"}{" "}
                    {selectedPlan.coin}
                  </span>
                </div>
              </div>

              {/* Stake Amount */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  Amount to Stake ({selectedPlan.coin})
                </label>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.currencySymbol}>{currency}</span>
                  <input
                    type="number"
                    className={styles.fieldInput}
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className={styles.amountSuffix}>
                    {selectedPlan.coin}
                  </span>
                </div>
                <div className={styles.fieldHint}>
                  Min: {formatCurrency(selectedPlan.min_amount)} | Max:{" "}
                  {selectedPlan.max_amount
                    ? formatCurrency(selectedPlan.max_amount)
                    : "∞"}{" "}
                  {selectedPlan.coin}
                </div>
              </div>

              {/* Info Box */}
              <div className={styles.infoBox}>
                <Info size={16} className={styles.infoIcon} />
                <span className={styles.infoText}>
                  {selectedPlan.type === "Flexible"
                    ? "You can unstake anytime. Rewards accrue daily."
                    : `Funds are locked for ${getLockLabel(selectedPlan).toLowerCase()}.`}
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={closeStakeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleStake}
                disabled={
                  isSubmitting || !stakeAmount || parseFloat(stakeAmount) <= 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Staking...
                  </>
                ) : (
                  "Stake Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
