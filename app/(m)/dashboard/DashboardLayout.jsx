"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  ArrowUpFromLine,
  ArrowDownToLine,
  Repeat,
  Layers,
  MonitorPlay,
  History,
  Settings,
  Menu,
  X,
  Zap,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Copyright,
  Shield,
  HelpCircle,
  CheckCheck,
  Bot,
  Copy,
  ChartCandlestick,
  ClipboardList,
  Radar,
  Gem,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import styles from "./DashboardLayout.module.css";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      {
        id: "wallet",
        label: "Wallet",
        href: "/dashboard",
        icon: LayoutGrid,
      },
      {
        id: "live",
        label: "Live Markets",
        href: "/dashboard/markets",
        icon: ChartCandlestick,
      },
    ],
  },
  {
    title: "Quick",
    items: [
      {
        id: "send",
        label: "Internal Transfer",
        href: "/dashboard/transfer",
        icon: ArrowUpFromLine,
      },
      {
        id: "activity",
        label: "Statements",
        href: "/dashboard/transactions",
        icon: History,
      },
      {
        id: "receive",
        label: "Deposit Funds",
        href: "/dashboard/deposit/1",
        icon: ArrowDownToLine,
      },
      {
        id: "swap",
        label: "Instant Swap",
        href: "/dashboard/swap",
        icon: Repeat,
      },
    ],
  },

  {
    title: "Assets",
    items: [
      {
        id: "signal",
        label: "Signals",
        href: "/dashboard/signals",
        icon: Radar,
      },
      {
        id: "plans",
        label: "Trading Plans",
        href: "/dashboard/plans",
        icon: ClipboardList,
      },
      {
        id: "bot",
        label: "AI Trading Bots",
        href: "/dashboard/bot-trading",
        icon: Bot,
      },
      {
        id: "copy",
        label: "Copytrader",
        href: "/dashboard/copytrader",
        icon: Copy,
      },
      {
        id: "nft",
        label: "My Collections",
        href: "/dashboard/nft/collections",
        icon: Gem,
      },
    ],
  },
  {
    title: "Discover",
    items: [
      {
        id: "staking",
        label: "Staking",
        href: "/dashboard/staking",
        icon: Layers,
      },
      // {
      //   id: "demo",
      //   label: "Demo Trade",
      //   href: "/dashboard/demo_dash",
      //   icon: MonitorPlay,
      // },
      {
        id: "support",
        label: "Support Center",
        href: "/dashboard/support",
        icon: HelpCircle,
      },
      {
        id: "settings",
        label: "Settings",
        href: "/dashboard/profile",
        icon: Settings,
      },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const BOTTOM_LEFT = ALL_ITEMS.filter((item) =>
  ["demo", "wallet"].includes(item.id),
);

const BOTTOM_RIGHT = ALL_ITEMS.filter((item) =>
  ["support", "settings"].includes(item.id),
);

const SEND_ITEM = ALL_ITEMS.find((item) => item.id === "live");

const DROPDOWN_LINKS = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Security",
    href: "/dashboard/security",
    icon: Shield,
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem("vaultline-theme");

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;

  return prefersLight ? "light" : "dark";
}

/**
 * Convert API date into something readable.
 *
 * Example:
 * 2026-08-21 10:30:00
 * =>
 * 2m ago
 * 1h ago
 * Yesterday
 * Aug 12
 */
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

export default function DashboardLayout({ children }) {
  const { data: user, isPending } = useMe();

  /**
   * Get activities from database.
   */
  const {
    data: activityData,
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await api.get("/user/activities.php");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load activities.");
      }

      return response.data;
    },

    // Refresh activities every 30 seconds.
    refetchInterval: 30000,

    // Don't hammer the API unnecessarily.
    staleTime: 15000,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // null = "haven't read the stored/system preference yet" — this is the
  // fix. The previous version defaulted to the literal string "dark" and
  // had a persist-effect that wrote `theme` to localStorage on every
  // dependency change, including the very first run of that effect on
  // mount — which fired with the *default* "dark" value, before the
  // separate init-effect's real read of localStorage had landed (state
  // updates are async, so both effects run once with the stale default
  // first). That overwrote a saved "light" preference with "dark" for a
  // moment on every mount, and since DashboardLayout remounts on every
  // route change, it was possible to land mid-clobber and get stuck.
  const [theme, setTheme] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Database activities.
   */
  const activities = useMemo(() => {
    if (!activityData?.activities) {
      return [];
    }

    return Array.isArray(activityData.activities)
      ? activityData.activities
      : [];
  }, [activityData]);

  /**
   * Only show the latest 5 activities in the notification dropdown.
   */
  const notifications = useMemo(() => {
    return activities.slice(0, 5).map((activity) => ({
      id: activity.id,
      title: activity.title || "Account Activity",
      content: activity.content || "",
      type: activity.type || "Activity",
      time: formatActivityTime(activity.created_at),
      read:
        activity.read === true ||
        activity.read === 1 ||
        activity.read === "1" ||
        activity.is_read === true ||
        activity.is_read === 1 ||
        activity.is_read === "1",
    }));
  }, [activities]);

  /**
   * Number of unread notifications.
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const avatarInitial = user?.user?.fullname?.charAt(0)?.toUpperCase() ?? "A";

  /**
   * Theme init — read once on mount and apply immediately. No bogus
   * intermediate write to localStorage here; that only happens in the
   * persist effect below, and only once a real value exists.
   */
  useEffect(() => {
    const initial = getInitialTheme();
    document.documentElement.classList.toggle("light", initial === "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
  }, []);

  /**
   * Persist + apply — guarded so it can never run with the placeholder
   * `null` state, which is what caused the clobber bug.
   */
  useEffect(() => {
    if (theme === null) return;

    document.documentElement.classList.toggle("light", theme === "light");

    localStorage.setItem("vaultline-theme", theme);
  }, [theme]);

  // Used anywhere the UI needs to render *something* before the real
  // theme has loaded (brief window on first mount only).
  const displayTheme = theme ?? "dark";

  function toggleTheme() {
    setTheme((prev) => ((prev ?? "dark") === "dark" ? "light" : "dark"));
  }

  function togglePanel(name) {
    setOpenPanel((prev) => (prev === name ? null : name));
  }

  function closePanels() {
    setOpenPanel(null);
  }

  /**
   * Mark one activity as read.
   *
   * This expects your PHP API to support:
   *
   * POST /user/activity_read.php
   *
   * with:
   *
   * {
   *   activity_id: id
   * }
   *
   * If you don't have that API yet, the UI will still work
   * without breaking.
   */
  async function markRead(id) {
    try {
      await api.post("/user/activity_read.php", {
        activity_id: id,
      });

      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    } catch (error) {
      console.error("Failed to mark activity as read:", error);
    }
  }

  /**
   * Escape closes dropdowns.
   */
  useEffect(() => {
    function handleKeydown(e) {
      if (e.key === "Escape") {
        closePanels();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  /**
   * Hide the mobile bottom nav while a form field is focused, so it
   * doesn't sit on top of / overlap the on-screen keyboard. Shown
   * again as soon as the field loses focus.
   */
  useEffect(() => {
    function isFormField(el) {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    }

    function handleFocusIn(e) {
      if (isFormField(e.target)) {
        setKeyboardOpen(true);
      }
    }

    function handleFocusOut(e) {
      if (isFormField(e.target)) {
        setKeyboardOpen(false);
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  function navigateTo(href) {
    closePanels();
    router.push(href);
  }

  /**
   * Logout.
   */
  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    toast.dismiss();

    const logoutRequest = api.post("/auth/logout.php").then((response) => {
      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Logout failed.");
      }

      return res;
    });

    toast.promise(logoutRequest, {
      loading: "Signing out...",

      success: () => {
        queryClient.invalidateQueries({
          queryKey: ["session"],
        });

        queryClient.invalidateQueries({
          queryKey: ["activities"],
        });

        setTimeout(() => {
          router.push("/auth/");
        }, 400);

        return "Signed out successfully.";
      },

      error: (err) =>
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.",
    });

    try {
      await logoutRequest;
    } finally {
      setIsLoggingOut(false);
    }
  }

  function isActiveItem(itemHref) {
    if (itemHref === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }

    return pathname.startsWith(itemHref);
  }

  /**
   * Redirect guards.
   */
  useEffect(() => {
    if (activitiesError?.response?.status === 401) {
      router.push("/auth/");
      return;
    }

    if (user?.isAdmin) {
      router.push("/admin");
    }
  }, [activitiesError, user, router]);

  /**
   * Navigation groups.
   */
  function NavGroups({ onItemClick }) {
    return (
      <div className={styles["nav-groups-wrapper"]}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className={styles["nav-group-box"]}>
            <span className={styles["nav-group-title"]}>{group.title}</span>

            <nav className={styles["nav-list"]}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cx(
                      styles["nav-item"],
                      isActive && styles.active,
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onItemClick}
                  >
                    <span className={styles["nav-rail"]} />

                    <span className={styles["nav-icon-chip"]}>
                      <Icon size={17} />
                    </span>

                    <span>{item.label}</span>

                    {item.id === "signal" && (
                      <span className={styles["nav-badge"]}>New</span>
                    )}

                    {item.id === "bot" && (
                      <span
                        className={`bg-green-500 ${styles["nav-badgePlus"]}`}
                      >
                        AI
                      </span>
                    )}

                    {item.id === "demo" && (
                      <span
                        className={`bg-green-500 ${styles["nav-badgePlus"]}`}
                      >
                        Test
                      </span>
                    )}

                    {item.id === "live" && (
                      <span
                        className={`bg-green-600 ${styles["nav-badgePlus"]}`}
                      >
                        Live
                      </span>
                    )}

                    {item.id === "nft" && (
                      <span
                        className={`bg-yellow-600 ${styles["nav-badgePlus"]}`}
                      >
                        NFT
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    );
  }

  if (isPending) {
    return <div className={styles["loading-screen"]}>Loading...</div>;
  }

  if (!user?.loggedIn || user?.isAdmin) {
    return null;
  }

  return (
    <>
      <div className={styles.shell}>
        {/* Mobile Drawer Overlay */}
        {drawerOpen && (
          <div
            className={styles["drawer-overlay"]}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && setDrawerOpen(false)
            }
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={cx(
            styles.drawer,
            styles["custom-scrollbar"],
            drawerOpen && styles.open,
          )}
        >
          <div className={styles["grid-texture"]} />
          <div className={styles["sidebar-glow"]} />

          <div className={styles["drawer-header"]}>
            <div className={styles.brand}>
              <div className={styles["brand-mark"]}>
                <Copyright size={18} />
              </div>

              <span className={styles["brand-name"]}>Capitaledgehub</span>
            </div>

            <button
              className={styles["icon-chip"]}
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* eslint-disable-next-line react-hooks/static-components */}
          <NavGroups onItemClick={() => setDrawerOpen(false)} />
        </aside>

        {/* Desktop Sidebar */}
        <aside className={cx(styles.sidebar, styles["custom-scrollbar"])}>
          <div className={styles["grid-texture"]} />
          <div className={styles["sidebar-glow"]} />

          <div className={styles["sidebar-top"]}>
            <div className={styles.brand}>
              <div className={styles["brand-mark"]}>
                <Copyright size={18} />
              </div>

              <span className={styles["brand-name"]}>Capitaledgehub</span>
            </div>

            {/* eslint-disable-next-line react-hooks/static-components */}
            <NavGroups onItemClick={undefined} />
          </div>

          <div className={styles["sidebar-footer"]}>
            <div className={styles["network-chip"]}>
              <span className={styles["network-pulse"]} />

              <span className={styles["network-label"]}>Ethereum</span>

              <span className={styles["network-divider"]} />

              <Zap size={12} />

              <span className={styles["network-gas"]}>24 Gwei</span>
            </div>

            <div className={styles["sidebar-actions"]}>
              <button className={styles["sidebar-action"]} aria-label="Support">
                <HelpCircle size={14} />
              </button>

              <button
                className={styles["sidebar-action"]}
                aria-label="Settings"
                onClick={() => navigateTo("/dashboard/settings")}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className={styles["main-wrapper"]}>
          <header className={styles["topbar-sticky"]}>
            <div className={styles["grid-texture"]} />

            <div className={styles["topbar-left"]}>
              <button
                className={cx(styles["icon-chip"], styles["mobile-only-flex"])}
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={18} />
              </button>

              <span
                className={cx(
                  styles["page-title"],
                  styles["desktop-only-flex"],
                )}
              >
                Dashboard
              </span>
            </div>

            <div className={styles["topbar-right"]}>
              {/* Wallet */}
              <div
                className={cx(
                  styles["wallet-chip"],
                  styles["desktop-only-flex"],
                )}
              >
                <span className={styles["wallet-dot"]} />

                <span className={styles["wallet-text"]}>
                  {user?.user?.account_type || "Main Wallet"}
                </span>
              </div>

              {/* Theme */}
              <button
                className={styles["theme-toggle"]}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span
                  className={cx(
                    styles["toggle-track"],
                    displayTheme === "light" && styles.light,
                  )}
                >
                  <span className={styles["toggle-thumb"]}>
                    {displayTheme === "dark" ? (
                      <Moon size={12} />
                    ) : (
                      <Sun size={12} />
                    )}
                  </span>
                </span>
              </button>

              {/* Notifications */}
              <div className={styles["menu-wrap"]}>
                <button
                  className={styles["icon-btn"]}
                  onClick={() => togglePanel("notifications")}
                  aria-label="Notifications"
                >
                  <Bell size={18} />

                  {unreadCount > 0 && (
                    <span className={styles.badge}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {openPanel === "notifications" && (
                  <div
                    className={cx(styles.dropdown, styles["notif-dropdown"])}
                  >
                    {/* Notification Header */}
                    <div className={styles["dropdown-header"]}>
                      <div>
                        <span>Notifications</span>

                        {activities.length > 0 && (
                          <small
                            style={{
                              display: "block",
                              marginTop: "3px",
                              opacity: 0.55,
                              fontSize: "11px",
                            }}
                          >
                            {activities.length} recent{" "}
                            {activities.length === 1
                              ? "activity"
                              : "activities"}
                          </small>
                        )}
                      </div>

                      {/* {unreadCount > 0 && (
                        <button
                          className={styles["text-btn"]}
                          onClick={markAllRead}
                        >
                          <CheckCheck size={13} />
                          Mark all read
                        </button>
                      )} */}
                    </div>

                    {/* Notification List */}
                    <div
                      className={cx(
                        styles["notif-list"],
                        styles["custom-scrollbar"],
                      )}
                    >
                      {/* Loading */}
                      {isActivitiesLoading && (
                        <div
                          style={{
                            padding: "22px 16px",
                            textAlign: "center",
                            opacity: 0.6,
                            fontSize: "13px",
                          }}
                        >
                          Loading activities...
                        </div>
                      )}

                      {/* Error */}
                      {isActivitiesError && !isActivitiesLoading && (
                        <div
                          style={{
                            padding: "18px 16px",
                            textAlign: "center",
                            fontSize: "13px",
                          }}
                        >
                          <p
                            style={{
                              marginBottom: "8px",
                              opacity: 0.7,
                            }}
                          >
                            Could not load notifications.
                          </p>

                          <button
                            className={styles["text-btn"]}
                            onClick={() => refetchActivities()}
                          >
                            Try again
                          </button>
                        </div>
                      )}

                      {/* Empty */}
                      {!isActivitiesLoading &&
                        !isActivitiesError &&
                        notifications.length === 0 && (
                          <div
                            style={{
                              padding: "25px 16px",
                              textAlign: "center",
                              opacity: 0.6,
                              fontSize: "13px",
                            }}
                          >
                            <Bell
                              size={20}
                              style={{
                                margin: "0 auto 8px",
                                opacity: 0.5,
                              }}
                            />

                            <div>No notifications yet.</div>
                          </div>
                        )}

                      {/* Database Activities */}
                      {!isActivitiesLoading &&
                        !isActivitiesError &&
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            className={cx(
                              styles["notif-item"],
                              !notif.read && styles.unread,
                            )}
                            onClick={() => {
                              if (!notif.read) {
                                markRead(notif.id);
                              }
                            }}
                          >
                            <span
                              className={cx(
                                styles["notif-dot-indicator"],
                                !notif.read && styles.visible,
                              )}
                            />

                            <span className={styles["notif-text"]}>
                              <span className={styles["notif-title"]}>
                                {notif.title}
                              </span>

                              {notif.content && (
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "11px",
                                    opacity: 0.6,
                                    marginTop: "3px",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {notif.content}
                                </span>
                              )}

                              <span className={styles["notif-time"]}>
                                {notif.time}
                              </span>
                            </span>
                          </button>
                        ))}
                    </div>

                    {/* View All */}
                    <div
                      style={{
                        borderTop:
                          "1px solid var(--border-color, rgba(255,255,255,0.08))",
                        padding: "10px 12px",
                      }}
                    >
                      <Link
                        href="/dashboard/activity"
                        className={styles["view-all-link"]}
                        onClick={closePanels}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          textDecoration: "none",
                        }}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Menu */}
              <div className={styles["menu-wrap"]}>
                <button
                  className={styles["account-btn"]}
                  onClick={() => togglePanel("user")}
                  aria-label="Account menu"
                >
                  <span className={styles.avatar}>{avatarInitial}</span>

                  <ChevronDown size={14} className={styles.chevron} />
                </button>

                {openPanel === "user" && (
                  <div className={cx(styles.dropdown, styles["user-dropdown"])}>
                    <div className={styles["user-dropdown-header"]}>
                      <span className={cx(styles.avatar, styles["avatar-lg"])}>
                        {avatarInitial}
                      </span>

                      <div>
                        <p className={styles["user-dropdown-name"]}>
                          {user?.user?.fullname}
                        </p>

                        <p className={styles["user-dropdown-email"]}>
                          {user?.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className={styles["dropdown-divider"]} />

                    {DROPDOWN_LINKS.map((link) => {
                      const Icon = link.icon;

                      return (
                        <button
                          key={link.href}
                          className={styles["dropdown-link"]}
                          onClick={() => navigateTo(link.href)}
                        >
                          <Icon size={16} />
                          {link.label}
                        </button>
                      );
                    })}

                    <div className={styles["dropdown-divider"]} />

                    <button
                      className={cx(styles["dropdown-link"], styles.danger)}
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut size={16} />

                      {isLoggingOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles["main-inner"]}>{children}</div>
          </main>
        </div>

        {/* Mobile Bottom Navigation - hidden while a form field is focused
            so it doesn't overlap the on-screen keyboard */}
        <nav
          className={cx(
            styles["bottom-nav"],
            keyboardOpen && styles["bottom-nav-hidden"],
          )}
        >
          <div className={styles["grid-texture"]} />

          {BOTTOM_LEFT.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cx(styles["bottom-item"], isActive && styles.active)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {SEND_ITEM && (
            <Link
              href={SEND_ITEM.href}
              className={cx(
                styles["bottom-fab-wrap"],
                isActiveItem(SEND_ITEM.href) && styles.active,
              )}
              aria-label={SEND_ITEM.label}
              aria-current={isActiveItem(SEND_ITEM.href) ? "page" : undefined}
            >
              <div className={styles["bubble-pulse-outer"]} />

              <div className={styles["bubble-pulse-inner"]} />

              <div className={styles["fab-core"]}>
                <SEND_ITEM.icon size={22} />
              </div>
            </Link>
          )}

          {BOTTOM_RIGHT.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cx(styles["bottom-item"], isActive && styles.active)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Click catcher */}
      {openPanel && (
        <div
          className={styles["click-catcher"]}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onClick={closePanels}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && closePanels()
          }
        />
      )}
    </>
  );
}
