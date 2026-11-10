"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";
import { useMe } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const admin = useMe();

  const isUnauthorized = admin.error?.response?.status === 401;

  const isNotAdmin = admin.data && !admin.data.isAdmin;

  useEffect(() => {
    if (admin.isPending) return;

    if (isUnauthorized || isNotAdmin) {
      router.replace("/auth/adminlogin");
    }
  }, [admin.isPending, isUnauthorized, isNotAdmin, router]);

  // Still checking authentication
  if (admin.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-green-500" />
          <span>Loading...</span>
        </div>
      </main>
    );
  }

  // Don't render admin content while redirecting
  if (isUnauthorized || isNotAdmin) {
    return null;
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
