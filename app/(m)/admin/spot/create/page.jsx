"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  RefreshCw,
  DollarSign,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Tag,
  FileText,
  Briefcase,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function CreateSpotPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    title: "",
    currency: "USD",
    indicator: "Neutral",
    hours24: "24h",
    last_price: "",
    volume: "",
    changehours: "",
    type: "crypto",
    photo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState("");

  // Spot types
  const spotTypes = [
    { value: "crypto", label: "Cryptocurrency" },
    { value: "forex", label: "Forex" },
    { value: "stocks", label: "Stocks" },
    { value: "commodities", label: "Commodities" },
    { value: "indices", label: "Indices" },
  ];

  // Indicators
  const indicators = ["Bullish", "Bearish", "Neutral", "Volatile", "Stable"];

  // Currencies
  const currencies = ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH", "USDT"];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Set preview when photo URL is entered
    if (name === "photo") {
      setPreviewPhoto(value);
    }
  }

  // Create spot
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (
      !form.name ||
      !form.title ||
      !form.currency ||
      !form.indicator ||
      !form.hours24 ||
      !form.last_price ||
      !form.volume ||
      !form.changehours ||
      !form.type
    ) {
      toast.error("All fields are required");
      return;
    }

    // Validate numeric fields
    if (isNaN(form.last_price) || parseFloat(form.last_price) < 0) {
      toast.error("Last price must be a positive number");
      return;
    }
    if (isNaN(form.volume) || parseFloat(form.volume) < 0) {
      toast.error("Volume must be a positive number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/a_add_spot.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Spot created successfully!");

        // Reset form
        setForm({
          name: "",
          title: "",
          currency: "USD",
          indicator: "Neutral",
          hours24: "24h",
          last_price: "",
          volume: "",
          changehours: "",
          type: "crypto",
          photo: "",
        });
        setPreviewPhoto("");

        setTimeout(() => {
          router.push("/admin/spot");
        }, 600);
      } else {
        toast.error(res.message || "Failed to create spot");
      }
    } catch (error) {
      console.error("Create spot error:", error);
      toast.error(error.response?.data?.message || "Failed to create spot");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form
  function resetForm() {
    setForm({
      name: "",
      title: "",
      currency: "USD",
      indicator: "Neutral",
      hours24: "24h",
      last_price: "",
      volume: "",
      changehours: "",
      type: "crypto",
      photo: "",
    });
    setPreviewPhoto("");
    toast.dismiss();
    toast.info("Form has been reset");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/spot"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Spots
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Create New Spot
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Add a new trading spot with price and market data
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Spot Name *
                </label>
                <div className="relative">
                  <Tag
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g., BTC/USD"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Title *
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., Bitcoin"
                    value={form.title}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Currency *
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Type *
                </label>
                <div className="relative">
                  <Briefcase
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  >
                    {spotTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Market Data
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="last_price"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Last Price *
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="last_price"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="45000.50"
                    value={form.last_price}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="volume"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Volume *
                </label>
                <div className="relative">
                  <BarChart3
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="volume"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1250000"
                    value={form.volume}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="changehours"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Change 24h (%) *
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="changehours"
                    type="number"
                    step="0.01"
                    placeholder="+2.5"
                    value={form.changehours}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hours24"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  24 Hours *
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="hours24"
                    type="text"
                    placeholder="24h"
                    value={form.hours24}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Indicator & Photo */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Additional Details
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="indicator"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Indicator *
                </label>
                <div className="relative">
                  <TrendingUp
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <select
                    name="indicator"
                    value={form.indicator}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  >
                    {indicators.map((indicator) => (
                      <option key={indicator} value={indicator}>
                        {indicator}
                      </option>
                    ))}
                  </select>
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
                  <ImageIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="photo"
                    type="text"
                    placeholder="https://example.com/spot-image.png"
                    value={form.photo}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Optional image URL for the spot icon
                </p>
              </div>
            </div>

            {/* Photo Preview */}
            {previewPhoto && (
              <div className="mt-4 rounded-lg border border-zinc-200 p-3 dark:border-[#232a3b]">
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-[#8b93a7]">
                  Photo Preview:
                </p>
                <img
                  src={previewPhoto}
                  alt="Spot preview"
                  className="h-20 w-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Spot Summary */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Spot Summary
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
                  Price
                </span>
                <span className="block font-semibold text-emerald-500 dark:text-emerald-400">
                  {form.last_price ? `$${form.last_price}` : "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Indicator
                </span>
                <span className="block font-semibold text-green-500 dark:text-green-400">
                  {form.indicator || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Type
                </span>
                <span className="block font-semibold text-green-500 dark:text-green-400">
                  {form.type || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Spot
                </>
              )}
            </button>

            <Link
              href="/admin/spot"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              <X size={18} />
              Cancel
            </Link>

            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
