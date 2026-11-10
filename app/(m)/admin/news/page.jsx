"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Newspaper,
  User,
  Tag,
  Image,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);

  // Fetch news
  const loadNews = async (search = searchQuery) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      const url = `/admin/news-list.php${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await api.get(url);
      const res = response.data;

      if (res.success) {
        setNews(res.news || []);
      } else {
        toast.error(res.message || "Failed to load news");
      }
    } catch (error) {
      console.error("Fetch news error:", error);

      toast.error(error.response?.data?.message || "Failed to load news");
    } finally {
      setIsLoading(false);
    }
  };

  // Load news when search changes
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const url = `/admin/news-list.php${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await api.get(url);
        const res = response.data;

        if (res.success) {
          setNews(res.news || []);
        } else {
          toast.error(res.message || "Failed to load news");
        }
      } catch (error) {
        console.error("Fetch news error:", error);

        toast.error(error.response?.data?.message || "Failed to load news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery]);

  // Delete news
  const deleteNews = async (newsId, newsTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete news "${newsTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await api.post("/admin/news-delete.php", {
        id: newsId,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "News deleted successfully!");

        // Reload news after deletion
        await loadNews(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete news");
      }
    } catch (error) {
      console.error("Delete news error:", error);

      toast.error(error.response?.data?.message || "Failed to delete news");
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Truncate content
  const truncateContent = (content, length = 10) => {
    if (!content) return "";

    return content.length > length
      ? content.substring(0, length) + "..."
      : content;
  };

  // Get type color
  const getTypeColor = (type) => {
    const colors = {
      "Breaking News": "bg-red-500",
      "Market Update": "bg-green-500",
      "Company News": "bg-green-500",
      "Trading Tips": "bg-yellow-500",
      "Economic Report": "bg-green-500",
      Technology: "bg-green-500",
      Cryptocurrency: "bg-orange-500",
      Forex: "bg-green-500",
      Stocks: "bg-pink-500",
      Analysis: "bg-green-500",
    };

    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
            News Management
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
            Manage all news articles, updates, and announcements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-[#8b93a7]">
            Total News: {news?.length || 0}
          </span>

          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New News
          </Link>
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
          placeholder="Search news by title, content, or author..."
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
                Loading news...
              </p>
            </div>
          ) : news?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Newspaper
                size={48}
                className="text-zinc-300 opacity-30 dark:text-[#8b93a7]"
              />

              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                No news articles found
              </p>

              <Link
                href="/admin/news/create"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create First News Article
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    News Article
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Author & Type
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Media
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {news.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-[#232a3b] dark:hover:bg-[#1a2035]"
                  >
                    {/* News Article */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 min-w-[1.25rem] items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-600 text-white">
                          <Newspaper size={15} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {truncateContent(item.title, 10)}
                          </p>

                          <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                            {truncateContent(item.content, 10)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author & Type */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-[#8b93a7]">
                          <User size={14} />
                          <span>{item.author}</span>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${getTypeColor(
                            item.type,
                          )}`}
                        >
                          <Tag size={10} />
                          {item.type}
                        </span>
                      </div>
                    </td>

                    {/* Media */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {item.photo ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            <Image size={14} />
                            Has Photo
                          </span>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-[#1a2035] dark:text-[#8b93a7]">
                            <Image size={14} />
                            No Photo
                          </span>
                        )}

                        {item.mylink && (
                          <span className="inline-flex w-fit items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                            <LinkIcon size={14} />
                            Has Link
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#8b93a7]">
                        <Calendar size={14} />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/news/${item.id}`}
                          className="rounded-lg p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Edit News"
                        >
                          <Edit2
                            size={16}
                            className="text-zinc-400 transition-colors hover:text-green-600 dark:text-[#8b93a7] dark:hover:text-green-400"
                          />
                        </Link>

                        <button
                          onClick={() => deleteNews(item.id, item.title)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete News"
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
        {news?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                Showing {news.length} of {news.length} news articles
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
