"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, AlertCircle, Edit2, Trash2, Clock } from "lucide-react";

export default function HistoryModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [editForm, setEditForm] = useState({
    id: null,
    amount: "",
    email: "",
    username: "",
    type: "",
    status: "",
    userid: "",
    coin_id: "",
    deposit_info: "",
    withdraw_info: "",
  });

  const [deleteForm, setDeleteForm] = useState({
    id: null,
    type: "",
    amount: "",
    status: "",
  });

  // Fetch transactions when modal opens
  useEffect(() => {
    if (show && user) {
      fetchTransactions();
    }
  }, [show, user]);

  // Reset edit modal when closed
  useEffect(() => {
    if (!showEditModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage({ type: "", text: "" });
    }
  }, [showEditModal]);

  // Reset delete modal when closed
  useEffect(() => {
    if (!showDeleteModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage({ type: "", text: "" });
    }
  }, [showDeleteModal]);

  async function fetchTransactions() {
    setIsLoading(true);

    try {
      const response = await api.get(
        `/admin/get-user-transactions.php?id=${user?.id}`,
      );
      const res = response.data;

      if (res.success) {
        setTransactions(res.transactions || []);
      } else {
        toast.error(res.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Fetch transactions error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load transactions",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openEditModal(transaction) {
    setEditForm({
      id: transaction.id,
      amount: transaction.amount,
      email: transaction.email,
      username: transaction.fullname,
      type: transaction.type,
      status: transaction.status,
      userid: transaction.userid,
      coin_id: transaction.coin_id,
      deposit_info: transaction.deposit_info || "",
      withdraw_info: transaction.withdraw_info || "",
    });
    setShowEditModal(true);
    setMessage({ type: "", text: "" });
  }

  function openDeleteModal(transaction) {
    setDeleteForm({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
    });
    setShowDeleteModal(true);
    setMessage({ type: "", text: "" });
  }

  async function updateTransaction(e) {
    e.preventDefault();
    toast.dismiss();

    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post(
        "/admin/get-user-transactions-update.php",
        editForm,
      );
      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Transaction updated successfully!",
        });
        toast.success(res.message || "Transaction updated successfully!");

        setTimeout(() => {
          setShowEditModal(false);
          fetchTransactions();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update transaction",
        });
        toast.error(res.message || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Update transaction error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update transaction";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteTransaction() {
    toast.dismiss();

    setIsDeleting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post(
        "/admin/get-user-transactions-delete.php",
        {
          id: deleteForm.id,
        },
      );
      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Transaction deleted successfully!",
        });
        toast.success(res.message || "Transaction deleted successfully!");

        setTimeout(() => {
          setShowDeleteModal(false);
          fetchTransactions();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to delete transaction",
        });
        toast.error(res.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Delete transaction error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete transaction";
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

  function getTransactionTypeClass(type) {
    if (type?.includes("DEPOSIT") || type?.includes("CREDIT")) {
      return "type-deposit";
    } else if (
      type?.includes("PAYOUT") ||
      type?.includes("WITHDRAW") ||
      type?.includes("DEBIT")
    ) {
      return "type-withdraw";
    } else {
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

  // Handle Edit Form Change
  function handleEditChange(e) {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
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
          className="flex w-full max-w-4xl max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
            <h3
              id="modal-title"
              className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
            >
              <Clock
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              Transaction History - {user?.fullname || "User"}
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
                  Loading transactions...
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Coin
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Transaction ID
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                          >
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(transaction.trans_time)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getTransactionTypeClass(transaction.type) ===
                                  "type-deposit"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getTransactionTypeClass(
                                          transaction.type,
                                        ) === "type-withdraw"
                                      ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                      : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {transaction.coin_name || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(transaction.amount)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getStatusClass(transaction.status) ===
                                  "status-approved"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getStatusClass(transaction.status) ===
                                        "status-pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                      : getStatusClass(transaction.status) ===
                                          "status-rejected"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {transaction.trans_id || "N/A"}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditModal(transaction)}
                                  className="rounded p-1 text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(transaction)}
                                  className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                  title="Delete"
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
                            colSpan="7"
                            className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                          >
                            No transactions found
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
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3 className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white">
                Edit Transaction
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setMessage({ type: "", text: "" });
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={updateTransaction}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                  Transaction Type
                </label>
                <input
                  type="text"
                  value={editForm.type}
                  disabled
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                />
              </div>

              {editForm.deposit_info && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Deposit Info
                  </label>
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                    {editForm.deposit_info}
                  </div>
                </div>
              )}

              {editForm.withdraw_info && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-red-600 dark:text-red-400">
                    History Info
                  </label>
                  <div className="rounded-lg border border-red-500/15 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                    {editForm.withdraw_info}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.000001"
                  value={editForm.amount}
                  onChange={handleEditChange}
                  disabled={isUpdating}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
                >
                  Status
                </label>
                <select
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
                  <option value="Cancelled">Cancelled</option>
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
                    "Update Transaction"
                  )}
                </button>
              </div>
            </form>
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
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3 className="flex items-center gap-2.5 text-lg font-semibold text-red-600 dark:text-red-400">
                <Trash2 size={20} />
                Delete Transaction
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessage({ type: "", text: "" });
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
                aria-label="Close modal"
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
                  Are you sure you want to delete this transaction?
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Type:</strong> {deleteForm.type}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Amount:</strong> {formatNumber(deleteForm.amount)}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Status:</strong> {deleteForm.status}
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
                  onClick={deleteTransaction}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Transaction"
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
