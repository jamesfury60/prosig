"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  History,
  Search,
  Download,
  ArrowUpFromLine,
  ArrowDownToLine,
  Repeat,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
  ArrowRightLeft,
  Coins,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./TransactionHistory.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| Type metadata
|--------------------------------------------------------------------------
| IMPORTANT:
| This does NOT replace the database type.
|
| It is ONLY used to determine the icon and visual style.
|
| Any type from the database is allowed.
|--------------------------------------------------------------------------
*/
const TYPE_META = {
  deposit: {
    icon: ArrowDownToLine,
    cls: "receive",
  },

  payout: {
    icon: ArrowUpFromLine,
    cls: "send",
  },

  withdrawal: {
    icon: ArrowUpFromLine,
    cls: "send",
  },

  transfer: {
    icon: ArrowRightLeft,
    cls: "swap",
  },

  trade: {
    icon: Coins,
    cls: "stake",
  },

  stake: {
    icon: Layers,
    cls: "stake",
  },
};

/*
|--------------------------------------------------------------------------
| Default metadata for any unknown database type
|--------------------------------------------------------------------------
*/
const DEFAULT_TYPE_META = {
  icon: Repeat,
  cls: "swap",
};

const PAGE_SIZE = 6;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TransactionHistoryPage() {
  const user = useMe();
  const userData = user.data?.user;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: PAGE_SIZE,
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | User currency
  |--------------------------------------------------------------------------
  */
  const userCurrencySymbol =
    typeof userData?.currency === "string" && userData.currency.trim()
      ? userData.currency.trim()
      : "$";

  /*
  |--------------------------------------------------------------------------
  | Get currency code
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | Format fiat currency
  |--------------------------------------------------------------------------
  */
  const formatCurrency = (amount) => {
    const numericValue = Number(amount) || 0;

    const symbol = userCurrencySymbol;

    const formatted = Math.abs(numericValue).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Format amount with asset
  |--------------------------------------------------------------------------
  |
  | Example:
  | +22 GBP
  | -22 GBP
  |
  |--------------------------------------------------------------------------
  */
  const formatAmountWithAsset = (amount, asset) => {
    const numericValue = Number(amount) || 0;

    const sign = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";

    const absAmount = Math.abs(numericValue).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });

    return `${sign}${absAmount} ${asset}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Format date/time
  |--------------------------------------------------------------------------
  |
  | Examples:
  |
  | Today, Aug 23, 2026 at 8:15 PM
  | Yesterday, Aug 22, 2026 at 4:30 PM
  | Aug 20, 2026 at 10:45 AM
  |
  |--------------------------------------------------------------------------
  */
  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const differenceInDays = Math.round(
      (startOfToday - startOfDate) / (1000 * 60 * 60 * 24),
    );

    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (differenceInDays === 0) {
      return `Today, ${formattedDate} at ${time}`;
    }

    if (differenceInDays === 1) {
      return `Yesterday, ${formattedDate} at ${time}`;
    }

    return `${formattedDate} at ${time}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch transactions
  |--------------------------------------------------------------------------
  */
  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      /*
       * Send type to API only when selected.
       *
       * The value remains exactly what came from the database.
       */
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await api.get(
        `/user/transactions.php?${params.toString()}`,
      );

      const res = response.data;

      if (res?.success) {
        setTransactions(res.data?.transactions || []);

        setPagination(
          res.data?.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: PAGE_SIZE,
          },
        );
      } else {
        const message = res?.message || "Failed to load transactions";

        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load transactions";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load transactions
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | Format transactions
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | tx.type is NEVER replaced.
  |
  | If database says:
  |
  | DEPOSIT
  | PAYOUT
  | DEMO TRADE
  | BONUS
  | PROFIT
  |
  | those exact values remain.
  |--------------------------------------------------------------------------
  */
  const formattedTransactions = useMemo(() => {
    const currencyCode = getCurrencyCode(userCurrencySymbol);

    return transactions.map((tx) => {
      /*
       * Keep exact database type.
       */
      const displayType = tx.type || "Unknown";

      /*
       * Only normalize a COPY of the type for
       * icon/style lookup.
       */
      const typeKey = String(displayType).toLowerCase();

      /*
       * Determine asset.
       */
      const asset = tx.coin_name || tx.asset || tx.rate || currencyCode;

      /*
       * Determine transaction direction.
       *
       * Credit = positive
       * Everything else = negative
       */
      const method = String(tx.method || "").toLowerCase();

      const numericAmount = Number(tx.amount) || 0;

      let amount;

      if (method === "credit") {
        amount = Math.abs(numericAmount);
      } else if (method === "debit") {
        amount = -Math.abs(numericAmount);
      } else {
        /*
         * If your API already returns signed amounts,
         * preserve that sign.
         */
        amount = numericAmount;
      }

      /*
       * Date field compatibility.
       */
      const transactionDate =
        tx.createdAt ||
        tx.created_at ||
        tx.trans_time ||
        tx.trade_date ||
        tx.date;

      return {
        id: tx.id,

        /*
         * EXACT database type.
         */
        type: displayType,

        /*
         * Used only for icon/style.
         */
        iconType: typeKey,

        /*
         * Keep the original database type in title.
         */
        title: `${displayType} • ${asset}`,

        asset,

        amount,

        status: String(tx.status || "pending").toLowerCase(),

        date: formatDate(transactionDate),

        hash: tx.trans_id
          ? `0x...${String(tx.trans_id).slice(-6)}`
          : "0x...000000",

        raw: tx,
      };
    });
  }, [transactions, userCurrencySymbol]);

  /*
  |--------------------------------------------------------------------------
  | Available database types
  |--------------------------------------------------------------------------
  |
  | This allows ANY type to appear in the filter.
  |--------------------------------------------------------------------------
  */
  const availableTypes = useMemo(() => {
    const types = transactions
      .map((tx) => tx.type)
      .filter(
        (type) =>
          type !== null && type !== undefined && String(type).trim() !== "",
      )
      .map((type) => String(type));

    return [...new Set(types)];
  }, [transactions]);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */
  const stats = useMemo(() => {
    const total = formattedTransactions.length;

    const sent = formattedTransactions.filter((tx) => tx.amount < 0).length;

    const received = formattedTransactions.filter((tx) => tx.amount > 0).length;

    return {
      total,
      sent,
      received,
    };
  }, [formattedTransactions]);

  /*
  |--------------------------------------------------------------------------
  | Client-side filtering
  |--------------------------------------------------------------------------
  */
  const filtered = useMemo(() => {
    return formattedTransactions.filter((tx) => {
      /*
       * Do NOT lowercase or transform tx.type here.
       */
      if (typeFilter !== "all" && String(tx.type) !== String(typeFilter)) {
        return false;
      }

      if (statusFilter !== "all" && tx.status !== statusFilter) {
        return false;
      }

      if (search) {
        const q = search.toLowerCase();

        const title = String(tx.title || "").toLowerCase();
        const hash = String(tx.hash || "").toLowerCase();
        const asset = String(tx.asset || "").toLowerCase();
        const type = String(tx.type || "").toLowerCase();

        if (
          !title.includes(q) &&
          !hash.includes(q) &&
          !asset.includes(q) &&
          !type.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [formattedTransactions, search, typeFilter, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  /*
  |--------------------------------------------------------------------------
  | Filter helpers
  |--------------------------------------------------------------------------
  */
  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  const hasActiveFilters =
    search !== "" || typeFilter !== "all" || statusFilter !== "all";

  /*
  |--------------------------------------------------------------------------
  | CSV export
  |--------------------------------------------------------------------------
  */
  function exportCSV() {
    const header = [
      "Date",
      "Type",
      "Description",
      "Amount",
      "Asset",
      "Status",
      "Transaction ID",
    ];

    const rows = filtered.map((tx) => [
      tx.date,
      tx.type,
      tx.title,
      tx.amount,
      tx.asset,
      tx.status,
      tx.raw?.trans_id || "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "transaction-history.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
  }

  /*
  |--------------------------------------------------------------------------
  | Skeleton loader
  |--------------------------------------------------------------------------
  */
  function SkeletonLoader() {
    return (
      <div className={styles["skeleton-container"]}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles["skeleton-row"]}>
            <div className={styles["skeleton-icon"]} />

            <div className={styles["skeleton-content"]}>
              <div className={styles["skeleton-title"]} />

              <div className={styles["skeleton-sub"]} />
            </div>

            <div className={styles["skeleton-right"]}>
              <div className={styles["skeleton-amount"]} />

              <div className={styles["skeleton-status"]} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles["page-container"]}>
      {/* ================================================================
          PAGE HEADER
      ================================================================= */}

      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <History size={22} />
        </div>

        <div>
          <h1 className={styles["page-title"]}>Transaction History</h1>

          <p className={styles["page-subtitle"]}>
            A full record of your sends, receives, swaps, and other account
            activity.
          </p>
        </div>
      </div>

      {/* ================================================================
          SUMMARY STATS
      ================================================================= */}

      <div className={styles["stats-grid"]}>
        {/* Total */}
        <div className={styles["stat-card"]}>
          <div className={cx(styles["stat-icon"], styles.total)}>
            <History size={17} />
          </div>

          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Total</span>

            <span className={styles["stat-value"]}>{stats.total}</span>
          </div>
        </div>

        {/* Received */}
        <div className={styles["stat-card"]}>
          <div className={cx(styles["stat-icon"], styles.receive)}>
            <ArrowDownToLine size={17} />
          </div>

          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Received</span>

            <span className={styles["stat-value"]}>{stats.received}</span>
          </div>
        </div>

        {/* Sent */}
        <div className={styles["stat-card"]}>
          <div className={cx(styles["stat-icon"], styles.send)}>
            <ArrowUpFromLine size={17} />
          </div>

          <div className={styles["stat-meta"]}>
            <span className={styles["stat-label"]}>Sent</span>

            <span className={styles["stat-value"]}>{stats.sent}</span>
          </div>
        </div>
      </div>

      {/* ================================================================
          FILTERS
      ================================================================= */}

      <div className={styles.panel}>
        <div className={styles["filters-row"]}>
          {/* Search */}
          <div className={styles["search-wrapper"]}>
            <Search size={15} className={styles["search-icon"]} />

            <input
              className={styles["search-input"]}
              placeholder="Search by description, type, asset, or ID"
              value={search}
              onChange={(e) => updateFilter(setSearch, e.target.value)}
            />
          </div>

          {/* Type */}
          <select
            className={styles["filter-select"]}
            value={typeFilter}
            onChange={(e) => updateFilter(setTypeFilter, e.target.value)}
          >
            <option value="all">All types</option>

            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            className={styles["filter-select"]}
            value={statusFilter}
            onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
          >
            <option value="all">All statuses</option>

            <option value="completed">Completed</option>

            <option value="pending">Pending</option>

            <option value="failed">Failed</option>

            <option value="approved">Approved</option>

            <option value="processing">Processing</option>
          </select>

          {/* Export */}
          <button
            type="button"
            className={styles["btn-export"]}
            onClick={exportCSV}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className={styles["active-filters"]}>
            {search && (
              <button
                type="button"
                className={styles["filter-chip"]}
                onClick={() => updateFilter(setSearch, "")}
              >
                “{search}”
                <X size={11} />
              </button>
            )}

            {typeFilter !== "all" && (
              <button
                type="button"
                className={styles["filter-chip"]}
                onClick={() => updateFilter(setTypeFilter, "all")}
              >
                {typeFilter}
                <X size={11} />
              </button>
            )}

            {statusFilter !== "all" && (
              <button
                type="button"
                className={styles["filter-chip"]}
                onClick={() => updateFilter(setStatusFilter, "all")}
              >
                {statusFilter}
                <X size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================================================================
          TRANSACTION LIST
      ================================================================= */}

      <div className={cx(styles.panel, styles["tx-panel"])}>
        <div className={styles["tx-panel-header"]}>
          <h2>Recent Activity</h2>

          <span className={styles["tx-count"]}>
            {filtered.length} transaction
            {filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          // eslint-disable-next-line react-hooks/static-components
          <SkeletonLoader />
        ) : error ? (
          /* Error */
          <div className={styles["error-state"]}>
            <p className={styles["error-text"]}>{error}</p>

            <button
              type="button"
              className={styles["btn-retry"]}
              onClick={fetchTransactions}
            >
              Try Again
            </button>
          </div>
        ) : pageItems.length === 0 ? (
          /* Empty */
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <Inbox size={22} />
            </div>

            <p className={styles["empty-title"]}>No transactions found</p>

            <p className={styles["empty-desc"]}>
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles["btn-clear"]}
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Transactions */
          <div className={styles["tx-list"]}>
            {pageItems.map((tx, i) => {
              /*
               * IMPORTANT:
               * tx.type remains untouched.
               *
               * Only use lowercase copy
               * for visual lookup.
               */
              const typeKey = String(tx.type || "").toLowerCase();

              const meta = TYPE_META[typeKey] || DEFAULT_TYPE_META;

              const Icon = meta.icon;

              const isPositive = tx.amount > 0;

              return (
                <React.Fragment key={tx.id}>
                  <div className={styles["tx-row"]}>
                    {/* Icon */}
                    <div className={cx(styles["tx-icon"], styles[meta.cls])}>
                      <Icon size={16} />
                    </div>

                    {/* Transaction info */}
                    <div className={styles["tx-meta"]}>
                      <div className={styles["tx-title-row"]}>
                        <span className={`uppercase ${styles["tx-title"]}`}>
                          {tx.title}
                        </span>
                      </div>

                      <span className={styles["tx-sub"]}>
                        {tx.date} · {tx.hash}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className={styles["tx-right"]}>
                      <div className={styles["tx-amounts"]}>
                        <span
                          className={cx(
                            styles["tx-amount"],
                            isPositive
                              ? styles["positive"]
                              : styles["negative"],
                          )}
                        >
                          {formatAmountWithAsset(
                            tx.amount,
                            getCurrencyCode(userCurrencySymbol),
                          )}
                        </span>

                        <span className={styles["tx-amount-fiat"]}>
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>

                      {/* Status */}
                      <span
                        className={cx(
                          styles["tx-status-badge"],
                          styles[tx.status],
                        )}
                      >
                        {tx.status}
                      </span>

                      {/* Explorer */}
                      <button
                        type="button"
                        className={styles["tx-link"]}
                        aria-label="View transaction"
                        title="View transaction"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>

                  {i < pageItems.length - 1 && (
                    <div className={styles["tx-divider"]} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ================================================================
            PAGINATION
        ================================================================= */}

        {filtered.length > 0 && !loading && (
          <div className={styles.pagination}>
            <span className={styles["pagination-info"]}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>

            <div className={styles["pagination-controls"]}>
              {/* Previous */}
              <button
                type="button"
                className={styles["page-btn"]}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Pages */}
              {Array.from({
                length: totalPages,
              }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={cx(
                    styles["page-btn"],
                    safePage === i + 1 && styles.active,
                  )}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                className={styles["page-btn"]}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
