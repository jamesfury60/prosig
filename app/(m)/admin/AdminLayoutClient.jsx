"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Shield,
  Bell,
  Sun,
  Moon,
  Coins,
  LineChart,
  Newspaper,
  Layers,
  Bot,
  Mail,
  TrendingUp,
  ChevronDown,
  User,
  Key,
  Spool,
  Signal,
  EthernetPort,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";

import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coins", label: "Coins", icon: Coins },
  { href: "/admin/copytrader", label: "Copy Traders", icon: LineChart },
  { href: "/admin/staking", label: "Staking", icon: TrendingUp },
  { href: "/admin/nft", label: "NFT", icon: EthernetPort },
  { href: "/admin/news", label: "Blog News", icon: Newspaper },
  { href: "/admin/plans", label: "Trading Plans", icon: Layers },
  { href: "/admin/spot", label: "Spots", icon: Spool },
  { href: "/admin/signals", label: "Signals", icon: Signal },
  { href: "/admin/subscriptions", label: "Bots", icon: Bot },
  { href: "/admin/webmail", label: "Webmail", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { theme, setTheme } = useTheme();
  const admin = useMe();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await api.post("/auth/logout.php");

      queryClient.clear();

      toast.success("Logged out successfully");

      router.replace("/auth/adminlogin");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to logout. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-[#080b11] dark:text-zinc-100">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md dark:border-[#1b2230] dark:bg-[#0d1119]/90 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-[#151b26]"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
            <Shield size={16} className="text-zinc-950" />
          </div>

          <span className="text-sm font-semibold">Admin Hub</span>
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-[#151b26]"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} className="text-zinc-700" />
          )}
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-[280px]
          overflow-y-auto border-r
          bg-white transition-transform duration-300 ease-in-out
          dark:border-[#1b2230] dark:bg-[#0d1119]
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-zinc-200 p-5 dark:border-[#1b2230]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400">
                  <Shield size={20} className="text-zinc-950" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Admin Hub</h2>

                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500 dark:text-[#7d879a]">
                    Control Panel v2.0
                  </p>
                </div>
              </div>

              <button
                onClick={closeSidebar}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-[#151b26] lg:hidden"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    group relative flex items-center gap-3 rounded-lg
                    px-4 py-2.5 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950 dark:bg-[#171e2a] dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-[#8993a6] dark:hover:bg-[#131923]"
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 h-6 w-0.5 rounded-r bg-amber-400" />
                  )}

                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:text-[#788398] dark:group-hover:text-white"
                    }
                  />

                  <span className="flex-1">{item.label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-zinc-200 p-4 dark:border-[#1b2230]">
            {/* Admin Card */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex w-full items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:bg-[#131923] dark:hover:bg-[#171e2a]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-zinc-950">
                  {admin.data?.user?.fullname?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {admin.data?.user?.fullname || "Admin User"}
                  </p>

                  <p className="truncate font-mono text-xs text-zinc-500 dark:text-[#7d879a]">
                    {admin.data?.user?.email || "admin@example.com"}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-400 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-[#1b2230] dark:bg-[#0f141d]">
                  <Link
                    href="/admin/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-[#151b26]"
                  >
                    <Key size={16} className="text-zinc-400" />
                    Security
                  </Link>

                  <div className="border-t border-zinc-200 dark:border-[#1b2230]" />

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Theme */}
            <button
              onClick={toggleTheme}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-[#151b26] lg:hidden"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={18} className="text-amber-400" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[280px]">
        {/* Desktop Top Bar */}
        <div className="sticky top-0 z-20 hidden border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-[#1b2230] dark:bg-[#0d1119]/85 lg:block">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Welcome back, {admin?.name?.split(" ")[0] || "Admin"}
              </h1>

              <p className="mt-0.5 text-sm text-zinc-500 dark:text-[#7d879a]">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-[#151b26]"
                aria-label="Notifications"
              >
                <Bell size={20} />

                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0d1119]" />
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-[#151b26]"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-20 lg:p-8 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
