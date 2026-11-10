"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./dashboard.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RecentActivity() {
  const router = useRouter();
  const user = useMe();
  const userData = user.data?.user;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User currency
  const userCurrencySymbol =
    typeof userData?.currency === "string" && userData.currency.trim()
      ? userData.currency.trim()
      : "$";

  // Get currency code
  const getCurrencyCode = (symbol) => {
    const map = {
      $: "USD",
      "£": "GBP",
      "€": "EUR",
      "¥": "JPY",
      "₦": "NGN",
      R$: "BRL",
      "₹": "INR",
      "₿": "BTC",
    };
    return map[symbol] || symbol || "USD";
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numericValue = Number(amount) || 0;
    const symbol = userCurrencySymbol;
    const formatted = Math.abs(numericValue).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Format amount with asset
  // Format amount with asset and currency symbol
  const formatAmountWithAsset = (amount, asset) => {
    const numericValue = Number(amount) || 0;
    const sign = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";
    const absAmount = Math.abs(numericValue).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
    return `${sign}${userCurrencySymbol}${absAmount} ${asset}`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: "5",
        page: "1",
      });

      const response = await api.get(`/user/transactions.php?${params}`);
      const res = response.data;

      if (res?.success) {
        setTransactions(res.data?.transactions || []);
      } else {
        const message = res?.message || "Failed to load recent activity";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Failed to fetch recent transactions:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load recent activity";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecentTransactions();
  }, []);

  // Format transactions for display
  const formattedTransactions = useMemo(() => {
    const currencyCode = getCurrencyCode(userCurrencySymbol);

    return transactions.map((tx) => {
      const displayType = tx.type || "Unknown";
      const method = String(tx.method || "").toLowerCase();
      const numericAmount = Number(tx.amount) || 0;
      const asset = tx.coin_name || tx.asset || tx.rate || currencyCode;

      let amount;
      let isReceived = false;
      let isSent = false;
      let isSwap = false;

      if (method === "credit") {
        amount = Math.abs(numericAmount);
        isReceived = true;
      } else if (method === "debit") {
        amount = -Math.abs(numericAmount);
        isSent = true;
      } else {
        amount = numericAmount;
        if (amount > 0) isReceived = true;
        else if (amount < 0) isSent = true;
      }

      // Check if it's a swap/trade
      const typeLower = String(displayType).toLowerCase();
      if (
        typeLower.includes("swap") ||
        typeLower.includes("trade") ||
        typeLower === "swap" ||
        typeLower === "trade"
      ) {
        isSwap = true;
      }

      const transactionDate =
        tx.createdAt ||
        tx.created_at ||
        tx.trans_time ||
        tx.trade_date ||
        tx.date;

      return {
        id: tx.id,
        type: displayType,
        label: `${displayType} ${asset}`,
        sublabel: isReceived ? "Received" : isSent ? "Sent" : "Transaction",
        amount: amount,
        asset: asset,
        fiat: formatCurrency(amount),
        time: formatTime(transactionDate),
        isReceived,
        isSent,
        isSwap,
        raw: tx,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, userCurrencySymbol]);

  // Loading state
  if (loading) {
    return (
      <div className={styles["activity-panel"]}>
        <div className={styles["activity-header"]}>
          <h3>Recent Activity</h3>
          <button
            className={styles["view-all"]}
            onClick={() => router.push("/dashboard/transactions")}
          >
            View all
          </button>
        </div>
        <div className={styles["tx-list"]}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles["tx-row"]}>
              <div className={styles["skeleton-icon-small"]} />
              <div className={styles["skeleton-content"]}>
                <div className={styles["skeleton-title-small"]} />
                <div className={styles["skeleton-sub-small"]} />
              </div>
              <div className={styles["skeleton-right-small"]}>
                <div className={styles["skeleton-amount-small"]} />
                <div className={styles["skeleton-time-small"]} />
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
      <div className={styles["activity-panel"]}>
        <div className={styles["activity-header"]}>
          <h3>Recent Activity</h3>
          <button
            className={styles["view-all"]}
            onClick={() => router.push("/dashboard/transactions")}
          >
            View all
          </button>
        </div>
        <div className={styles["tx-list"]}>
          <div
            className={styles["tx-row"]}
            style={{ justifyContent: "center" }}
          >
            <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>
              Failed to load
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["activity-panel"]}>
      <div className={styles["activity-header"]}>
        <h3>Recent Activity</h3>
        <button
          className={styles["view-all"]}
          onClick={() => router.push("/dashboard/transactions")}
        >
          View all
        </button>
      </div>

      <div className={styles["tx-list"]}>
        {formattedTransactions.length === 0 ? (
          <div
            className={styles["tx-row"]}
            style={{ justifyContent: "center" }}
          >
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              No recent activity
            </span>
          </div>
        ) : (
          formattedTransactions.map((tx) => (
            <div key={tx.id} className={styles["tx-row"]}>
              <div
                className={cx(
                  styles["tx-icon"],
                  tx.isSent && styles.sent,
                  tx.isReceived && styles.received,
                )}
              >
                {tx.isReceived ? (
                  <ArrowDownLeft size={16} />
                ) : tx.isSent ? (
                  <ArrowUpRight size={16} />
                ) : tx.isSwap ? (
                  <RefreshCw size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
              </div>

              <div className={styles["tx-meta"]}>
                <span className={`capitalize ${styles["tx-label"]}`}>
                  {tx.label}
                </span>
                <span className={styles["tx-sub"]}>{tx.sublabel}</span>
              </div>

              <div className={styles["tx-amounts"]}>
                <span
                  className={cx(
                    styles["tx-amount"],
                    tx.isReceived && styles.positive,
                  )}
                >
                  {formatAmountWithAsset(tx.amount, tx.asset)}
                </span>
                <span className={styles["tx-time"]}>{tx.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
