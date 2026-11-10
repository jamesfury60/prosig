"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, TrendingUp } from "lucide-react";

export default function CreateTradeRecordsModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [form, setForm] = useState({
    volume: "",
    symbol: "",
    coin_name: "",
    type: "",
    trade_signal: "",
    sl: "",
    tp: "",
    bgat: "",
    sdat: "",
    mdat: "",
    expired_time: "",
    status: "Pending",
    trade_result: "PENDING",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setForm({
        volume: "",
        symbol: "",
        coin_name: "",
        type: "",
        trade_signal: "",
        sl: "",
        tp: "",
        bgat: "",
        sdat: "",
        mdat: "",
        expired_time: "",
        status: "Pending",
        trade_result: "PENDING",
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

  // Create trade
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!form.volume || parseFloat(form.volume) <= 0) {
      toast.error("Please enter a valid volume");
      return;
    }

    if (!form.symbol) {
      toast.error("Please enter a symbol/pair");
      return;
    }

    if (!form.coin_name) {
      toast.error("Please enter a coin name");
      return;
    }

    if (!form.type) {
      toast.error("Please select a trade type");
      return;
    }

    setIsCreating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/create-user-trade.php", {
        userid: user?.id,
        ...form,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Trade record created successfully!",
        });
        toast.success(res.message || "Trade record created successfully!");

        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to create trade record",
        });
        toast.error(res.message || "Failed to create trade record");
      }
    } catch (error) {
      console.error("Create trade error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to create your trade record";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
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
        className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
          <h3
            id="modal-title"
            className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
          >
            <TrendingUp
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            Create Trade Record - {user?.fullname || "User"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Volume */}
            <div>
              <label
                htmlFor="volume"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Volume *
              </label>
              <input
                id="volume"
                name="volume"
                type="number"
                step="0.000001"
                min="0"
                placeholder="Enter trade volume"
                value={form.volume}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>

            {/* Symbol */}
            <div>
              <label
                htmlFor="symbol"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Symbol/Pair *
              </label>
              <input
                id="symbol"
                name="symbol"
                type="text"
                placeholder="e.g., BTC/USDT, ETH/USD"
                value={form.symbol}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>

            {/* Coin Name */}
            <div>
              <label
                htmlFor="coin_name"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Coin Name *
              </label>
              <input
                id="coin_name"
                name="coin_name"
                type="text"
                placeholder="e.g., Bitcoin, Ethereum"
                value={form.coin_name}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
            </div>

            {/* Trade Type */}
            <div>
              <label
                htmlFor="type"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Trade Type *
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                required
              >
                <option value="">Select Type</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            {/* Trade Signal */}
            <div>
              <label
                htmlFor="trade_signal"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Trade Signal
              </label>
              <input
                id="trade_signal"
                name="trade_signal"
                type="text"
                placeholder="Trade signal description"
                value={form.trade_signal}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* Stop Loss (SL) */}
            <div>
              <label
                htmlFor="sl"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Stop Loss (SL)
              </label>
              <input
                id="sl"
                name="sl"
                type="number"
                step="0.000001"
                placeholder="Stop loss price"
                value={form.sl}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* Take Profit (TP) */}
            <div>
              <label
                htmlFor="tp"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Take Profit (TP)
              </label>
              <input
                id="tp"
                name="tp"
                type="number"
                step="0.000001"
                placeholder="Take profit price"
                value={form.tp}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* BGAT */}
            <div>
              <label
                htmlFor="bgat"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                BGAT
              </label>
              <input
                id="bgat"
                name="bgat"
                type="text"
                placeholder="BGAT value"
                value={form.bgat}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* SDAT */}
            <div>
              <label
                htmlFor="sdat"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                SDAT
              </label>
              <input
                id="sdat"
                name="sdat"
                type="text"
                placeholder="SDAT value"
                value={form.sdat}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* MDAT */}
            <div>
              <label
                htmlFor="mdat"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                MDAT
              </label>
              <input
                id="mdat"
                name="mdat"
                type="text"
                placeholder="MDAT value"
                value={form.mdat}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              />
            </div>

            {/* Expired Time */}
            <div>
              <label
                htmlFor="expired_time"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Expired Time
              </label>
              <input
                id="expired_time"
                name="expired_time"
                type="datetime-local"
                value={form.expired_time}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Trade Result */}
            <div>
              <label
                htmlFor="trade_result"
                className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
              >
                Trade Result
              </label>
              <select
                id="trade_result"
                name="trade_result"
                value={form.trade_result}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
              </select>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60"
            >
              {isCreating ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                "Create Trade"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
