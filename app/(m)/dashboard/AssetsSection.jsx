"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Coins, ImageOff, TrendingUp } from "lucide-react";
import styles from "./dashboard.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import toast from "react-hot-toast";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Removes duplicate entries by id, keeping the first occurrence.
// Guards the UI against backend rows that repeat the same id
// (e.g. a bad JOIN or multiple holdings rows for one coin).
function dedupeById(list, idKey) {
  const seen = new Set();
  const result = [];

  for (const item of list) {
    const id = item[idKey];
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }

  return result;
}

// Skeleton Row Component
function SkeletonRow({ count = 5 }) {
  return (
    <div className={styles["skeleton-container"]}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles["skeletonRow"]}>
          <div className={styles["skeletonCell"]}>
            <div
              className={`${styles["skeletonBar"]} ${styles["skeletonCircle"]}`}
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                className={styles["skeletonBar"]}
                style={{ width: "120px" }}
              />
              <div
                className={styles["skeletonBar"]}
                style={{ width: "60px" }}
              />
            </div>
          </div>
          <div
            className={styles["skeletonCell"]}
            style={{ textAlign: "right" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "6px",
              }}
            >
              <div
                className={styles["skeletonBar"]}
                style={{ width: "100px" }}
              />
              <div
                className={styles["skeletonBar"]}
                style={{ width: "70px" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton Grid for Collectibles
function SkeletonGrid({ count = 6 }) {
  return (
    <div className={styles["skeleton-grid"]}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles["skeletonTile"]}>
          <div
            className={`${styles["skeletonBar"]}`}
            style={{ height: "160px", borderRadius: "8px" }}
          />
          <div
            className={styles["skeletonBar"]}
            style={{ width: "70%", height: "14px" }}
          />
          <div
            className={styles["skeletonBar"]}
            style={{ width: "50%", height: "12px" }}
          />
          <div
            className={styles["skeletonBar"]}
            style={{ width: "40%", height: "14px" }}
          />
        </div>
      ))}
    </div>
  );
}

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

export default function AssetsSection() {
  const router = useRouter();
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [activeTab, setActiveTab] = useState("tokens");
  const [query, setQuery] = useState("");

  // Crypto state
  const [coins, setCoins] = useState([]);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [coinsPagination, setCoinsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });

  // Stocks state
  const [stocks, setStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [stocksPagination, setStocksPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });

  // NFTs state
  const [nfts, setNfts] = useState([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [nftsPagination, setNftsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });

  const [hideSmall, setHideSmall] = useState(false);

  // Format currency with user's symbol
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Fetch Cryptocurrencies
  const fetchCoins = async () => {
    setCoinsLoading(true);

    try {
      const params = new URLSearchParams({
        page: coinsPagination.current_page,
        search: query,
        hide_small: hideSmall,
      });

      const response = await api.get(`/user/user-coins.php?${params}`);
      const res = response.data;

      if (res.success) {
        setCoins(dedupeById(res.data.coins || [], "coin_id"));
        setCoinsPagination(
          res.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 20,
          },
        );
      } else {
        toast.error(res.message || "Failed to load cryptocurrencies");
      }
    } catch (error) {
      console.error("Failed to fetch coins:", error);
      toast.error("Failed to load cryptocurrencies");
    } finally {
      setCoinsLoading(false);
    }
  };

  // Fetch Stocks
  const fetchStocks = async () => {
    setStocksLoading(true);

    try {
      const params = new URLSearchParams({
        page: stocksPagination.current_page,
        search: query,
        hide_small: hideSmall,
      });

      const response = await api.get(`/user/user-stocks.php?${params}`);
      const res = response.data;

      if (res.success) {
        setStocks(dedupeById(res.data.coins || [], "coin_id"));
        setStocksPagination(
          res.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 20,
          },
        );
      } else {
        toast.error(res.message || "Failed to load stocks");
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      toast.error("Failed to load stocks");
    } finally {
      setStocksLoading(false);
    }
  };

  // Fetch NFTs
  const fetchNFTs = async () => {
    setNftsLoading(true);

    try {
      const params = new URLSearchParams({
        page: nftsPagination.current_page,
        search: query,
        hide_small: hideSmall,
      });

      const response = await api.get(`/user/user-nft.php?${params}`);
      const res = response.data;

      if (res.success) {
        setNfts(dedupeById(res.data.nfts || [], "id"));
        setNftsPagination(
          res.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 20,
          },
        );
      } else {
        toast.error(res.message || "Failed to load NFTs");
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      toast.error("Failed to load NFTs");
    } finally {
      setNftsLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "tokens") {
      fetchCoins();
    } else if (activeTab === "stocks") {
      fetchStocks();
    } else if (activeTab === "collectibles") {
      fetchNFTs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, query, hideSmall]);

  // Navigation handlers
  const navigateToCoin = (coinId) => {
    router.push(`/dashboard/portfolio/${coinId}`);
  };

  const navigateToStock = (coinId) => {
    router.push(`/dashboard/stockfolio/${coinId}`);
  };

  const navigateToNFT = (nftId) => {
    router.push(`/dashboard/nft/${nftId}`);
  };

  const getPageRange = (current, total) => {
    const range = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) range.push(i);
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) range.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) range.push(i);
    }
    return range;
  };

  const handlePageChange = (page) => {
    if (activeTab === "tokens") {
      if (page >= 1 && page <= coinsPagination.total_pages) {
        setCoinsPagination((prev) => ({ ...prev, current_page: page }));
      }
    } else if (activeTab === "stocks") {
      if (page >= 1 && page <= stocksPagination.total_pages) {
        setStocksPagination((prev) => ({ ...prev, current_page: page }));
      }
    } else if (activeTab === "collectibles") {
      if (page >= 1 && page <= nftsPagination.total_pages) {
        setNftsPagination((prev) => ({ ...prev, current_page: page }));
      }
    }
  };

  const getCurrentData = () => {
    if (activeTab === "tokens")
      return {
        data: coins,
        loading: coinsLoading,
        pagination: coinsPagination,
      };
    if (activeTab === "stocks")
      return {
        data: stocks,
        loading: stocksLoading,
        pagination: stocksPagination,
      };
    return { data: nfts, loading: nftsLoading, pagination: nftsPagination };
  };

  const {
    data: currentData,
    loading: currentLoading,
    pagination: currentPagination,
  } = getCurrentData();

  return (
    <div className={styles["assets-wrapper"]}>
      <div className={styles.section}>
        <div className={styles["section-header"]}>
          <div className={styles.tabs}>
            <button
              className={cx(
                styles.tab,
                activeTab === "tokens" && styles.active,
              )}
              onClick={() => setActiveTab("tokens")}
            >
              Tokens
            </button>
            <button
              className={cx(
                styles.tab,
                activeTab === "stocks" && styles.active,
              )}
              onClick={() => setActiveTab("stocks")}
            >
              Stocks
            </button>
            <button
              className={cx(
                styles.tab,
                activeTab === "collectibles" && styles.active,
              )}
              onClick={() => setActiveTab("collectibles")}
            >
              Collectibles
            </button>
          </div>

          <div className={styles["search-wrapper"]}>
            <Search size={16} className={styles["search-icon"]} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeTab === "tokens"
                  ? "Search tokens..."
                  : activeTab === "stocks"
                    ? "Search stocks..."
                    : "Search collectibles..."
              }
              className={styles["search-input"]}
            />
          </div>
        </div>

        {/* Render content based on active tab */}
        {activeTab === "tokens" && (
          <>
            {coinsLoading ? (
              <SkeletonRow count={5} />
            ) : coins.length === 0 ? (
              <div className={styles["empty-state"]}>
                <Coins size={30} />
                <p>
                  {query
                    ? `No tokens match "${query}"`
                    : "No cryptocurrencies found"}
                </p>
              </div>
            ) : (
              <div className={styles["token-list"]}>
                {coins.map((coin, index) => (
                  <div
                    key={`${coin.coin_id}-${index}`}
                    className={styles["token-row"]}
                    onClick={() => navigateToCoin(coin.coin_id)}
                  >
                    <div className={styles["token-icon"]}>
                      {coin.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coin.photo}
                          alt={coin.coin_name}
                          className={styles["token-image"]}
                        />
                      ) : (
                        <span
                          style={{ background: "#22c55e" }}
                          className={styles["token-icon-placeholder"]}
                        >
                          {coin.coin_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles["token-meta"]}>
                      <span className={styles["token-name"]}>
                        {coin.coin_title}
                      </span>
                      <span className={styles["token-symbol"]}>
                        {coin.coin_name.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles["token-amounts"]}>
                      <span className={styles["token-balance"]}>
                        {coin.total_value.toFixed(2)}{" "}
                        {coin.coin_name.toUpperCase()}
                      </span>
                      <span className={styles["token-value"]}>
                        {formatCurrency(coin.total_balance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "stocks" && (
          <>
            {stocksLoading ? (
              <SkeletonRow count={5} />
            ) : stocks.length === 0 ? (
              <div className={styles["empty-state"]}>
                <TrendingUp size={30} />
                <p>
                  {query ? `No stocks match "${query}"` : "No stocks found"}
                </p>
              </div>
            ) : (
              <div className={styles["token-list"]}>
                {stocks.map((stock, index) => (
                  <div
                    key={`${stock.coin_id}-${index}`}
                    className={styles["token-row"]}
                    onClick={() => navigateToStock(stock.coin_id)}
                  >
                    <div className={styles["token-icon"]}>
                      {stock.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stock.photo}
                          alt={stock.coin_name}
                          className={styles["token-image"]}
                        />
                      ) : (
                        <span
                          style={{ background: "#10b981" }}
                          className={styles["token-icon-placeholder"]}
                        >
                          {stock.coin_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles["token-meta"]}>
                      <span className={styles["token-name"]}>
                        {stock.coin_title}
                      </span>
                      <span className={styles["token-symbol"]}>
                        {stock.coin_name.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles["token-amounts"]}>
                      <span className={styles["token-balance"]}>
                        {formatCurrency(stock.coin_rate)}
                      </span>
                      <span className={styles["token-value"]}>
                        {stock.total_balance.toFixed(2)} shares
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "collectibles" && (
          <>
            {nftsLoading ? (
              <SkeletonGrid count={6} />
            ) : nfts.length === 0 ? (
              <div className={styles["empty-state"]}>
                <ImageOff size={30} />
                <p>
                  {query
                    ? `No collectibles match "${query}"`
                    : "No collectibles found"}
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {nfts.map((nft, index) => (
                  <div
                    key={`${nft.id}-${index}`}
                    className={styles.tile}
                    onClick={() => navigateToNFT(nft.id)}
                  >
                    <div
                      className={styles["tile-art"]}
                      style={{
                        background: `linear-gradient(135deg, ${getBlockchainColor(nft.blockchain)}40, ${getBlockchainColor(nft.blockchain)}20)`,
                        border: `1px solid ${getBlockchainColor(nft.blockchain)}30`,
                        cursor: "pointer",
                      }}
                    >
                      {nft.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={nft.image}
                          alt={nft.title}
                          className={styles["tile-image"]}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className={styles["tile-monogram"]}>
                          {nft.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className={styles["tile-blockchain-badge"]}>
                        <span>{getBlockchainIcon(nft.blockchain)}</span>
                        <span>{nft.blockchain}</span>
                      </div>
                    </div>
                    <p className={styles["tile-name"]}>{nft.title}</p>
                    <p className={styles["tile-id"]}>
                      {nft.token_standard} · {nft.token_id}
                    </p>
                    <p className={styles["tile-amount"]}>
                      {formatCurrency(nft.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {currentData.length > 0 && currentPagination.total_pages > 1 && (
          <div className={styles["pagination-controls"]}>
            <button
              onClick={() =>
                handlePageChange(currentPagination.current_page - 1)
              }
              disabled={currentPagination.current_page === 1}
              className={styles["page-btn"]}
            >
              Previous
            </button>
            {getPageRange(
              currentPagination.current_page,
              currentPagination.total_pages,
            ).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cx(
                  styles["page-btn"],
                  page === currentPagination.current_page &&
                    styles["page-active"],
                )}
              >
                {page}
              </button>
            ))}
            <span className={styles["page-info"]}>
              {currentPagination.current_page} / {currentPagination.total_pages}
            </span>
            <button
              onClick={() =>
                handlePageChange(currentPagination.current_page + 1)
              }
              disabled={
                currentPagination.current_page === currentPagination.total_pages
              }
              className={styles["page-btn"]}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
