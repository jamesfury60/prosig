"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  Globe,
  Clock,
  Filter,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function SpotPage() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(10);
  const [filterType, setFilterType] = useState("");
  const [filterIndicator, setFilterIndicator] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Available types for filter
  const spotTypes = ["crypto", "forex", "stocks", "commodities", "indices"];
  const indicators = ["Bullish", "Bearish", "Neutral", "Volatile", "Stable"];

  // Fetch spots
  const fetchSpots = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: perPage,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (filterType) {
        params.append("type", filterType);
      }
      if (filterIndicator) {
        params.append("indicator", filterIndicator);
      }

      const response = await api.get(`/admin/a_spot_list.php?${params}`);
      const res = response.data;

      if (res.success) {
        setSpots(res.data || []);
        setTotalRecords(res.pagination?.total_records || 0);
        setTotalPages(res.pagination?.total_pages || 1);
      } else {
        toast.error(res.message || "Failed to load spots");
      }
    } catch (error) {
      console.error("Fetch spots error:", error);
      toast.error(error.response?.data?.message || "Failed to load spots");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete spot
  const deleteSpot = async (spotId, spotName) => {
    if (
      !confirm(
        `Are you sure you want to delete spot "${spotName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(spotId);

    try {
      const response = await api.post("/admin/a_delete_spot.php", {
        id: spotId,
      });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Spot deleted successfully!");
        await fetchSpots();
      } else {
        toast.error(res.message || "Failed to delete spot");
      }
    } catch (error) {
      console.error("Delete spot error:", error);
      toast.error(error.response?.data?.message || "Failed to delete spot");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setFilterType("");
    setFilterIndicator("");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Get indicator color
  const getIndicatorColor = (indicator) => {
    const colors = {
      Bullish: "text-emerald-600 dark:text-emerald-400",
      Bearish: "text-red-600 dark:text-red-400",
      Neutral: "text-green-600 dark:text-green-400",
      Volatile: "text-orange-600 dark:text-orange-400",
      Stable: "text-green-600 dark:text-green-400",
    };
    return colors[indicator] || "text-zinc-600 dark:text-zinc-400";
  };

  // Get indicator badge
  const getIndicatorBadge = (indicator) => {
    const badges = {
      Bullish:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
      Bearish: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      Neutral:
        "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
      Volatile:
        "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
      Stable:
        "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    };
    return (
      badges[indicator] ||
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
    );
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "N/A";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    if (num >= 1000)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return num.toFixed(4);
  };

  // Format volume
  const formatVolume = (volume) => {
    if (!volume) return "N/A";
    const num = parseFloat(volume);
    if (isNaN(num)) return volume;
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toString();
  };

  // Format change hours
  const formatChangeHours = (change) => {
    if (!change) return "N/A";
    const num = parseFloat(change);
    if (isNaN(num)) return change;
    const prefix = num > 0 ? "+" : "";
    const color =
      num > 0 ? "text-emerald-500" : num < 0 ? "text-red-500" : "text-zinc-500";
    return { value: `${prefix}${num}%`, color };
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

  // Load spots on mount and when filters change
  useEffect(() => {
    fetchSpots();
  }, [currentPage, searchQuery, filterType, filterIndicator]);

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            Spot Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all trading spots, prices, and market indicators
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total Spots: {totalRecords}
          </span>
          <Link
            href="/admin/spot/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New Spot
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#8b93a7]"
            />
            <input
              type="text"
              placeholder="Search spots by name, title, or currency..."
              onChange={handleSearch}
              defaultValue={searchQuery}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-white dark:placeholder:text-[#8b93a7]"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
              showFilters || filterType || filterIndicator
                ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-950/20 dark:text-green-400"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]"
            }`}
          >
            <Filter size={16} />
            Filters
            {(filterType || filterIndicator) && (
              <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                {(filterType ? 1 : 0) + (filterIndicator ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            onClick={fetchSpots}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-[#232a3b] dark:bg-[#12161f]">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-[#8b93a7]">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="">All Types</option>
                  {spotTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-[#8b93a7]">
                  Indicator
                </label>
                <select
                  value={filterIndicator}
                  onChange={(e) => {
                    setFilterIndicator(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="">All Indicators</option>
                  {indicators.map((indicator) => (
                    <option key={indicator} value={indicator}>
                      {indicator}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-200 dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Loading spots...
              </p>
            </div>
          ) : spots?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <TrendingUp
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No spots found
              </p>
              <Link
                href="/admin/spot/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create First Spot
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Spot Details
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Price & Volume
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Indicator
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Change 24h
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Type
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Created
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {spots.map((spot) => {
                  const change = formatChangeHours(spot.changehours);
                  return (
                    <tr
                      key={spot.id}
                      className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {spot.photo ? (
                            <img
                              src={spot.photo}
                              alt={spot.name}
                              className="h-10 w-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='20' y='20' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='14'%3E%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-500 text-white">
                              <TrendingUp size={16} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {spot.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                              {spot.title} · {spot.currency}
                            </p>
                            <span className="inline-block mt-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-[#1a2035] dark:text-zinc-400">
                              {spot.hours24}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            ${formatPrice(spot.last_price)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                            Vol: {formatVolume(spot.volume)}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getIndicatorBadge(spot.indicator)} ${getIndicatorColor(spot.indicator)}`}
                        >
                          {spot.indicator || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`font-semibold ${change.color}`}>
                          {change.value}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-[#1a2035] dark:text-zinc-300">
                          {spot.type || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <Clock size={14} />
                          <span>{formatDate(spot.created_at)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/spot/${spot.id}`}
                            className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                            title="Edit Spot"
                          >
                            <Edit2
                              size={16}
                              className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                            />
                          </Link>
                          <button
                            onClick={() => deleteSpot(spot.id, spot.name)}
                            disabled={deletingId === spot.id}
                            className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                            title="Delete Spot"
                          >
                            {deletingId === spot.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            ) : (
                              <Trash2
                                size={16}
                                className="text-zinc-400 transition-colors hover:text-red-600 dark:text-[#8b93a7] dark:hover:text-red-400"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {spots?.length > 0 && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Showing {(currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}{" "}
              spots
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="flex items-center px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
