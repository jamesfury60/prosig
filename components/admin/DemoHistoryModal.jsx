"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, AlertCircle, Edit2, Trash2, TrendingUp } from "lucide-react";

export default function DemoHistoryModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [demoHistories, setDemoHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [editForm, setEditForm] = useState({
    id: null,
    asset: "",
    type: "",
    amount: "",
    mdat: "",
    actions: "",
    leverage: "",
    entry: "",
    current: "",
    pnl: "",
    status: "",
    trade_date: "",
  });

  const [deleteForm, setDeleteForm] = useState({
    id: null,
    asset: "",
    type: "",
    amount: "",
  });

  // Fetch demo histories when modal opens
  useEffect(() => {
    if (show && user) {
      fetchDemoHistories();
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

  async function fetchDemoHistories() {
    setIsLoading(true);

    try {
      const response = await api.get(
        `/admin/get-user-demo-history.php?id=${user?.id}`,
      );
      const res = response.data;

      if (res.success) {
        setDemoHistories(res.data || []);
      } else {
        toast.error(res.message || "Failed to load demo history");
      }
    } catch (error) {
      console.error("Fetch demo history error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load demo history",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openEditModal(history) {
    setEditForm({
      id: history.id,
      asset: history.asset || "",
      type: history.type || "",
      amount: history.amount?.toString() || "",
      mdat: history.mdat || "",
      actions: history.actions || "",
      leverage: history.leverage || "",
      entry: history.entry?.toString() || "",
      current: history.current?.toString() || "",
      pnl: history.pnl?.toString() || "",
      status: history.status || "",
      trade_date: history.trade_date || "",
    });
    setShowEditModal(true);
    setMessage({ type: "", text: "" });
  }

  function openDeleteModal(history) {
    setDeleteForm({
      id: history.id,
      asset: history.asset,
      type: history.type,
      amount: history.amount,
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

  async function updateDemoHistory(e) {
    e.preventDefault();
    toast.dismiss();

    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/update-user-demo-history.php", {
        updatedemo: true,
        ...editForm,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Demo history updated successfully!",
        });
        toast.success(res.message || "Demo history updated successfully!");

        setTimeout(() => {
          setShowEditModal(false);
          fetchDemoHistories();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update demo history",
        });
        toast.error(res.message || "Failed to update demo history");
      }
    } catch (error) {
      console.error("Update demo history error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update demo history";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteDemoHistory() {
    toast.dismiss();

    setIsDeleting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/delete-user-demo-history.php", {
        id: deleteForm.id,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Demo history deleted successfully!",
        });
        toast.success(res.message || "Demo history deleted successfully!");

        setTimeout(() => {
          setShowDeleteModal(false);
          fetchDemoHistories();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to delete demo history",
        });
        toast.error(res.message || "Failed to delete demo history");
      }
    } catch (error) {
      console.error("Delete demo history error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete demo history";
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

  // FIXED: Robust number formatting function
  function formatNumber(num, precision = 2) {
    // Handle null, undefined, or empty string
    if (num === null || num === undefined || num === "") {
      return "0." + "0".repeat(precision);
    }

    // Convert to number if it's a string
    let number = typeof num === "string" ? parseFloat(num) : num;

    // Check if conversion resulted in NaN
    if (isNaN(number)) {
      return "0." + "0".repeat(precision);
    }

    // Handle zero
    if (number === 0) {
      return "0." + "0".repeat(precision);
    }

    // Format based on value
    const absNum = Math.abs(number);
    const sign = number < 0 ? "-" : "";

    if (absNum < 0.000001) {
      return sign + absNum.toExponential(4);
    }
    if (absNum < 0.001) {
      return sign + absNum.toFixed(6);
    }
    if (absNum < 1) {
      return sign + absNum.toFixed(precision);
    }
    return (
      sign +
      absNum.toLocaleString("en-US", {
        maximumFractionDigits: precision,
      })
    );
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  function getTypeClass(type) {
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
      case "won":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "rejected":
      case "cancelled":
      case "failed":
      case "lost":
        return "status-rejected";
      default:
        return "status-other";
    }
  }

  function getPnlClass(pnl) {
    if (pnl === null || pnl === undefined || pnl === "") {
      return "text-zinc-500";
    }
    const num = typeof pnl === "string" ? parseFloat(pnl) : pnl;
    if (isNaN(num)) return "text-zinc-500";
    if (num > 0) return "text-emerald-600 dark:text-emerald-400";
    if (num < 0) return "text-red-600 dark:text-red-400";
    return "text-zinc-500";
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
              Demo History - {user?.fullname || "User"}
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
                  Loading demo history...
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse text-sm">
                    <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Asset
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Leverage
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Entry
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Current
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          P&L
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoHistories.length > 0 ? (
                        demoHistories.map((history) => (
                          <tr
                            key={history.id}
                            className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                          >
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(history.trade_date)}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-white">
                              {history.asset || "N/A"}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getTypeClass(history.type) === "type-long"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getTypeClass(history.type) ===
                                        "type-short"
                                      ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                      : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                }`}
                              >
                                {history.type || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(history.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {history.leverage || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(history.entry)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(history.current)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`font-semibold ${getPnlClass(history.pnl)}`}
                              >
                                {formatNumber(history.pnl)}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getStatusClass(history.status) ===
                                  "status-approved"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getStatusClass(history.status) ===
                                        "status-pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                      : getStatusClass(history.status) ===
                                          "status-rejected"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {history.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditModal(history)}
                                  className="rounded p-1 text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                                  aria-label="Edit demo history"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(history)}
                                  className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                  aria-label="Delete demo history"
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
                            colSpan="10"
                            className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                          >
                            No demo history found
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
                Edit Demo History
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
              <form onSubmit={updateDemoHistory}>
                <div className="mb-4">
                  <label
                    htmlFor="edit-asset"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Asset
                  </label>
                  <input
                    id="edit-asset"
                    name="asset"
                    type="text"
                    value={editForm.asset}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-type"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Type
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
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-amount"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Amount
                  </label>
                  <input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-leverage"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Leverage
                  </label>
                  <input
                    id="edit-leverage"
                    name="leverage"
                    type="text"
                    value={editForm.leverage}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-entry"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Entry Price
                  </label>
                  <input
                    id="edit-entry"
                    name="entry"
                    type="number"
                    step="0.000001"
                    value={editForm.entry}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-current"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Current Price
                  </label>
                  <input
                    id="edit-current"
                    name="current"
                    type="number"
                    step="0.000001"
                    value={editForm.current}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-pnl"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    P&L
                  </label>
                  <input
                    id="edit-pnl"
                    name="pnl"
                    type="number"
                    step="0.000001"
                    value={editForm.pnl}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
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
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-mdat"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    MDAT (Additional Profit addition to demo balance)
                  </label>
                  <input
                    id="edit-mdat"
                    name="mdat"
                    type="text"
                    placeholder="Additional metadata"
                    value={editForm.mdat}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-actions"
                    className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                  >
                    Actions
                  </label>
                  <input
                    id="edit-actions"
                    name="actions"
                    type="text"
                    placeholder="Action notes"
                    value={editForm.actions}
                    onChange={handleEditChange}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  />
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
                      "Update Demo History"
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
                Delete Demo History
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
                  Are you sure you want to delete this demo history record?
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Asset:</strong> {deleteForm.asset}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Type:</strong> {deleteForm.type}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Amount:</strong> {formatNumber(deleteForm.amount)}
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
                  onClick={deleteDemoHistory}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Demo History"
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
