"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, AlertCircle, Edit2, Trash2, TrendingUp } from "lucide-react";

export default function ManageTradeRecordsModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [editForm, setEditForm] = useState({
    id: null,
    volume: "",
    type: "",
    status: "",
    userid: "",
    trade_result: "",
    bgat: "",
    sdat: "",
    mdat: "",
    trade_signal: "",
    coin_name: "",
    coin_id: "",
    symbol: "",
  });

  const [deleteForm, setDeleteForm] = useState({
    id: null,
    coin_name: "",
    volume: "",
    type: "",
  });

  // Fetch trades when modal opens
  useEffect(() => {
    if (show && user) {
      fetchTrades();
    }
  }, [show, user]);

  // Reset edit modal when closed
  useEffect(() => {
    if (!showEditModal) {
      setMessage({ type: "", text: "" });
    }
  }, [showEditModal]);

  // Reset delete modal when closed
  useEffect(() => {
    if (!showDeleteModal) {
      setMessage({ type: "", text: "" });
    }
  }, [showDeleteModal]);

  async function fetchTrades() {
    setIsLoading(true);

    try {
      const response = await api.get(
        `/admin/get-user-trades.php?id=${user?.id}`,
      );
      const res = response.data;

      if (res.success) {
        setTrades(res.trades || []);
      } else {
        toast.error(res.message || "Failed to load trade records");
      }
    } catch (error) {
      console.error("Fetch trades error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load trade records",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openEditModal(trade) {
    setEditForm({
      id: trade.id,
      volume: trade.volume,
      type: trade.type,
      status: trade.status,
      userid: trade.userid,
      trade_result: trade.trade_result || "",
      bgat: trade.bgat || "",
      sdat: trade.sdat || "",
      mdat: trade.mdat || "",
      trade_signal: trade.trade_signal || "",
      coin_name: trade.coin_name || "",
      symbol: trade.symbol || "",
      coin_id: trade.coin_id || "",
    });
    setShowEditModal(true);
    setMessage({ type: "", text: "" });
  }

  function openDeleteModal(trade) {
    setDeleteForm({
      id: trade.id,
      coin_name: trade.coin_name,
      volume: trade.volume,
      type: trade.type,
    });
    setShowDeleteModal(true);
    setMessage({ type: "", text: "" });
  }

  function handleEditChange(e) {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  }

  async function updateTrade(e) {
    e.preventDefault();
    toast.dismiss();

    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/update-user-trade.php", {
        updatetrade: true,
        ...editForm,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Trade updated successfully!",
        });
        toast.success(res.message || "Trade updated successfully!");

        setTimeout(() => {
          setShowEditModal(false);
          fetchTrades();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update trade",
        });
        toast.error(res.message || "Failed to update trade");
      }
    } catch (error) {
      console.error("Update trade error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update trade record";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteTrade() {
    toast.dismiss();

    setIsDeleting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/delete-user-trade.php", {
        id: deleteForm.id,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Trade deleted successfully!",
        });
        toast.success(res.message || "Trade deleted successfully!");

        setTimeout(() => {
          setShowDeleteModal(false);
          fetchTrades();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to delete trade",
        });
        toast.error(res.message || "Failed to delete trade");
      }
    } catch (error) {
      console.error("Delete trade error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete trade record";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
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

  function formatNumber(num, precision = 6) {
    if (!num && num !== 0) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  }

  function getTradeTypeClass(type) {
    switch (type?.toUpperCase()) {
      case "LONG":
      case "BUY":
        return "type-long";
      case "SHORT":
      case "SELL":
        return "type-short";
      default:
        return "type-other";
    }
  }

  function getStatusClass(status) {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "rejected":
      case "cancelled":
      case "failed":
        return "status-rejected";
      default:
        return "status-other";
    }
  }

  function getResultClass(result) {
    switch (result?.toUpperCase()) {
      case "WON":
        return "result-won";
      case "LOST":
        return "result-lost";
      case "PENDING":
        return "result-pending";
      default:
        return "result-other";
    }
  }

  if (!show) return null;

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="flex w-full max-w-6xl max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
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
              Manage Trade Records - {user?.fullname || "User"}
            </h3>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
                <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                  Loading trade records...
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-sm">
                    <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Coin
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Volume
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Signal
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Result
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.length > 0 ? (
                        trades.map((trade) => (
                          <tr
                            key={trade.id}
                            className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                          >
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(trade.created_at)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {trade.coin_name || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(trade.volume)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getTradeTypeClass(trade.type) === "type-long"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getTradeTypeClass(trade.type) ===
                                        "type-short"
                                      ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                      : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                }`}
                              >
                                {trade.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {trade.trade_signal || "N/A"}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getStatusClass(trade.status) ===
                                  "status-approved"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getStatusClass(trade.status) ===
                                        "status-pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                      : getStatusClass(trade.status) ===
                                          "status-rejected"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {trade.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getResultClass(trade.trade_result) ===
                                  "result-won"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getResultClass(trade.trade_result) ===
                                        "result-lost"
                                      ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                      : getResultClass(trade.trade_result) ===
                                          "result-pending"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {trade.trade_result || "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditModal(trade)}
                                  className="rounded p-1 text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                                  aria-label="Edit trade"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(trade)}
                                  className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                  aria-label="Delete trade"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                          >
                            No trade records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-zinc-200 px-6 py-3 dark:border-[#232a3b]">
            <button
              onClick={handleClose}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
          onClick={() => {}}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3
                id="edit-modal-title"
                className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
              >
                Edit Trade Record
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setMessage({ type: "", text: "" });
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
                aria-label="Close edit modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={updateTrade}>
                <div className="mb-4">
                  <label
                    htmlFor="edit-type"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Trade Type
                  </label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    disabled={isUpdating}
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

                <div className="mb-4">
                  <label
                    htmlFor="edit-symbol"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Coin Symbol
                  </label>
                  <input
                    id="edit-symbol"
                    name="symbol"
                    type="text"
                    value={editForm.symbol}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-coin-id"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Coin ID
                  </label>
                  <input
                    id="edit-coin-id"
                    name="coin_id"
                    type="number"
                    value={editForm.coin_id}
                    disabled
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-volume"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Volume
                  </label>
                  <input
                    id="edit-volume"
                    name="volume"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={editForm.volume}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-signal"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Trade Signal
                  </label>
                  <input
                    id="edit-signal"
                    name="trade_signal"
                    type="text"
                    placeholder="Enter trade signal"
                    value={editForm.trade_signal}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-bgat"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    BGAT
                  </label>
                  <input
                    id="edit-bgat"
                    name="bgat"
                    type="text"
                    placeholder="BGAT value"
                    value={editForm.bgat}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-sdat"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    SDAT
                  </label>
                  <input
                    id="edit-sdat"
                    name="sdat"
                    type="text"
                    placeholder="SDAT value"
                    value={editForm.sdat}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-mdat"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    (P/L)
                  </label>
                  <input
                    id="edit-mdat"
                    name="mdat"
                    type="text"
                    placeholder="e.g Loss: -10, -250 | Profit: 10, 250"
                    value={editForm.mdat}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-status"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Status
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-result"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Trade Result
                  </label>
                  <select
                    id="edit-result"
                    name="trade_result"
                    value={editForm.trade_result}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  >
                    <option value="">Select Result</option>
                    <option value="WON">WON</option>
                    <option value="LOST">LOST</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setMessage({ type: "", text: "" });
                    }}
                    disabled={isUpdating}
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Updating...
                      </>
                    ) : (
                      "Update Trade"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
          onClick={() => {}}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3
                id="delete-modal-title"
                className="flex items-center gap-2.5 text-lg font-semibold text-red-600 dark:text-red-400"
              >
                <Trash2 size={20} />
                Delete Trade Record
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessage({ type: "", text: "" });
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
                aria-label="Close delete modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                <h4 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  Confirm Deletion
                </h4>
                <p className="mb-2 text-sm text-zinc-600 dark:text-[#8b93a7]">
                  Are you sure you want to delete this trade record?
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Coin:</strong> {deleteForm.coin_name}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Volume:</strong> {formatNumber(deleteForm.volume)}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Type:</strong> {deleteForm.type}
                </p>
                <p className="mt-3 text-sm font-medium text-red-500">
                  This action cannot be undone.
                </p>
              </div>

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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMessage({ type: "", text: "" });
                  }}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteTrade}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Trade"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
