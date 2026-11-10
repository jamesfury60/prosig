"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./collections.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function CollectionsPage() {
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const userId = userData?.userid;

  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState(() => new Set());
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  // Fetch user's NFT collections
  const fetchNFTCollections = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/user/user-nft-collections.php?userid=${userId}`,
      );
      const res = response.data;

      if (res.success) {
        const list = res.data || [];
        setNfts(list);

        const completed = list.filter(
          (nft) => nft.status === "Completed",
        ).length;
        const pending = list.filter(
          (nft) => nft.status === "Submitted" || nft.status === "Pending",
        ).length;

        setStats({ total: list.length, completed, pending });
      } else {
        throw new Error(res.message || "Failed to load NFT collections");
      }
    } catch (err) {
      console.error("Failed to fetch NFT collections:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load NFTs",
      );
      toast.error("Failed to load NFT collections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNFTCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function markImageBroken(id) {
    setBrokenImageIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return (
          <span className={styles.statusCompleted}>
            <CheckCircle size={13} />
            Completed
          </span>
        );
      case "submitted":
      case "pending":
        return (
          <span className={styles.statusPending}>
            <Clock size={13} />
            Pending
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className={styles.statusRejected}>
            <XCircle size={13} />
            Rejected
          </span>
        );
      default:
        return (
          <span className={styles.statusUnknown}>
            <Clock size={13} />
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
            <h1 className={styles.title}>My NFT Collections</h1>
            <p className={styles.subtitle}>
              View all NFTs you&apos;ve purchased
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${styles.statCard} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.nftCard} ${styles.skeleton}`}>
              <div className={styles.nftImageSkeleton}>
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={styles.nftInfoSkeleton}>
                <div className={styles.skeletonShimmer} />
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
            <h1 className={styles.title}>My NFT Collections</h1>
            <p className={styles.subtitle}>
              View all NFTs you&apos;ve purchased
            </p>
          </div>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Failed to Load NFTs</h3>
          <p>{error}</p>
          <button onClick={fetchNFTCollections} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My NFT Collections</h1>
          <p className={styles.subtitle}>View all NFTs you&apos;ve purchased</p>
        </div>
        <Link href="/dashboard/nft" className={styles.browseBtn}>
          <ImageIcon size={17} />
          Browse Marketplace
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ImageIcon size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total NFTs</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <CheckCircle size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPending}`}>
            <Clock size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {nfts.length > 0 ? (
        <div className={styles.grid}>
          {nfts.map((nft) => {
            const showFallback = !nft.photo || brokenImageIds.has(nft.id);

            return (
              <div key={nft.id} className={styles.nftCard}>
                <div className={styles.nftImageWrapper}>
                  {showFallback ? (
                    <div className={styles.nftImageFallback}>
                      <span>{nft.name?.slice(0, 2).toUpperCase() || "?"}</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={nft.photo}
                      alt={nft.name}
                      className={styles.nftImage}
                      onError={() => markImageBroken(nft.id)}
                    />
                  )}
                  <div className={styles.nftStatusBadge}>
                    {getStatusBadge(nft.status)}
                  </div>
                </div>
                <div className={styles.nftInfo}>
                  <h3 className={styles.nftTitle}>
                    {nft.name || "Untitled NFT"}
                  </h3>
                  <div className={styles.nftMeta}>
                    <span className={styles.nftAmount}>
                      {formatCurrency(nft.amount)} USDT
                    </span>
                    <span className={styles.nftDate}>
                      <Calendar size={13} />
                      {formatDate(nft.trans_time)}
                    </span>
                  </div>
                  {/* <Link href={`/dashboard/support`} className={styles.viewBtn}>
                    <ExternalLink size={15} />
                    Trade
                  </Link> */}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Wallet size={56} className={styles.emptyIcon} />
          <h3>No NFTs Found</h3>
          <p>You haven&apos;t purchased any NFTs yet.</p>
          <Link href="/dashboard/nft" className={styles.browseBtn}>
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
