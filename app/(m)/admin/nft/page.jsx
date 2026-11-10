"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Image,
  DollarSign,
  Filter,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Hash,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function NFTPage() {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(10);
  const [filterBlockchain, setFilterBlockchain] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Available options
  const blockchains = ["ETH", "BSC", "SOL", "POLYGON", "AVALANCHE"];
  const types = ["Active", "Inactive", "Pending"];

  // Fetch NFTs
  const fetchNFTs = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: perPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (filterBlockchain) params.append("blockchain", filterBlockchain);
      if (filterType) params.append("type", filterType);

      const response = await api.get(`/admin/nft_list.php?${params}`);
      const res = response.data;

      if (res.success) {
        setNfts(res.data || []);
        setTotalRecords(res.pagination?.total_records || 0);
        setTotalPages(res.pagination?.total_pages || 1);
      } else {
        toast.error(res.message || "Failed to load NFTs");
      }
    } catch (error) {
      console.error("Fetch NFTs error:", error);
      toast.error(error.response?.data?.message || "Failed to load NFTs");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete NFT
  const deleteNFT = async (nftId, nftTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete NFT "${nftTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(nftId);

    try {
      const response = await api.post("/admin/nft_delete.php", { id: nftId });
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "NFT deleted successfully!");
        await fetchNFTs();
      } else {
        toast.error(res.message || "Failed to delete NFT");
      }
    } catch (error) {
      console.error("Delete NFT error:", error);
      toast.error(error.response?.data?.message || "Failed to delete NFT");
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
    setFilterBlockchain("");
    setFilterType("");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
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

  // Get blockchain icon
  const getBlockchainIcon = (blockchain) => {
    const icons = {
      ETH: "🔷",
      BSC: "🟡",
      SOL: "🟣",
      POLYGON: "🔵",
      AVALANCHE: "🔴",
    };
    return icons[blockchain] || "⛓️";
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const badges = {
      Active:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
      Inactive: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      Pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
    };
    return (
      badges[type] ||
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
    );
  };

  // Load NFTs on mount and when filters change
  useEffect(() => {
    fetchNFTs();
  }, [currentPage, searchQuery, filterBlockchain, filterType]);

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            NFT Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all NFTs, collections, and tokens
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total NFTs: {totalRecords}
          </span>
          <Link
            href="/admin/nft/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New NFT
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
              placeholder="Search NFTs by title, contract, or token ID..."
              onChange={handleSearch}
              defaultValue={searchQuery}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-white dark:placeholder:text-[#8b93a7]"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
              showFilters || filterBlockchain || filterType
                ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-950/20 dark:text-green-400"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-[#232a3b] dark:bg-[#12161f] dark:text-zinc-300 dark:hover:bg-[#1a2035]"
            }`}
          >
            <Filter size={16} />
            Filters
            {(filterBlockchain || filterType) && (
              <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                {(filterBlockchain ? 1 : 0) + (filterType ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            onClick={fetchNFTs}
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
                  Blockchain
                </label>
                <select
                  value={filterBlockchain}
                  onChange={(e) => {
                    setFilterBlockchain(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="">All Blockchains</option>
                  {blockchains.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain}
                    </option>
                  ))}
                </select>
              </div>

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
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                Loading NFTs...
              </p>
            </div>
          ) : nfts?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Image
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No NFTs found
              </p>
              <Link
                href="/admin/nft/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create First NFT
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    #
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    NFT Details
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Amount
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Contract
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Token ID
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Blockchain
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Type
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {nfts.map((nft, index) => (
                  <tr
                    key={nft.id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    <td className="px-4 py-3 text-zinc-500 dark:text-[#8b93a7]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {nft.image ? (
                          <img
                            src={nft.image}
                            alt={nft.title}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='24' y='24' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E🖼%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-500 text-white">
                            <Image size={20} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {nft.title}
                          </p>
                          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                            {nft.content || "No description"}
                          </p>
                          <span className="inline-block mt-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-[#1a2035] dark:text-zinc-400">
                            <Tag size={10} className="inline mr-1" />
                            {nft.token_standard}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-500 dark:text-emerald-400">
                        <DollarSign size={14} />
                        <span>{parseFloat(nft.amount).toFixed(2)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <LinkIcon size={14} className="text-zinc-400" />
                        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                          {nft.contracts?.slice(0, 10)}...
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Hash size={14} className="text-zinc-400" />
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                          {nft.token_id}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-[#1a2035] dark:text-zinc-300">
                        <span>{getBlockchainIcon(nft.blockchain)}</span>
                        {nft.blockchain}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeBadge(nft.type)}`}
                      >
                        {nft.type || "N/A"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/nft/${nft.id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit NFT"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>
                        <button
                          onClick={() => deleteNFT(nft.id, nft.title)}
                          disabled={deletingId === nft.id}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                          title="Delete NFT"
                        >
                          {deletingId === nft.id ? (
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {nfts?.length > 0 && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Showing {(currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}{" "}
              NFTs
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
