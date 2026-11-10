"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  X,
  ArrowRight,
  Coins,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ConvertBalancesModal({
  show = false,
  user = null,
  availableCoins = [],
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [form, setForm] = useState({
    coin_id: "",
    amount: "",
    conversion_type: "",
  });

  const [isConverting, setIsConverting] = useState(false);
  const [currentBalances, setCurrentBalances] = useState(null);
  const [maxAmount, setMaxAmount] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setForm({
        coin_id: "",
        amount: "",
        conversion_type: "",
      });
      setCurrentBalances(null);
      setMaxAmount(0);
      setMessage({ type: "", text: "" });
    }
  }, [show]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Update max amount based on conversion type and balances
  const updateMaxAmount = useCallback(
    (balances = currentBalances) => {
      if (!balances || !form.conversion_type) {
        setMaxAmount(0);
        return;
      }

      let max = 0;
      switch (form.conversion_type) {
        case "to_on_order":
          max = balances.available_balance || 0;
          break;
        case "to_available":
          max = balances.on_order_balance || 0;
          break;
        case "too_available":
          max = balances.staked_balance || 0;
          break;
        default:
          max = 0;
      }
      setMaxAmount(max);
    },
    [form.conversion_type, currentBalances],
  );

  // Fetch current balances when coin is selected
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchCoinBalances = useCallback(async () => {
    if (!form.coin_id) {
      setCurrentBalances(null);
      setMaxAmount(0);
      return;
    }

    try {
      const response = await api.get(
        `/admin/convert-user-coins-list.php?userid=${user?.id}&coin_id=${form.coin_id}`,
      );
      const res = response.data;

      if (res.success) {
        setCurrentBalances(res.balances);
        // Update max amount after balances are set
        const balances = res.balances;
        let max = 0;
        switch (form.conversion_type) {
          case "to_on_order":
            max = balances.available_balance || 0;
            break;
          case "to_available":
            max = balances.on_order_balance || 0;
            break;
          case "too_available":
            max = balances.staked_balance || 0;
            break;
          default:
            max = 0;
        }
        setMaxAmount(max);
      } else {
        setCurrentBalances({
          available_balance: 0,
          on_order_balance: 0,
          staked_balance: 0,
        });
        setMaxAmount(0);
        toast.error(res.message || "Failed to fetch balances");
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setCurrentBalances({
        available_balance: 0,
        on_order_balance: 0,
        staked_balance: 0,
      });
      setMaxAmount(0);
      toast.error("Failed to fetch balances");
    }
  }, [form.coin_id, form.conversion_type, user?.id]);

  // Handle coin selection change
  const handleCoinChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      coin_id: value,
    });
    // Fetch balances will be triggered by useEffect
  };

  // Handle conversion type change
  const handleConversionTypeChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      conversion_type: value,
    });
    // Update max amount will be triggered by useEffect
  };

  // Update max amount when conversion type changes
  useEffect(() => {
    if (currentBalances && form.conversion_type) {
      let max = 0;
      switch (form.conversion_type) {
        case "to_on_order":
          max = currentBalances.available_balance || 0;
          break;
        case "to_available":
          max = currentBalances.on_order_balance || 0;
          break;
        case "too_available":
          max = currentBalances.staked_balance || 0;
          break;
        default:
          max = 0;
      }
      setMaxAmount(max);
    } else {
      setMaxAmount(0);
    }
  }, [form.conversion_type, currentBalances]);

  // Fetch balances when coin changes
  useEffect(() => {
    if (form.coin_id) {
      fetchCoinBalances();
    } else {
      setCurrentBalances(null);
      setMaxAmount(0);
    }
  }, [form.coin_id, fetchCoinBalances]);

  // Set amount to maximum
  function setMaxAmountValue() {
    setForm({
      ...form,
      amount: maxAmount.toString(),
    });
  }

  // Helper functions for display
  function getFromBalanceType() {
    switch (form.conversion_type) {
      case "to_on_order":
        return "Available Balance";
      case "to_available":
        return "On Order Balance";
      case "too_available":
        return "Staked Balance";
      default:
        return "";
    }
  }

  function getToBalanceType() {
    switch (form.conversion_type) {
      case "to_on_order":
        return "On Order Balance";
      case "to_available":
        return "Available Balance";
      case "too_available":
        return "Available Balance";
      default:
        return "";
    }
  }

  function formatNumber(num, precision = 6) {
    if (!num && num !== 0) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  }

  // Convert balances
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!form.coin_id) {
      toast.error("Please select a coin");
      return;
    }

    if (!form.conversion_type) {
      toast.error("Please select a conversion type");
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(form.amount) > maxAmount) {
      toast.error(`Amount cannot exceed ${formatNumber(maxAmount)}`);
      return;
    }

    setIsConverting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/convert-user-balances.php", {
        userid: user?.id,
        coin_id: form.coin_id,
        amount: parseFloat(form.amount),
        conversion_type: form.conversion_type,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Balances converted successfully!",
        });
        toast.success(res.message || "Balances converted successfully!");

        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to convert balances",
        });
        toast.error(res.message || "Failed to convert balances");
      }
    } catch (error) {
      console.error("Convert balances error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to convert balances";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsConverting(false);
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
            <Coins size={20} className="text-green-600 dark:text-green-400" />
            Convert Balances - {user?.fullname || "User"}
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
          {/* Coin Selection */}
          <div className="mb-4">
            <label
              htmlFor="coin_id"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Select Coin
            </label>
            <select
              id="coin_id"
              name="coin_id"
              value={form.coin_id}
              onChange={handleCoinChange}
              disabled={isConverting}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              required
            >
              <option value="">Select Coin</option>
              {availableCoins.map((coin) => (
                <option key={coin.coin_id} value={coin.coin_id}>
                  {coin.coin_name}
                </option>
              ))}
            </select>
            {availableCoins.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                No coins available. Please add coins first.
              </p>
            )}
          </div>

          {/* Current Balances Display */}
          {currentBalances && (
            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-[#232a3b] dark:bg-[#1a2035]">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                Current Balances
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="block font-semibold text-emerald-500 dark:text-emerald-400">
                    {formatNumber(currentBalances.available_balance)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                    Available
                  </span>
                </div>
                <div className="text-center">
                  <span className="block font-semibold text-amber-500 dark:text-amber-400">
                    {formatNumber(currentBalances.on_order_balance)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                    On Order
                  </span>
                </div>
                <div className="text-center">
                  <span className="block font-semibold text-green-500 dark:text-green-400">
                    {formatNumber(currentBalances.staked_balance)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                    Staked
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Conversion Type */}
          <div className="mb-4">
            <label
              htmlFor="conversion_type"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Conversion Type
            </label>
            <select
              id="conversion_type"
              name="conversion_type"
              value={form.conversion_type}
              onChange={handleConversionTypeChange}
              disabled={isConverting || !currentBalances}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              required
            >
              <option value="">Select Conversion</option>
              <option value="to_on_order">Available → On Order</option>
              <option value="to_available">On Order → Available</option>
              <option value="too_available">Staked → Available</option>
            </select>
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
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.000001"
                min="0"
                max={maxAmount}
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                disabled={isConverting}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 pr-16 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                required
              />
              <button
                type="button"
                onClick={setMaxAmountValue}
                disabled={isConverting || !maxAmount || maxAmount <= 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 transition-colors hover:bg-green-500/20 disabled:opacity-40 dark:text-green-400"
              >
                MAX
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              Maximum: {formatNumber(maxAmount)}
            </p>
          </div>

          {/* Conversion Preview */}
          {form.amount > 0 && form.conversion_type && (
            <div className="mb-4 rounded-lg border border-green-500/15 bg-green-500/10 p-3 dark:border-green-500/20">
              <h4 className="mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
                Conversion Preview
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-[#8b93a7]">
                  <span>From:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {getFromBalanceType()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-[#8b93a7]">
                  <span>To:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {getToBalanceType()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-500/15 pt-2 font-medium text-zinc-900 dark:text-white">
                  <span>Amount:</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatNumber(form.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {message.text && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConverting}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isConverting ||
                !form.amount ||
                !form.conversion_type ||
                !form.coin_id
              }
              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60"
            >
              {isConverting ? (
                <>
                  <RefreshCw size={16} className="mr-2 inline animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRight size={16} className="mr-2 inline" />
                  Convert Balances
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
