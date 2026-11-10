"use client";

import { useState, useEffect } from "react";
import { Newspaper, ArrowRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./dashboard.module.css";
import { api } from "@/lib/axios";

const NEWS_CATEGORIES = ["All", "Crypto", "DeFi", "NFTs"];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MarketNews() {
  const [newsFilter, setNewsFilter] = useState("All");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 5,
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return "Just now";
      if (diffInHours === 1) return "1 hour ago";
      return `${diffInHours} hours ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Truncate content
  const truncateContent = (content, length) => {
    if (!content) return "No description available";
    if (content.length <= length) return content;
    return content.substring(0, length) + "...";
  };

  // Get page range for pagination
  const getPageRange = () => {
    const current = pagination.current_page;
    const total = pagination.total_pages;
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

  // Open news in new tab
  const openNewsLink = (mylink) => {
    if (mylink) {
      window.open(mylink, "_blank");
    }
  };

  // Fetch news from API
  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        limit: pagination.items_per_page.toString(),
      });

      if (newsFilter !== "All") {
        params.append("type", newsFilter);
      }

      const response = await api.get(`/user/news.php?${params}`);
      const res = response.data;

      if (res.success) {
        setNews(res.data.news || []);
        setPagination(
          res.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 5,
          },
        );
      } else {
        throw new Error(res.message || "Failed to load news");
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load news",
      );
      toast.error("Failed to load news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Change page
  const changePage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setPagination((prev) => ({ ...prev, current_page: page }));
    }
  };

  // Filter change
  const handleFilterChange = (category) => {
    setNewsFilter(category);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // Load news on mount and when filter/page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews();
  }, [newsFilter, pagination.current_page]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className={styles["news-section"]}>
        <div className={styles["news-header"]}>
          <div className={styles["news-title-group"]}>
            <div className={styles["news-icon-wrapper"]}>
              <Newspaper size={18} />
            </div>
            <div>
              <h3>Market News & Updates</h3>
              <p className={styles["news-sub"]}>
                Real-time insights and market commentary
              </p>
            </div>
          </div>
        </div>
        <div className={styles["news-grid"]}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles["news-skeleton"]}>
              <div className={styles["skeleton-category"]} />
              <div className={styles["skeleton-title"]} />
              <div className={styles["skeleton-footer"]} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles["news-section"]}>
        <div className={styles["news-header"]}>
          <div className={styles["news-title-group"]}>
            <div className={styles["news-icon-wrapper"]}>
              <Newspaper size={18} />
            </div>
            <div>
              <h3>Market News & Updates</h3>
              <p className={styles["news-sub"]}>
                Real-time insights and market commentary
              </p>
            </div>
          </div>
          <button onClick={fetchNews} className={styles["news-refresh-btn"]}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
        <div className={styles["news-error"]}>
          <p>{error}</p>
          <button onClick={fetchNews} className={styles["news-retry-btn"]}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["news-section"]}>
      <div className={styles["news-header"]}>
        <div className={styles["news-title-group"]}>
          <div className={styles["news-icon-wrapper"]}>
            <Newspaper size={18} />
          </div>
          <div>
            <h3>Market News & Updates</h3>
            <p className={styles["news-sub"]}>
              Real-time insights and market commentary
            </p>
          </div>
        </div>

        <div className={styles["news-filters"]}>
          {NEWS_CATEGORIES.map((category) => (
            <button
              key={category}
              className={cx(
                styles["filter-pill"],
                newsFilter === category && styles.active,
              )}
              onClick={() => handleFilterChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {news.length === 0 ? (
        <div className={styles["news-empty"]}>
          <p>No news available</p>
          <p className={styles["news-empty-sub"]}>
            Check back later for the latest market updates
          </p>
        </div>
      ) : (
        <>
          <div className={styles["news-grid"]}>
            {news.map((article, index) => (
              <article
                key={article.id}
                className={styles["news-card"]}
                onClick={() => openNewsLink(article.mylink)}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles["news-card-top"]}>
                  <span className={styles["news-cat"]}>
                    {article.type || article.category || "General"}
                  </span>
                  <span className={styles["news-time"]}>
                    {formatDate(article.created_at || article.date)}
                  </span>
                </div>

                <h4 className={styles["news-article-title"]}>
                  {article.title}
                </h4>

                <p className={styles["news-content-preview"]}>
                  {truncateContent(article.content, 100)}
                </p>

                <div className={styles["news-card-footer"]}>
                  <span className={styles["news-source"]}>
                    {article.author || article.source || "News"} •{" "}
                    {article.read_time || "2 min read"}
                  </span>
                  <button
                    className={styles["news-read-btn"]}
                    aria-label="Read full story"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNewsLink(article.mylink);
                    }}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className={styles["news-pagination"]}>
              <button
                onClick={() => changePage(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className={styles["news-page-btn"]}
              >
                Previous
              </button>
              <div className={styles["news-page-numbers"]}>
                {getPageRange().map((page) => (
                  <button
                    key={page}
                    onClick={() => changePage(page)}
                    className={cx(
                      styles["news-page-num"],
                      page === pagination.current_page && styles.active,
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => changePage(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className={styles["news-page-btn"]}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
