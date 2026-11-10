"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Eye, ShoppingCart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import styles from "./nft.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

// Get blockchain color
const getBlockchainColor = (blockchain) => {
  const colors = {
    ETH: "#627EEA",
    BSC: "#F0B90B",
    SOL: "#14F195",
    POLYGON: "#8247E5",
    AVALANCHE: "#E84142",
  };
  return colors[blockchain] || "#6b7280";
};

// Get blockchain icon
const getBlockchainIcon = (blockchain) => {
  const icons = {
    ETH: "⟠",
    BSC: "◆",
    SOL: "◎",
    POLYGON: "⬡",
    AVALANCHE: "▲",
  };
  return icons[blockchain] || "⛓️";
};

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "art", label: "Art" },
  { id: "gaming", label: "Gaming" },
  { id: "music", label: "Music" },
  { id: "photography", label: "Photography" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "popular", label: "Most Liked" },
];

export default function NftPage() {
  const router = useRouter();
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [buyingId, setBuyingId] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });

  // Format currency
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Fetch NFTs from API
  const fetchNFTs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.items_per_page,
      });

      if (query) params.append("search", query);

      const response = await api.get(`/user/user-nft.php?${params}`);
      const res = response.data;

      if (res.success) {
        setNfts(res.data.nfts || []);
        setPagination(
          res.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 20,
          },
        );
      } else {
        throw new Error(res.message || "Failed to load NFTs");
      }
    } catch (err) {
      console.error("Failed to fetch NFTs:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load NFTs",
      );
      toast.error("Failed to load NFTs");
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load NFTs on mount and when filters change
  useEffect(() => {
    fetchNFTs();
  }, [query, pagination.current_page]);

  // Navigate to NFT detail
  const navigateToNFT = (nftId) => {
    router.push(`/dashboard/nft/${nftId}`);
  };

  // Toggle like
  function toggleLike(id) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Filter and sort NFTs
  const visibleItems = useMemo(() => {
    let items = [...nfts];

    // Filter by category (using type field from database)
    if (activeCategory !== "all") {
      items = items.filter(
        (n) => n.type?.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    // Filter by search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.token_id?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sort === "price-asc") items.sort((a, b) => a.amount - b.amount);
    if (sort === "price-desc") items.sort((a, b) => b.amount - a.amount);
    if (sort === "popular")
      items.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    // "recent" is default (id descending)

    return items;
  }, [nfts, activeCategory, query, sort]);

  // Get category counts
  const counts = useMemo(() => {
    const map = { all: nfts.length };
    for (const item of nfts) {
      const cat = item.type?.toLowerCase() || "other";
      map[cat] = (map[cat] ?? 0) + 1;
    }
    return map;
  }, [nfts]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>NFT Marketplace</h1>
            <p className={styles.subtitle}>
              Discover, collect, and trade unique digital assets
            </p>
          </div>
        </div>
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonArt} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonSub} />
                <div className={styles.skeletonPrice} />
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
            <h1 className={styles.title}>NFT Marketplace</h1>
            <p className={styles.subtitle}>
              Discover, collect, and trade unique digital assets
            </p>
          </div>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Failed to Load NFTs</h3>
          <p>{error}</p>
          <button onClick={fetchNFTs} className={styles.retryBtn}>
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
          <h1 className={styles.title}>NFT Marketplace</h1>
          <p className={styles.subtitle}>
            Discover, collect, and trade unique digital assets
          </p>
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NFTs or collections..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.controlsRow}>
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
              {cat.label} ({counts[cat.id.toLowerCase()] ?? 0})
            </button>
          ))}
        </div>

        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort items"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {visibleItems.map((item) => {
          const isLiked = likedIds.has(item.id);
          const blockchainColor = getBlockchainColor(item.blockchain);
          const blockchainIcon = getBlockchainIcon(item.blockchain);

          return (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => navigateToNFT(item.id)}
            >
              <div className={styles.artWrapper}>
                <div
                  className={styles.art}
                  style={{
                    background:
                      item.image ||
                      `linear-gradient(135deg, ${blockchainColor}40, ${blockchainColor}20)`,
                    border: `1px solid ${blockchainColor}30`,
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.artImage}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className={styles.monogram}>
                      {item.title?.slice(0, 2).toUpperCase() || "?"}
                    </span>
                  )}
                  <div className={styles.blockchainBadge}>
                    <span>{blockchainIcon}</span>
                    <span>{item.blockchain}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.likeBtn} ${isLiked ? styles.likeBtnActive : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.collectionName}>
                  {item.token_standard || item.blockchain}
                </p>
                <h3 className={styles.itemName}>{item.title}</h3>

                <div className={styles.metaRow}>
                  <div>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.priceValue}>
                      {formatCurrency(item.amount)}
                    </span>
                    <span className={styles.priceUsd}>
                      {item.blockchain || "NFT"}
                    </span>
                  </div>
                </div>

                <div className={styles.priceRow}>
                  <button type="button" className={styles.buyBtn}>
                    <ShoppingCart size={16} />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {visibleItems.length === 0 && (
          <p className={styles.emptyState}>
            No NFTs match your search or filters.
          </p>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current_page: Math.max(1, prev.current_page - 1),
              }))
            }
            disabled={pagination.current_page === 1}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            {pagination.current_page} / {pagination.total_pages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current_page: Math.min(prev.total_pages, prev.current_page + 1),
              }))
            }
            disabled={pagination.current_page === pagination.total_pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
