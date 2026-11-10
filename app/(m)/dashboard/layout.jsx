"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "./DashboardLayout";
import { useMe } from "@/lib/auth";

export default function UserDashboardLayout({ children }) {
  const router = useRouter();
  const user = useMe();

  const isUnauthorized = user.error?.response?.status === 401;

  const isNotLoggedIn = user.data && !user.data.loggedIn;

  const isAdmin = user.data?.isAdmin;

  useEffect(() => {
    if (user.isPending) return;

    // Not authenticated
    if (isUnauthorized || isNotLoggedIn) {
      router.replace("/auth/");
      return;
    }

    // Admins shouldn't access the user dashboard
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [user.isPending, isUnauthorized, isNotLoggedIn, isAdmin, router]);

  // Checking authentication
  // Checking authentication
  if (user.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#060810]">
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-[spin_1.5s_linear_infinite]">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-green-500 dark:text-green-400"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="6"
                  strokeDasharray="60 150"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-green-500 dark:text-green-400 opacity-50"
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  strokeWidth="4"
                  strokeDasharray="40 100"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-green-500 shadow-[0_0_30px_rgba(34, 197, 94,0.4)]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <span>Loading</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500 dark:bg-green-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500 dark:bg-green-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500 dark:bg-green-400 [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      </main>
    );
  }

  // Don't render dashboard while redirecting
  if (isUnauthorized || isNotLoggedIn || isAdmin) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
