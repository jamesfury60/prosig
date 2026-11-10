"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Mail,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`/admin/get-all-users.php?${params}`);
      const res = response.data;

      if (res.success) {
        setUsers(res.users || []);
      } else {
        toast.error(res.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await api.post("/admin/delete-user.php", { userId });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "User deleted successfully!");
        await fetchUsers();
      } else {
        toast.error(res.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  // Format number
  const formatNumber = (num, precision = 2) => {
    if (num == null) return "0." + "0".repeat(precision);
    if (num === 0) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    if (num < 1000) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status class
  const getStatusClass = (verified) => {
    return verified === "true" ? "verified" : "unverified";
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all users, view balances, and control access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]">
            <Users size={16} className="text-green-600 dark:text-green-400" />
            Total Users: {users?.length || 0}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#8b93a7]"
        />
        <input
          type="text"
          placeholder="Search users by name or email..."
          onChange={handleSearch}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-white dark:placeholder:text-[#8b93a7]"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Loading users...
              </p>
            </div>
          ) : users?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Users
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No users found
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    User
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Total ($)
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Joined
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-sm font-semibold text-white">
                          {user.fullname?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {user.fullname}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-zinc-400" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {user?.currency || "NAN"}
                          {formatNumber(user.balances?.total_balance)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-[#8b93a7]">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          user.is_verified === "true"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {user.is_verified === "true" ? (
                          <>
                            <CheckCircle size={12} />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Unverified
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                        <Calendar size={14} />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit User"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>
                        <button
                          onClick={() => deleteUser(user.id, user.fullname)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete User"
                        >
                          <Trash2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-red-600 dark:text-[#8b93a7] dark:hover:text-red-400"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        {users?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Showing {users.length} of {users.length} users
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]">
                Previous
              </button>
              <button className="rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white transition hover:bg-green-700">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
