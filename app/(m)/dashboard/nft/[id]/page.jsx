"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Eye,
  ShoppingCart,
  Share2,
  ArrowLeft,
  Copy,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./nft-detail.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

export default function NftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const nftId = params.id;
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;

  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [isOffering, setIsOffering] = useState(false);
  const [relatedNfts, setRelatedNfts] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);

  // Fetch NFT details
  const fetchNftDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/user-nft-single.php?id=${nftId}`);
      const res = response.data;

      if (res.success) {
        setNft(res.data);
        setLikeCount(res.data.likes || 0);
        setIsLiked(res.data.user_liked || false);
      } else {
        throw new Error(res.message || "Failed to load NFT");
      }
    } catch (err) {
      console.error("Failed to fetch NFT:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load NFT",
      );
      toast.error("Failed to load NFT");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch related NFTs
  const fetchRelatedNfts = async () => {
    setIsRelatedLoading(true);
    try {
      const response = await api.get(`/user/user-nft.php?limit=4`);
      const res = response.data;
      if (res.success) {
        const filtered = res.data.nfts.filter(
          (item) => item.id !== parseInt(nftId),
        );
        setRelatedNfts(filtered.slice(0, 4));
      }
    } catch (err) {
      // Silently fail for related items
      console.warn("Failed to fetch related NFTs");
    } finally {
      setIsRelatedLoading(false);
    }
  };

  useEffect(() => {
    if (nftId) {
      fetchNftDetails();
      fetchRelatedNfts();
    }
  }, [nftId]);

  // Toggle like
  function toggleLike() {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  }

  // Copy contract address
  async function handleCopyContract() {
    try {
      await navigator.clipboard.writeText(nft?.contracts || "");
      toast.success("Contract address copied");
    } catch {
      toast.error("Could not copy — copy it manually");
    }
  }

  // Share
  async function handleShare() {
    try {
      const shareText = `${nft?.title} - ${nft?.blockchain || "NFT"} Collection`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }

  // Buy NFT
  async function handleBuy() {
    toast.dismiss();

    if (!userData) {
      toast.error("Please login to purchase NFTs");
      return;
    }

    setIsBuying(true);

    try {
      const response = await api.post("/user/user-nft-purchase.php", {
        nft_id: parseInt(nftId),
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "NFT purchased successfully!");
        // Refresh NFT details to show updated status
        await fetchNftDetails();
        // Redirect to portfolio after delay
        setTimeout(() => {
          router.push("/dashboard/nft");
        }, 1500);
      } else {
        toast.error(res.message || "Failed to purchase NFT");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to purchase NFT";
      toast.error(errorMsg);
    } finally {
      setIsBuying(false);
    }
  }

  // Make offer (placeholder)
  async function handleMakeOffer() {
    toast.dismiss();

    if (!userData) {
      toast.error("Please login to make an offer");
      return;
    }

    setIsOffering(true);

    try {
      // You can implement offer API here later
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Offer submitted to the seller.");
    } catch (error) {
      toast.error("Failed to submit offer");
    } finally {
      setIsOffering(false);
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get blockchain color
  const getBlockchainColor = (blockchain) => {
    const colors = {
      ETH: "#627EEA",
      BSC: "#F0B90B",
      SOL: "#14F195",
      POLYGON: "#8247E5",
      AVALANCHE: "#E84142",
      BTC: "#F7931A",
      ARB: "#2D374B",
      OP: "#FF0420",
    };
    return colors[blockchain] || "#6b7280";
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.backLinkSkeleton} />
        <div className={styles.grid}>
          {/* Art Column Skeleton */}
          <div className={styles.artCol}>
            <div className={styles.artWrapper}>
              <div className={`${styles.art} ${styles.skeleton}`}>
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={styles.artActions}>
                <div className={`${styles.iconBtn} ${styles.skeleton}`}>
                  <div className={styles.skeletonShimmer} />
                </div>
                <div className={`${styles.iconBtn} ${styles.skeleton}`}>
                  <div className={styles.skeletonShimmer} />
                </div>
              </div>
            </div>
            <div className={styles.metaRow}>
              <div className={`${styles.metaItem} ${styles.skeleton}`}>
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={`${styles.metaItem} ${styles.skeleton}`}>
                <div className={styles.skeletonShimmer} />
              </div>
            </div>
          </div>

          {/* Details Column Skeleton */}
          <div className={styles.detailsCol}>
            <div className={`${styles.collectionName} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
            <div className={`${styles.itemName} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
            <div className={`${styles.ownerLine} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>
            <div className={`${styles.description} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
            </div>

            <div className={`${styles.priceBox} ${styles.skeleton}`}>
              <div className={styles.skeletonShimmer} />
              <div className={styles.skeletonShimmer} />
              <div className={styles.priceActions}>
                <div className={`${styles.buyBtn} ${styles.skeleton}`}>
                  <div className={styles.skeletonShimmer} />
                </div>
                <div className={`${styles.offerBtn} ${styles.skeleton}`}>
                  <div className={styles.skeletonShimmer} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={`${styles.sectionTitle} ${styles.skeleton}`}>
                <div className={styles.skeletonShimmer} />
              </div>
              <div className={styles.detailsList}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.detailRow} ${styles.skeleton}`}
                  >
                    <div className={styles.skeletonShimmer} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Section Skeleton */}
        <div className={styles.relatedSection}>
          <div className={`${styles.relatedTitle} ${styles.skeleton}`}>
            <div className={styles.skeletonShimmer} />
          </div>
          <div className={styles.relatedGrid}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${styles.relatedCard} ${styles.skeleton}`}
              >
                <div className={styles.relatedArt}>
                  <div className={styles.skeletonShimmer} />
                </div>
                <div className={styles.relatedBody}>
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonShimmer} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !nft) {
    return (
      <div className={styles.page}>
        <Link href="/dashboard/nft" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Marketplace
        </Link>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Failed to Load NFT</h3>
          <p>{error || "NFT not found"}</p>
          <button onClick={fetchNftDetails} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const blockchainColor = getBlockchainColor(nft.blockchain);

  return (
    <div className={styles.page}>
      <Link href="/dashboard/nft" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Marketplace
      </Link>

      <div className={styles.grid}>
        {/* Art */}
        <div className={styles.artCol}>
          <div className={styles.artWrapper}>
            <div
              className={styles.art}
              style={{
                background: nft.image
                  ? `url(${nft.image})`
                  : `linear-gradient(135deg, ${blockchainColor}40, ${blockchainColor}20)`,
                backgroundSize: nft.image ? "cover" : "auto",
                backgroundPosition: "center",
              }}
            >
              {!nft.image && (
                <span className={styles.monogram}>
                  {nft.title?.slice(0, 2).toUpperCase() || "?"}
                </span>
              )}
              {nft.blockchain && (
                <div className={styles.blockchainBadge}>
                  <span>{nft.blockchain}</span>
                </div>
              )}
            </div>
            <div className={styles.artActions}>
              <button
                type="button"
                className={`${styles.iconBtn} ${isLiked ? styles.iconBtnActive : ""}`}
                onClick={toggleLike}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <Heart size={14} /> {likeCount.toLocaleString()}
            </span>
            <span className={styles.metaItem}>
              <Eye size={14} /> {nft.views || 0}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsCol}>
          <p className={styles.collectionName}>
            {nft.type || "NFT Collection"}
          </p>
          <h1 className={styles.itemName}>{nft.title}</h1>
          <p className={styles.ownerLine}>
            Token ID:{" "}
            <span className={styles.ownerAddress}>{nft.token_id || "N/A"}</span>
          </p>

          <p className={styles.description}>
            {nft.content || "No description available."}
          </p>

          <div className={styles.priceBox}>
            <div>
              <span className={styles.priceLabel}>Current Price</span>
              <div className={styles.priceRow}>
                <span className={styles.priceValue}>
                  {formatCurrency(nft.amount)} USDT
                </span>
                <span className={styles.priceUsd}>
                  {nft.blockchain || "NFT"}
                </span>
              </div>
            </div>

            <div className={styles.priceActions}>
              <button
                type="button"
                className={styles.buyBtn}
                onClick={handleBuy}
                disabled={isBuying}
              >
                {isBuying ? (
                  <>
                    <Loader2 size={17} className={styles.spinner} />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={17} />
                    Buy Now
                  </>
                )}
              </button>
              <button
                type="button"
                className={styles.offerBtn}
                onClick={handleMakeOffer}
                disabled={isOffering}
              >
                {isOffering ? "Submitting..." : "Make Offer"}
              </button>
            </div>
          </div>

          {/* Contract details */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <ShieldCheck size={15} />
              Details
            </h2>
            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Contract Address</span>
                <div className={styles.detailValueRow}>
                  <span className={styles.detailValue}>
                    {nft.contracts
                      ? `${nft.contracts.slice(0, 10)}...${nft.contracts.slice(-6)}`
                      : "N/A"}
                  </span>
                  {nft.contracts && (
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={handleCopyContract}
                      aria-label="Copy contract address"
                    >
                      <Copy size={13} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Token ID</span>
                <span className={styles.detailValue}>
                  {nft.token_id || "N/A"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Token Standard</span>
                <span className={styles.detailValue}>
                  {nft.token_standard || "N/A"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Blockchain</span>
                <span className={styles.detailValue}>
                  {nft.blockchain || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {isRelatedLoading ? (
        <div className={styles.relatedSection}>
          <div className={`${styles.relatedTitle} ${styles.skeleton}`}>
            <div className={styles.skeletonShimmer} />
          </div>
          <div className={styles.relatedGrid}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${styles.relatedCard} ${styles.skeleton}`}
              >
                <div className={styles.relatedArt}>
                  <div className={styles.skeletonShimmer} />
                </div>
                <div className={styles.relatedBody}>
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonShimmer} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : relatedNfts.length > 0 ? (
        <div className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>More NFTs You Might Like</h2>
          <div className={styles.relatedGrid}>
            {relatedNfts.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/nft/${item.id}`}
                className={styles.relatedCard}
              >
                <div
                  className={styles.relatedArt}
                  style={{
                    background: item.image
                      ? `url(${item.image})`
                      : `linear-gradient(135deg, #16a34a 0%, #4ade80 100%)`,
                    backgroundSize: item.image ? "cover" : "auto",
                    backgroundPosition: "center",
                  }}
                >
                  {!item.image && (
                    <span className={styles.relatedMonogram}>
                      {item.title?.slice(0, 2).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div className={styles.relatedBody}>
                  <p className={styles.relatedCollection}>
                    {item.type || "NFT"}
                  </p>
                  <p className={styles.relatedName}>{item.title}</p>
                  <span className={styles.relatedPrice}>
                    {formatCurrency(item.amount)} USDT
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
