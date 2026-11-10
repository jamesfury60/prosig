"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  FileText,
  User,
  Tag,
  Image,
  Link as LinkIcon,
  Newspaper,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

const newsTypes = [
  "Breaking News",
  "Market Update",
  "Company News",
  "Trading Tips",
  "Economic Report",
  "Technology",
  "Cryptocurrency",
  "Forex",
  "Stocks",
  "Analysis",
];

export default function CreateNewsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    type: "",
    mylink: "",
    photo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOtherType, setShowOtherType] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Handle type selection
  function handleTypeChange(e) {
    const value = e.target.value;
    if (value === "other") {
      setShowOtherType(true);
      setForm({
        ...form,
        type: "",
      });
    } else {
      setShowOtherType(false);
      setForm({
        ...form,
        type: value,
      });
    }
  }

  // Create news article
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    // Basic validation
    if (!form.title || !form.content || !form.author || !form.type) {
      toast.error("Title, content, author, and type are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin/news-create.php", form);
      const res = response.data;

      if (res.success) {
        toast.success(res.message || "News article created successfully!");

        // Reset form
        setForm({
          title: "",
          content: "",
          author: "",
          type: "",
          mylink: "",
          photo: "",
        });
        setShowOtherType(false);

        setTimeout(() => {
          router.push("/admin/news");
        }, 600);
      } else {
        toast.error(res.message || "Failed to create news article");
      }
    } catch (error) {
      console.error("Create news error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create news article",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form
  function resetForm() {
    setForm({
      title: "",
      content: "",
      author: "",
      type: "",
      mylink: "",
      photo: "",
    });
    setShowOtherType(false);
    toast.dismiss();
    toast.info("Form has been reset");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/news"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to News
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Create New News Article
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Add a new news article to keep users informed
        </p>
      </div>

      {/* Form Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Article Information */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Article Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
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
                    placeholder="Enter news title"
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
                  htmlFor="content"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Content *
                </label>
                <textarea
                  name="content"
                  rows="6"
                  placeholder="Write the news content here..."
                  value={form.content}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="author"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Author *
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="author"
                      type="text"
                      placeholder="Author name"
                      value={form.author}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                      required
                    />
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
                    <Tag
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      name="type"
                      value={form.type || ""}
                      onChange={handleTypeChange}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                      required
                    >
                      <option value="">Select news type</option>
                      {newsTypes.map((newsType) => (
                        <option key={newsType} value={newsType}>
                          {newsType}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {showOtherType && (
                    <input
                      name="type"
                      type="text"
                      placeholder="Specify type"
                      value={form.type}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media & Links */}
          <div className="mb-6">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Media & Links
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    name="photo"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={form.photo}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  External image URL for the news article
                </p>
              </div>

              <div>
                <label
                  htmlFor="mylink"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  External Link
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    name="mylink"
                    type="url"
                    placeholder="https://example.com/full-article"
                    value={form.mylink}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Link to full article (optional)
                </p>
              </div>
            </div>

            {/* Photo Preview */}
            {form.photo && (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  Photo Preview
                </h3>
                <img
                  src={form.photo}
                  alt={form.title || "Preview"}
                  className="h-48 w-full rounded-md object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Article Summary Preview */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
              Article Summary Preview
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Title
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.title || "—"}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Author
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.author || "—"}
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
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
                <span className="block text-xs text-zinc-500 dark:text-[#8b93a7]">
                  Has Image
                </span>
                <span className="block font-semibold text-zinc-900 dark:text-white">
                  {form.photo ? "✅ Yes" : "❌ No"}
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
                  Create News Article
                </>
              )}
            </button>

            <Link
              href="/admin/news"
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
              <Newspaper size={18} />
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
