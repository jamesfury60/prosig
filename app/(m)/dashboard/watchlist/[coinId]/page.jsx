"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  ExternalLink,
  MessageCircle,
  Globe,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./coin-detail.module.css";
import { api } from "@/lib/axios";

const RANGES = ["1H", "1D", "1W", "1M", "1Y", "YTD", "ALL"];

// How many paragraphs to show before the "Read more" toggle
const SUMMARY_VISIBLE_PARAGRAPHS = 1;

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function formatPrice(n) {
  const v = Number(n) || 0;
  if (v >= 1000)
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 1) return `$${v.toFixed(2)}`;
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

function buildPath(points, w, h) {
  if (!points || points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = w / (points.length - 1);
  let d = "";
  points.forEach((p, i) => {
    const x = i * stepX;
    const y = h - ((p - min) / range) * h;
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  });
  return d.trim();
}

// Strip HTML, decode common entities, and split into paragraphs
function buildSummaryParagraphs(rawDescription) {
  if (!rawDescription) return [];

  const stripped = rawDescription
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) return [];

  const byNewline = stripped
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (byNewline.length > 1) return byNewline;

  // Fallback: chunk by sentences into ~3-sentence paragraphs
  const sentences = stripped.match(/[^.!?]+[.!?]+/g) || [stripped];
  const paragraphs = [];
  const perParagraph = 3;
  for (let i = 0; i < sentences.length; i += perParagraph) {
    paragraphs.push(
      sentences
        .slice(i, i + perParagraph)
        .map((s) => s.trim())
        .join(" "),
    );
  }
  return paragraphs;
}

export default function CoinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const coinId = params.coinId;

  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRange, setActiveRange] = useState("1D");
  const [starred, setStarred] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  async function fetchCoin() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/user/coin-detail.php?id=${coinId}`);
      const res = response.data;
      if (res.success && res.data?.coin) {
        setCoin(res.data.coin);
      } else {
        throw new Error(res.message || "Failed to load coin");
      }
    } catch (err) {
      console.error("Coin detail error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load coin";
      setError(msg);
      toast.error(msg);
      setTimeout(() => router.push("/dashboard"), 1800);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (coinId) fetchCoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId]);

  // Collapse the summary whenever the coin changes
  useEffect(() => {
    setSummaryExpanded(false);
  }, [coinId]);

  const chartPath = useMemo(
    () => (coin?.sparkline ? buildPath(coin.sparkline, 600, 200) : ""),
    [coin],
  );

  const summaryParagraphs = useMemo(
    () => buildSummaryParagraphs(coin?.description),
    [coin?.description],
  );

  const hasMoreSummary = summaryParagraphs.length > SUMMARY_VISIBLE_PARAGRAPHS;

  const visibleParagraphs = summaryExpanded
    ? summaryParagraphs
    : summaryParagraphs.slice(0, SUMMARY_VISIBLE_PARAGRAPHS);

  const positive = (coin?.change_24h ?? 0) >= 0;

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader2 className="spin" size={28} />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className={styles.errorWrap}>
        <p>{error || "Coin not found"}</p>
        <Link href="/dashboard" className={styles.backBtn}>
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button
          onClick={() => router.back()}
          className={styles.iconBtn}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => {
            setStarred((s) => !s);
            toast(starred ? "Removed from watchlist" : "Added to watchlist");
          }}
          className={cx(styles.iconBtn, starred && styles.iconBtnActive)}
          aria-label="Star"
        >
          <Star size={18} fill={starred ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Head */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin.image} alt={coin.symbol} className={styles.headImg} />
          <div>
            <div className={styles.headSymbol}>{coin.symbol}</div>
            <div className={styles.headName}>{coin.name}</div>
          </div>
        </div>
        <div className={styles.headRight}>
          <div className={styles.headPrice}>{formatPrice(coin.price)}</div>
          <div
            className={cx(
              styles.headChange,
              positive ? styles.up : styles.down,
            )}
          >
            {positive ? "+" : ""}
            {formatPrice(Math.abs(coin.price * (coin.change_24h / 100)))} (
            {coin.change_24h.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrap}>
        <svg
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className={cx(styles.chart, positive ? styles.up : styles.down)}
        >
          <defs>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={positive ? "#22c55e" : "#ef4444"}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={positive ? "#22c55e" : "#ef4444"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {chartPath && (
            <>
              <path
                d={`${chartPath} L600 200 L0 200 Z`}
                fill="url(#fillGrad)"
                stroke="none"
              />
              <path
                d={chartPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      {/* Range toggle */}
      <div className={styles.rangeRow}>
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRange(r)}
            className={cx(
              styles.rangePill,
              activeRange === r && styles.rangeActive,
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className={styles.actionRow}>
        <button
          className={styles.actionBtn}
          onClick={() => router.push(`/dashboard/transfer/`)}
        >
          <TrendingUp size={16} /> Send
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => router.push(`/dashboard/deposit/1`)}
        >
          <TrendingDown size={16} /> Receive
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => router.push(`/dashboard/swap/`)}
        >
          <TrendingUp size={16} /> Swap
        </button>
      </div>

      {/* AI summary — collapsed by default, "Read more" expands */}
      <div className={styles.aiBlock}>
        <div className={styles.aiHead}>
          <span className={styles.aiSpark}>✦</span> AI Summary
        </div>

        {summaryParagraphs.length === 0 ? (
          <p className={styles.aiText}>No description available.</p>
        ) : (
          <>
            <div className={styles.aiTextWrap}>
              {visibleParagraphs.map((para, i) => {
                const isLastVisible =
                  !summaryExpanded &&
                  hasMoreSummary &&
                  i === visibleParagraphs.length - 1;

                return (
                  <p key={i} className={styles.aiText}>
                    {para}
                    {isLastVisible && (
                      <button
                        type="button"
                        className={styles.aiReadMore}
                        onClick={() => setSummaryExpanded(true)}
                        aria-label="Read more"
                      >
                        … Read more
                      </button>
                    )}
                  </p>
                );
              })}
            </div>

            {hasMoreSummary && summaryExpanded && (
              <button
                type="button"
                className={styles.aiShowLess}
                onClick={() => setSummaryExpanded(false)}
              >
                Show less
              </button>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsBlock}>
        <h4 className={styles.statsTitle}>Stats</h4>
        <div className={styles.statsGrid}>
          <div>
            <span className={styles.statLabel}>Market Cap</span>
            <span className={styles.statValue}>
              {formatCompact(coin.market_cap)}
            </span>
          </div>
          <div>
            <span className={styles.statLabel}>24h Volume</span>
            <span className={styles.statValue}>
              {formatCompact(coin.volume_24h)}
            </span>
          </div>
          <div>
            <span className={styles.statLabel}>Circulating Supply</span>
            <span className={styles.statValue}>
              {coin.circulating_supply
                ? coin.circulating_supply.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })
                : "—"}
            </span>
          </div>
          <div>
            <span className={styles.statLabel}>Max Supply</span>
            <span className={styles.statValue}>
              {coin.max_supply
                ? coin.max_supply.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })
                : "∞"}
            </span>
          </div>
          <div>
            <span className={styles.statLabel}>24h High</span>
            <span className={styles.statValue}>
              {formatPrice(coin.high_24h)}
            </span>
          </div>
          <div>
            <span className={styles.statLabel}>24h Low</span>
            <span className={styles.statValue}>
              {formatPrice(coin.low_24h)}
            </span>
          </div>
        </div>
      </div>

      {/* About / Links */}
      {(coin.links?.homepage ||
        coin.links?.twitter ||
        coin.links?.reddit ||
        coin.links?.whitepaper) && (
        <div className={styles.aboutBlock}>
          <h4 className={styles.statsTitle}>About</h4>
          <div className={styles.linksRow}>
            {coin.links.homepage && (
              <a
                href={coin.links.homepage}
                target="_blank"
                rel="noreferrer"
                className={styles.linkPill}
              >
                <Globe size={13} /> Website
              </a>
            )}
            {coin.links.twitter && (
              <a
                href={coin.links.twitter}
                target="_blank"
                rel="noreferrer"
                className={styles.linkPill}
              >
                <MessageCircle size={13} /> Twitter
              </a>
            )}
            {coin.links.reddit && (
              <a
                href={coin.links.reddit}
                target="_blank"
                rel="noreferrer"
                className={styles.linkPill}
              >
                <ExternalLink size={13} /> Reddit
              </a>
            )}
            {coin.links.whitepaper && (
              <a
                href={coin.links.whitepaper}
                target="_blank"
                rel="noreferrer"
                className={styles.linkPill}
              >
                <FileText size={13} /> Whitepaper
              </a>
            )}
          </div>
        </div>
      )}

      {/* Buy CTA */}
      {/* <button className={styles.buyBtn}>
        <TrendingUp size={18} /> Buy
      </button> */}
    </div>
  );
}
