"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, Coins, DollarSign, Plus, Minus } from "lucide-react";

export default function CreditDebitModal({
  show = false,
  user = null,
  availableCoins = [],
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [form, setForm] = useState({
    action: "credit",
    coin_id: "",
    amount: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        action: "credit",
        coin_id: "",
        amount: "",
        description: "",
      });
      setMessage({ type: "", text: "" });
    }
  }, [show]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!form.coin_id) {
      toast.error("Please select a coin");
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!form.description) {
      toast.error("Please enter a description");
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/edit-credit-debit.php", {
        user_id: user?.id,
        ...form,
      });

      const res = response.data;

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        toast.success(res.message || "Transaction completed successfully!");

        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Transaction failed",
        });
        toast.error(res.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Credit/Debit error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to process transaction";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    if (onClose) onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
          <h3
            id="modal-title"
            className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
          >
            <DollarSign
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            Credit/Debit Balance - {user?.fullname || "User"}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Action Type */}
          <div className="mb-4">
            <label
              htmlFor="action"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Action Type
            </label>
            <select
              name="action"
              value={form.action}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
            >
              <option value="credit">✅ Credit (Add)</option>
              <option value="debit">❌ Debit (Subtract)</option>
            </select>
          </div>

          {/* Coin Selection */}
          <div className="mb-4">
            <label
              htmlFor="coin_id"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Coin
            </label>
            <select
              name="coin_id"
              value={form.coin_id}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              required
            >
              <option value="">Select Coin</option>
              {availableCoins.map((coin) => (
                <option key={coin.coin_id} value={coin.coin_id}>
                  {coin.coin_name} ({coin.coin_code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              {availableCoins.length} coins available
            </p>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Amount
            </label>
            <div className="relative">
              <Coins
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                name="amount"
                type="number"
                step="0.000001"
                min="0"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Reason for credit/debit"
              value={form.description}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              required
            />
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.coin_id}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60 ${
                form.action === "credit"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </>
              ) : form.action === "credit" ? (
                <>
                  <Plus size={16} className="mr-1 inline" />
                  Credit
                </>
              ) : (
                <>
                  <Minus size={16} className="mr-1 inline" />
                  Debit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
