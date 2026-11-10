"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Sparkles,
  Rocket,
  LineChart,
} from "lucide-react";

import styles from "./dashboard.module.css";
import { api } from "@/lib/axios";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function formatPrice(n) {
  const v = Number(n) || 0;
  if (v >= 1000) {
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  if (v >= 1) {
    return `$${v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(8)}`;
}

function formatCompact(n) {
  const v = Number(n) || 0;
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
}

// Build an SVG path from a sparkline array
function buildSparkPath(points, width, height) {
  if (!points || points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  let d = "";
  points.forEach((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  });
  return d.trim();
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function Watchlist() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const TABS = ["All", "Trending", "Gainers", "Losers"];

  async function fetchCoins() {
    // Only show loading state on the very first fetch — otherwise silent refresh
    if (coins.length === 0) setLoading(true);
    setError("");

    try {
      const response = await api.get("/user/watchlist.php");
      const res = response.data;
      if (res.success) {
        setCoins(res.data.coins || []);
      } else {
        setError(res.message || "Failed to load market data");
      }
    } catch (err) {
      console.error("Watchlist fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load market data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoins();
    // Refresh every 5 minutes while mounted (server cache absorbs duplicate calls)
    const t = setInterval(fetchCoins, 300000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Collapse the list back to 10 whenever filter/search changes
  useEffect(() => {
    setShowAll(false);
  }, [query, activeTab]);

  const filtered = useMemo(() => {
    let list = [...coins];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      );
    }
    if (activeTab === "Top Gainers") {
      list.sort((a, b) => b.change_24h - a.change_24h);
    } else if (activeTab === "Top Losers") {
      list.sort((a, b) => a.change_24h - b.change_24h);
    } else if (activeTab === "Trending") {
      list.sort((a, b) => b.volume_24h - a.volume_24h);
    }
    return list;
  }, [coins, query, activeTab]);

  const topCards = useMemo(() => coins.slice(0, 4), [coins]);

  // ---------- render ----------
  return (
    <div className={styles["watchlist-section"]}>
      {/* Header */}
      <div className={styles["watchlist-header"]}>
        <div className={styles["watchlist-title-group"]}>
          <div className={styles["watchlist-icon-wrapper"]}>
            <LineChart size={18} />
          </div>
          <div>
            <h3>Markets</h3>
            <p className={styles["watchlist-sub"]}>
              Live prices, top movers, and market trends
            </p>
          </div>
        </div>

        <div className={styles["watchlist-search-wrapper"]}>
          <Search size={16} className={styles["watchlist-search-icon"]} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins..."
            className={styles["watchlist-search-input"]}
          />
        </div>
      </div>

      {/* Quick category pills (decorative placeholders, matching screenshot) */}
      <div className={styles["watchlist-quick-pills"]}>
        <span className={cx(styles["quick-pill"], styles["quick-pill-accent"])}>
          <Sparkles size={13} />
          Predictions
        </span>
        {/* <span className={styles["quick-pill"]}>
          <Rocket size={13} />
          Meme Rush
        </span> */}
      </div>

      {/* Loading / error */}
      {loading ? (
        <div className={styles["watchlist-skeleton-grid"]}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles["watchlist-skeleton-card"]}>
              <div className={styles["skeletonBar"]} style={{ width: "40%" }} />
              <div
                className={styles["skeletonBar"]}
                style={{ width: "70%", height: "18px", marginTop: "8px" }}
              />
              <div
                className={styles["skeletonBar"]}
                style={{ width: "100%", height: "48px", marginTop: "10px" }}
              />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles["watchlist-error"]}>
          <p>{error}</p>
          <button onClick={fetchCoins} className={styles["watchlist-retry"]}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Top traded carousel */}
          {topCards.length > 0 && (
            <>
              <div className={styles["watchlist-subhead"]}>
                Top traded (24h)
              </div>
              <div className={styles["watchlist-carousel"]}>
                {topCards.map((c) => {
                  const up = c.change_24h >= 0;
                  const path = buildSparkPath(c.sparkline, 120, 36);
                  return (
                    <Link
                      key={c.id}
                      href={`/dashboard/watchlist/${c.id}`}
                      className={styles["watchlist-card"]}
                    >
                      <div className={styles["watchlist-card-head"]}>
                        <span className={styles["watchlist-card-name"]}>
                          {c.name}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt={c.symbol}
                          className={styles["watchlist-card-img"]}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                      <div className={styles["watchlist-card-price"]}>
                        {formatPrice(c.price)}
                      </div>
                      <div
                        className={cx(
                          styles["watchlist-card-change"],
                          up ? styles.up : styles.down,
                        )}
                      >
                        {up ? "+" : ""}
                        {c.change_24h.toFixed(2)}%
                      </div>
                      <svg
                        className={cx(
                          styles["watchlist-spark"],
                          up ? styles.sparkUp : styles.sparkDown,
                        )}
                        viewBox="0 0 120 36"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={path}
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Tabs */}
          <div className={styles["watchlist-tabs"]}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={cx(
                  styles["watchlist-tab"],
                  activeTab === tab && styles.active,
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className={styles["watchlist-empty"]}>
              <p>
                {query ? `No coins match "${query}"` : "No coins available"}
              </p>
            </div>
          ) : (
            <>
              <div className={styles["watchlist-list"]}>
                {filtered.slice(0, showAll ? filtered.length : 10).map((c) => {
                  const up = c.change_24h >= 0;
                  return (
                    <Link
                      key={c.id}
                      href={`/dashboard/watchlist/${c.id}`}
                      className={styles["watchlist-row"]}
                    >
                      <div className={styles["watchlist-row-icon"]}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt={c.symbol}
                          className={styles["watchlist-row-img"]}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                      <div className={styles["watchlist-row-meta"]}>
                        <span className={styles["watchlist-row-symbol"]}>
                          {c.symbol}
                        </span>
                        <span className={styles["watchlist-row-sub"]}>
                          {formatCompact(c.market_cap)} MCap ·{" "}
                          {formatCompact(c.volume_24h)} Vol
                        </span>
                      </div>
                      <div className={styles["watchlist-row-right"]}>
                        <span className={styles["watchlist-row-price"]}>
                          {formatPrice(c.price)}
                        </span>
                        <span
                          className={cx(
                            styles["watchlist-row-change"],
                            up ? styles.up : styles.down,
                          )}
                        >
                          {up ? "+" : ""}
                          {c.change_24h.toFixed(2)}%
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={styles["watchlist-row-arrow"]}
                      />
                    </Link>
                  );
                })}
              </div>

              {!showAll && filtered.length > 10 && (
                <button
                  onClick={() => setShowAll(true)}
                  className={styles["watchlist-show-more"]}
                >
                  Show more ({filtered.length - 10} more)
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
