"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  User,
  Image,
  TrendingUp,
  Users,
  Trophy,
  BarChart,
  DollarSign,
  Clock,
  Coins,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function EditCopytraderPage() {
  const router = useRouter();
  const params = useParams();
  const copytraderId = params.id;

  const [form, setForm] = useState({
    name: "",
    photo: "",
    notrades: "",
    nocopiers: "",
    status: "active",
    nowins: "",
    rank: "",
    strategy_desc: "",
    noloss: "",
    profit: "",
    loss: "",
    edate: "",
    commision: "",
    copy_code: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // Fetch copytrader details
  const fetchCopytrader = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(
        `/admin/copytrader-single.php?id=${copytraderId}`,
      );
      const res = response.data;

      if (res.success && res.copytrader) {
        const ct = res.copytrader;
        setForm({
          name: ct.name || "",
          photo: ct.photo || "",
          notrades: ct.notrades || "",
          nocopiers: ct.nocopiers || "",
          status: ct.status || "active",
          nowins: ct.nowins || "",
          rank: ct.rank || "",
          strategy_desc: ct.strategy_desc || "",
          noloss: ct.noloss || "",
          profit: ct.profit || "",
          loss: ct.loss || "",
          edate: ct.edate || "",
          commision: ct.commision || "",
          copy_code: ct.copy_code || "",
        });
      } else {
        toast.error(res.message || "Copytrader not found");
        setTimeout(() => {
          router.push("/admin/copytrader");
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch copytrader error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load copytrader details",
      );
      setTimeout(() => {
        router.push("/admin/copytrader");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Update copytrader
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.name || !form.strategy_desc) {
      toast.error("Name and strategy description are required");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...form,
        id: copytraderId,
        commision: parseInt(form.commision || 0),
      };

      const response = await api.post("/admin/copytrader-update.php", payload);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Copytrader updated successfully!");
        setTimeout(() => {
          router.push("/admin/copytrader");
        }, 600);
      } else {
        toast.error(res.message || "Failed to update copytrader");
      }
    } catch (error) {
      console.error("Update copytrader error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update copytrader",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original values
  const resetForm = async () => {
    await fetchCopytrader();
    toast.dismiss();
    toast.info("Form has been reset");
  };

  // Get rank color
  const getRankColor = (rank) => {
    const colors = {
      Excellent: "text-emerald-400",
      Pro: "text-green-400",
      "High achiever": "text-green-400",
      "Top trader": "text-yellow-400",
      Expert: "text-red-400",
    };
    return colors[rank] || "";
  };

  // Load copytrader data on mount
  useEffect(() => {
    fetchCopytrader();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 lg:p-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
            <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Loading copytrader details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/copytrader"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Copytraders
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Edit Copytrader
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update copytrader information, performance, and settings
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Copytrader Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Copytrader Preview
            </h3>
            <div className="flex items-center gap-4 md:gap-6">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-2xl font-bold text-white">
                  <span>{form.name?.charAt(0) || "?"}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {form.name || "N/A"}
                </div>
                <div className={`text-sm ${getRankColor(form.rank)}`}>
                  Rank: {form.rank || "N/A"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                  Code:{" "}
                  <b className="text-zinc-900 dark:text-white">
                    {form.copy_code || "N/A"}
                  </b>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Name *
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., John Doe, CryptoMaster"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="photo"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Photo URL
                </label>
                <div className="relative">
                  <Image
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="photo"
                    type="url"
                    placeholder="https://i.imgur.com/Q2Gp1B3.png"
                    value={form.photo}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                    Upload your image to one of the free image hosts below:
                  </p>
                  <ul className="ml-4 list-disc space-y-0.5 text-xs">
                    <li>
                      <a
                        href="https://imgbb.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline dark:text-green-400"
                      >
                        imgbb.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://postimages.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline dark:text-green-400"
                      >
                        postimages.org
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://imgur.com/upload"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline dark:text-green-400"
                      >
                        Imgur
                      </a>
                    </li>
                  </ul>
                  <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                    Paste the image direct URL (ends in .jpg, .png, etc.)
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="strategy_desc"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Strategy Description *
                </label>
                <textarea
                  id="strategy_desc"
                  rows="3"
                  placeholder="Describe the trading strategy in detail..."
                  value={form.strategy_desc}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Statistics
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="notrades"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Number of Trades
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="notrades"
                    type="text"
                    placeholder="0"
                    value={form.notrades}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nocopiers"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Number of Copiers
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="nocopiers"
                    type="text"
                    placeholder="4/1,000"
                    value={form.nocopiers}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nowins"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Number of Wins
                </label>
                <div className="relative">
                  <Trophy
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="nowins"
                    type="text"
                    placeholder="+$811,467.35"
                    value={form.nowins}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="noloss"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Number of Losses
                </label>
                <div className="relative">
                  <BarChart
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="noloss"
                    type="text"
                    placeholder="0"
                    value={form.noloss}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Performance
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="profit"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Win Rate
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="profit"
                    type="text"
                    placeholder="+14.16%"
                    value={form.profit}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="loss"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Loss ($)
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="loss"
                    type="text"
                    placeholder="0"
                    value={form.loss}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rank"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Rank
                </label>
                <select
                  id="rank"
                  value={form.rank}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="">Select rank</option>
                  <option value="Excellent">🏆 Excellent</option>
                  <option value="Pro">⭐ Pro</option>
                  <option value="High achiever">🚀 High achiever</option>
                  <option value="Top trader">👑 Top trader</option>
                  <option value="Expert">💎 Expert</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="commision"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Commission Fees (%)
                </label>
                <div className="relative">
                  <Coins
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="commision"
                    type="number"
                    step="1"
                    placeholder="0"
                    min="0"
                    value={form.commision}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="copy_code"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Copy Code
                </label>
                <div className="relative">
                  <Coins
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="copy_code"
                    type="text"
                    placeholder="Enter copy code"
                    value={form.copy_code}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Unique code for this copytrader
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Settings
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                >
                  <option value="active">
                    🟢 Active - Available for copying
                  </option>
                  <option value="inactive">🔴 Inactive - Not available</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edate"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Time/Experience
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="edate"
                    type="text"
                    placeholder="3 months, 2 weeks"
                    value={form.edate}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Copytrader Summary Preview
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Name
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.name || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Rank
                </span>
                <span
                  className={`block font-semibold ${getRankColor(form.rank)}`}
                >
                  {form.rank || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Trades
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.notrades || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Win Rate
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.profit || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Copytrader
                </>
              )}
            </button>

            <Link
              href="/admin/copytrader"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              <X size={18} />
              Cancel
            </Link>

            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              Reset Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
