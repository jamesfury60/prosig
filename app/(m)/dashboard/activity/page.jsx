"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  History,
  RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import styles from "./ActivityPage.module.css";

const ITEMS_PER_PAGE = 10;

function formatActivityTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getActivityIcon(type) {
  switch (String(type || "").toLowerCase()) {
    case "registration":
      return CheckCircle2;

    case "account update":
    case "profile update":
      return CheckCircle2;

    default:
      return Bell;
  }
}

export default function ActivityPage() {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await api.get("/user/activities.php");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load activities.");
      }

      return response.data;
    },

    staleTime: 15000,
    refetchInterval: 30000,
  });

  const activities = useMemo(() => {
    if (!Array.isArray(data?.activities)) {
      return [];
    }

    return data.activities;
  }, [data]);

  /**
   * Pagination
   */
  const totalItems = activities.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  /**
   * Prevent current page from becoming invalid
   * if activities are removed/changed.
   */
  const safePage = Math.min(currentPage, totalPages);

  const paginatedActivities = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

    return activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activities, safePage]);

  /**
   * Number of unread activities.
   */
  const unreadCount = useMemo(() => {
    return activities.filter((activity) => {
      return !isActivityRead(activity);
    }).length;
  }, [activities]);

  function isActivityRead(activity) {
    return (
      activity.status === "Read" ||
      activity.status === "read" ||
      activity.status === 1 ||
      activity.status === "1"
    );
  }

  /**
   * Mark one activity as read.
   */
  async function markRead(activityId) {
    try {
      await api.post("/user/activity_read.php", {
        activity_id: activityId,
      });

      /**
       * Refresh the activity query so the database
       * status is reflected everywhere.
       */
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data?.message || "Failed to mark activity as read.",
      );
    }
  }

  /**
   * Mark every activity as read.
   */
  async function markAllRead() {
    if (markingAll || unreadCount === 0) {
      return;
    }

    setMarkingAll(true);

    try {
      const response = await api.post("/user/activities_read_all.php");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to mark activities as read.",
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });

      toast.success("All activities marked as read.");
    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark activities as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * Generate pagination buttons.
   *
   * Example:
   * 1 2 3 ... 10
   */
  function getPaginationPages() {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [];

    pages.push(1);

    if (safePage > 4) {
      pages.push("left-ellipsis");
    }

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (safePage < totalPages - 3) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSubtitle} />
          </div>
        </div>

        <div className={styles.list}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeletonItem}>
              <div className={styles.skeletonIcon} />

              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <Bell size={30} />

          <h2>Could not load activities</h2>

          <p>
            {error?.message ||
              "Something went wrong while loading your activities."}
          </p>

          <button className={styles.primaryButton} onClick={() => refetch()}>
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.pageIcon}>
            <History size={21} />
          </div>

          <div>
            <h1>Activity</h1>

            <p>View your account activity and notifications.</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {/* {unreadCount > 0 && (
            <button
              className={styles.markAllButton}
              onClick={markAllRead}
              disabled={markingAll}
            >
              <CheckCircle2 size={15} />

              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )} */}
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total activities</span>

          <strong>{totalItems}</strong>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Unread</span>

          <strong className={unreadCount > 0 ? styles.unreadNumber : ""}>
            {unreadCount}
          </strong>
        </div>
      </div>

      {/* Empty state */}
      {activities.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Bell size={24} />
          </div>

          <h2>No activity yet</h2>

          <p>Your account notifications and activities will appear here.</p>

          <Link href="/dashboard" className={styles.primaryButton}>
            Back to dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Activity list */}
          <div className={styles.list}>
            {paginatedActivities.map((activity) => {
              const read = isActivityRead(activity);
              const Icon = getActivityIcon(activity.type);

              return (
                <button
                  key={activity.id}
                  type="button"
                  className={`${styles.activityItem} ${
                    !read ? styles.unread : ""
                  }`}
                  onClick={() => {
                    if (!read) {
                      markRead(activity.id);
                    }
                  }}
                >
                  <div className={styles.activityIndicator}>
                    <div className={styles.activityIcon}>
                      <Icon size={17} />
                    </div>

                    {!read && <span className={styles.unreadDot} />}
                  </div>

                  <div className={styles.activityBody}>
                    <div className={styles.activityTop}>
                      <h3>{activity.title || "Account Activity"}</h3>

                      <span className={styles.status}>
                        {read ? (
                          <>
                            <CheckCircle2 size={12} />
                            Read
                          </>
                        ) : (
                          <>
                            <Circle size={10} />
                            New
                          </>
                        )}
                      </span>
                    </div>

                    {activity.content && <p>{activity.content}</p>}

                    <div className={styles.activityMeta}>
                      <span>{activity.type || "Activity"}</span>

                      <span className={styles.metaDot}>•</span>

                      <span>{formatActivityTime(activity.created_at)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing <strong>{(safePage - 1) * ITEMS_PER_PAGE + 1}</strong> –{" "}
                <strong>
                  {Math.min(safePage * ITEMS_PER_PAGE, totalItems)}
                </strong>{" "}
                of <strong>{totalItems}</strong>
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageButton}
                  disabled={safePage === 1}
                  onClick={() => goToPage(safePage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPaginationPages().map((page) => {
                  if (page === "left-ellipsis" || page === "right-ellipsis") {
                    return (
                      <span key={page} className={styles.ellipsis}>
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.pageButton} ${
                        page === safePage ? styles.activePage : ""
                      }`}
                      onClick={() => goToPage(page)}
                      aria-current={page === safePage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={styles.pageButton}
                  disabled={safePage === totalPages}
                  onClick={() => goToPage(safePage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
