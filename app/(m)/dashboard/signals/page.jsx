"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  List,
  Bookmark,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./signals.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function SignalsPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [signals, setSignals] = useState([]);
  const [subscribedSignals, setSubscribedSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribedLoading, setIsSubscribedLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subscribingId, setSubscribingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "subscribed"

  // Categories for filtering
  const categories = [
    { id: "all", label: "All Signals" },
    { id: "Premium", label: "⭐ Premium" },
    { id: "Standard", label: "Standard" },
    { id: "Basic", label: "Basic" },
  ];

  // Fetch signals
  const fetchSignals = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/user-signals.php?status=all`);
      const res = response.data;

      if (res.success) {
        setSignals(res.data || []);
      } else {
        throw new Error(res.message || "Failed to load signals");
      }
    } catch (err) {
      console.error("Failed to fetch signals:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load signals",
      );
      toast.error("Failed to load signals");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscribed signals
  const fetchSubscribedSignals = async () => {
    if (!userData) return;

    setIsSubscribedLoading(true);

    try {
      const response = await api.get(
        `/user/user-signal-subscribed.php?userid=${userData.userid}`,
      );
      const res = response.data;

      if (res.success) {
        setSubscribedSignals(res.data || []);
      } else {
        throw new Error(res.message || "Failed to load subscribed signals");
      }
    } catch (err) {
      console.error("Failed to fetch subscribed signals:", err);
      toast.error("Failed to load subscribed signals");
    } finally {
      setIsSubscribedLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    if (userData) {
      fetchSubscribedSignals();
    }
  }, [userData]);

  // Filter signals by category
  const filteredSignals = signals.filter((signal) => {
    if (selectedCategory === "all") return true;
    return signal.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Handle subscribe function
  const handleSubscribe = async (signalId, signalName, price) => {
    toast.dismiss();

    if (!userData) {
      toast.error("Please login to subscribe");
      return;
    }

    setSubscribingId(signalId);

    try {
      const response = await api.post("/user/user-signal-subscribe.php", {
        signal_id: signalId,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Successfully subscribed!");
        await fetchSignals();
        await fetchSubscribedSignals();
      } else {
        toast.error(res.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      const errorMsg = error.response?.data?.message || "Failed to subscribe";
      toast.error(errorMsg);
    } finally {
      setSubscribingId(null);
    }
  };

  // Format price with currency
  const formatPrice = (price) => {
    if (!price && price !== 0) return currency + "0.00";
    return (
      currency +
      Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get success rate color
  const getSuccessRateColor = (rate) => {
    const num = parseFloat(rate);
    if (num >= 80) return styles.rateHigh;
    if (num >= 60) return styles.rateMedium;
    return styles.rateLow;
  };

  // Get success rate icon
  const getSuccessRateIcon = (rate) => {
    const num = parseFloat(rate);
    if (num >= 80) return <Sparkles size={16} />;
    if (num >= 60) return <TrendingUp size={16} />;
    return <Target size={16} />;
  };

  // Check if signal is subscribed
  const isSubscribed = (signalId) => {
    return subscribedSignals.some((s) => s.signal_id === signalId);
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Trading Signals</h1>
            <p className={styles.subtitle}>
              Professional trading signals from expert analysts
            </p>
          </div>
        </div>

        {/* Tab Skeleton */}
        <div className={styles.tabRow}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className={`${styles.tabBtn} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
          ))}
        </div>

        <div className={styles.categoryRow}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`${styles.categoryPill} ${styles.skeleton}`}
            >
              <div className={styles.skeletonShimmer} />
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.signalCard} ${styles.skeleton}`}>
              <div className={styles.signalHeaderSkeleton}>
                <div className={styles.skeletonShimmer} />
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={styles.signalBodySkeleton}>
                <div className={styles.skeletonShimmer} />
                <div className={styles.skeletonShimmer} />
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={styles.signalFooterSkeleton}>
                <div className={styles.skeletonShimmer} />
                <div className={styles.skeletonShimmer} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Trading Signals</h1>
            <p className={styles.subtitle}>
              Professional trading signals from expert analysts
            </p>
          </div>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Failed to Load Signals</h3>
          <p>{error}</p>
          <button onClick={fetchSignals} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <TrendingUp size={28} className={styles.titleIcon} />
            Trading Signals
          </h1>
          <p className={styles.subtitle}>
            Professional trading signals from expert analysts
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>{signals.length}</span>
            <span className={styles.headerStatLabel}>Total Signals</span>
          </div>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>
              {signals.filter((s) => s.status === "active").length}
            </span>
            <span className={styles.headerStatLabel}>Active</span>
          </div>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>
              {subscribedSignals.length}
            </span>
            <span className={styles.headerStatLabel}>Subscribed</span>
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
          All Signals
          <span className={styles.tabCount}>{signals.length}</span>
        </button>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "subscribed" ? styles.tabBtnActive : ""
          }`}
          onClick={() => setActiveTab("subscribed")}
        >
          <Bookmark size={18} />
          My Subscriptions
          <span className={styles.tabCount}>{subscribedSignals.length}</span>
        </button>
      </div>

      {/* Category Filter (only for All Signals tab) */}
      {activeTab === "all" && (
        <div className={styles.categoryRow}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryPill} ${
                selectedCategory === cat.id ? styles.categoryPillActive : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
              {cat.id !== "all" && (
                <span className={styles.categoryCount}>
                  {signals.filter((s) => s.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Subscribed Signals Loading */}
      {activeTab === "subscribed" && isSubscribedLoading && (
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading your subscriptions...</p>
        </div>
      )}

      {/* Signals Grid */}
      {activeTab === "all" ? (
        // All Signals
        filteredSignals.length > 0 ? (
          <div className={styles.grid}>
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                className={`${styles.signalCard} ${
                  signal.status === "active"
                    ? styles.signalActive
                    : styles.signalInactive
                } ${isSubscribed(signal.id) ? styles.signalSubscribed : ""}`}
              >
                {/* Status Badge */}
                <div className={styles.signalStatus}>
                  <span
                    className={`${styles.statusBadge} ${
                      signal.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {signal.status === "active" ? (
                      <>
                        <CheckCircle size={12} />
                        Active
                      </>
                    ) : (
                      <>
                        <Clock size={12} />
                        Inactive
                      </>
                    )}
                  </span>
                  {isSubscribed(signal.id) && (
                    <span className={styles.subscribedBadge}>
                      <Bookmark size={12} />
                      Subscribed
                    </span>
                  )}
                </div>

                {/* Plan Name */}
                <h3 className={styles.signalName}>{signal.plan_name}</h3>

                {/* Category */}
                <div className={styles.signalCategory}>
                  <span className={styles.categoryTag}>{signal.category}</span>
                </div>

                {/* Success Rate */}
                <div className={styles.rateContainer}>
                  <div className={styles.rateCircle}>
                    <div
                      className={`${styles.rateValue} ${getSuccessRateColor(
                        signal.success_rate,
                      )}`}
                    >
                      {getSuccessRateIcon(signal.success_rate)}
                      {signal.success_rate}%
                    </div>
                  </div>
                  <span className={styles.rateLabel}>Success Rate</span>
                </div>

                {/* Description */}
                <p className={styles.signalDescription}>{signal.description}</p>

                {/* Features */}
                <div className={styles.features}>
                  {signal.text1 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text1}</span>
                    </div>
                  )}
                  {signal.text2 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text2}</span>
                    </div>
                  )}
                  {signal.text3 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text3}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.signalFooter}>
                  <div className={styles.priceContainer}>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.priceValue}>
                      {formatPrice(signal.price)}
                    </span>
                  </div>
                  <button
                    className={`${styles.subscribeBtn} ${
                      isSubscribed(signal.id)
                        ? styles.subscribedBtn
                        : signal.status === "active"
                          ? styles.subscribeActive
                          : styles.subscribeInactive
                    }`}
                    disabled={
                      signal.status !== "active" ||
                      subscribingId === signal.id ||
                      isSubscribed(signal.id)
                    }
                    onClick={() =>
                      handleSubscribe(signal.id, signal.plan_name, signal.price)
                    }
                  >
                    {subscribingId === signal.id ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} />
                        Subscribing...
                      </>
                    ) : isSubscribed(signal.id) ? (
                      <>
                        <CheckCircle size={16} />
                        Subscribed
                      </>
                    ) : signal.status === "active" ? (
                      <>
                        Subscribe
                        <ArrowRight size={16} />
                      </>
                    ) : (
                      "Unavailable"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Zap size={48} className={styles.emptyIcon} />
            <h3>No Signals Found</h3>
            <p>No trading signals available for the selected category.</p>
          </div>
        )
      ) : // Subscribed Signals
      subscribedSignals.length > 0 ? (
        <div className={styles.grid}>
          {subscribedSignals.map((sub) => {
            // Find the signal details from the signals list
            const signal = signals.find((s) => s.id === sub.signal_id);
            const displayName =
              signal?.plan_name || sub.name || "Unknown Signal";
            const displayPrice = signal?.price || sub.amount || 0;
            const displayCategory = signal?.category || "Signal";
            const displayRate = signal?.success_rate || "0";

            return (
              <div
                key={sub.id}
                className={`${styles.signalCard} ${styles.signalSubscribed}`}
              >
                {/* Status Badge */}
                <div className={styles.signalStatus}>
                  <span
                    className={`${styles.statusBadge} ${styles.statusActive}`}
                  >
                    <CheckCircle size={12} />
                    Active
                  </span>
                  <span className={styles.subscribedBadge}>
                    <Bookmark size={12} />
                    Subscribed
                  </span>
                </div>

                {/* Plan Name */}
                <h3 className={styles.signalName}>{displayName}</h3>

                {/* Category */}
                <div className={styles.signalCategory}>
                  <span className={styles.categoryTag}>{displayCategory}</span>
                </div>

                {/* Success Rate */}
                <div className={styles.rateContainer}>
                  <div className={styles.rateCircle}>
                    <div
                      className={`${styles.rateValue} ${getSuccessRateColor(
                        displayRate,
                      )}`}
                    >
                      {getSuccessRateIcon(displayRate)}
                      {displayRate}%
                    </div>
                  </div>
                  <span className={styles.rateLabel}>Success Rate</span>
                </div>

                {/* Description */}
                <p className={styles.signalDescription}>
                  {signal?.description || "Subscribed signal"}
                </p>

                {/* Features */}
                <div className={styles.features}>
                  {signal?.text1 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text1}</span>
                    </div>
                  )}
                  {signal?.text2 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text2}</span>
                    </div>
                  )}
                  {signal?.text3 && (
                    <div className={styles.feature}>
                      <CheckCircle size={14} className={styles.featureIcon} />
                      <span>{signal.text3}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.signalFooter}>
                  <div className={styles.priceContainer}>
                    <span className={styles.priceLabel}>Subscribed</span>
                    <span className={styles.priceValue}>
                      {formatPrice(displayPrice)}
                    </span>
                  </div>
                  <div className={styles.subscribedDate}>
                    <Clock size={14} />
                    {formatDate(sub.trans_time)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Bookmark size={48} className={styles.emptyIcon} />
          <h3>No Subscriptions</h3>
          <p>You haven&rsquo;t subscribed to any signals yet.</p>
          <button
            className={styles.browseBtn}
            onClick={() => setActiveTab("all")}
          >
            Browse Signals
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
