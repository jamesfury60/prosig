"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, AlertCircle, TrendingUp, Trash2, Layers } from "lucide-react";

export default function StakeInvestmentHistoryModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [activeTab, setActiveTab] = useState("stakes");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteStakeModal, setShowDeleteStakeModal] = useState(false);
  const [showDeleteInvestmentModal, setShowDeleteInvestmentModal] =
    useState(false);

  const [stakeHistory, setStakeHistory] = useState([]);
  const [investmentHistory, setInvestmentHistory] = useState([]);

  const [deleteStakeForm, setDeleteStakeForm] = useState({
    id: null,
    title: "",
    amount: "",
    status: "",
  });

  const [deleteInvestmentForm, setDeleteInvestmentForm] = useState({
    id: null,
    amount: "",
    total_profit: "",
    status: "",
  });

  const tabs = [
    { id: "stakes", name: "Stake History", icon: Layers },
    { id: "investments", name: "Investment History", icon: TrendingUp },
  ];

  // Fetch history when modal opens
  useEffect(() => {
    if (show && user) {
      fetchHistory();
    }
  }, [show, user]);

  async function fetchHistory() {
    setIsLoading(true);
    try {
      await Promise.all([fetchStakeHistory(), fetchInvestmentHistory()]);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStakeHistory() {
    try {
      const response = await api.get(
        `/admin/get-user-stakes.php?id=${user?.id}`,
      );
      const res = response.data;

      if (res.success) {
        setStakeHistory(res.stakes || []);
      } else {
        setStakeHistory([]);
        toast.error(res.message || "Failed to load stake history");
      }
    } catch (error) {
      console.error("Failed to fetch stake history:", error);
      setStakeHistory([]);
    }
  }

  async function fetchInvestmentHistory() {
    try {
      const response = await api.get(
        `/admin/get-user-investments.php?id=${user?.id}`,
      );
      const res = response.data;

      if (res.success) {
        setInvestmentHistory(res.investments || []);
      } else {
        setInvestmentHistory([]);
        toast.error(res.message || "Failed to load investment history");
      }
    } catch (error) {
      console.error("Failed to fetch investment history:", error);
      setInvestmentHistory([]);
    }
  }

  function openDeleteStakeModal(stake) {
    setDeleteStakeForm({
      id: stake.id,
      title: stake.title,
      amount: stake.amount,
      status: stake.status,
    });
    setShowDeleteStakeModal(true);
  }

  function openDeleteInvestmentModal(investment) {
    setDeleteInvestmentForm({
      id: investment.id,
      amount: investment.amount,
      total_profit: investment.total_profit,
      status: investment.status,
    });
    setShowDeleteInvestmentModal(true);
  }

  async function deleteStake() {
    setIsDeleting(true);

    try {
      const response = await api.post("/admin/delete-stake.php", {
        id: deleteStakeForm.id,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Stake deleted successfully!");
        await fetchStakeHistory();
        setShowDeleteStakeModal(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to delete stake");
      }
    } catch (error) {
      console.error("Failed to delete stake:", error);
      toast.error(error.response?.data?.message || "Failed to delete stake");
    } finally {
      setIsDeleting(false);
    }
  }

  async function deleteInvestment() {
    setIsDeleting(true);

    try {
      const response = await api.post("/admin/delete-investment.php", {
        id: deleteInvestmentForm.id,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Investment deleted successfully!");
        await fetchInvestmentHistory();
        setShowDeleteInvestmentModal(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to delete investment");
      }
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete investment",
      );
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

  function getHistoryCount(tabId) {
    switch (tabId) {
      case "stakes":
        return stakeHistory.length;
      case "investments":
        return investmentHistory.length;
      default:
        return 0;
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
    return new Date(dateString).toLocaleDateString();
  }

  function getStakeStatusClass(status) {
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
        return "status-active";
      case "pending":
        return "status-pending";
      case "cancelled":
      case "failed":
        return "status-inactive";
      default:
        return "status-other";
    }
  }

  function getInvestmentStatusClass(status) {
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
        return "status-active";
      case "pending":
        return "status-pending";
      case "cancelled":
      case "failed":
        return "status-inactive";
      default:
        return "status-other";
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
              <Layers
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              Investment History - {user?.fullname || "User"}
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
            {/* Tabs */}
            <div className="mb-6 border-b border-zinc-200 dark:border-[#232a3b]">
              <nav className="flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const count = getHistoryCount(tab.id);

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tab-panel-${tab.id}`}
                      id={`tab-${tab.id}`}
                      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
                          : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.name}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-[#1a2035] dark:text-[#8b93a7]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
                <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                  Loading history...
                </p>
              </div>
            ) : activeTab === "stakes" ? (
              /* Stake History */
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Plan
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          APY
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Lock Period
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Start Date
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
                      {stakeHistory.length > 0 ? (
                        stakeHistory.map((stake) => (
                          <tr
                            key={stake.id}
                            className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                          >
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {stake.title || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(stake.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {stake.apy ? stake.apy + "%" : "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {stake.lock_period || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(stake.start_date)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getStakeStatusClass(stake.status) ===
                                  "status-active"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getStakeStatusClass(stake.status) ===
                                        "status-pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                      : getStakeStatusClass(stake.status) ===
                                          "status-inactive"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {stake.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => openDeleteStakeModal(stake)}
                                className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                aria-label="Delete stake"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                          >
                            No stake history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Investment History */
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Plan
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Daily Interest
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Total Profit
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          Start Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                          End Date
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
                      {investmentHistory.length > 0 ? (
                        investmentHistory.map((investment) => (
                          <tr
                            key={investment.id}
                            className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                          >
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {investment.plan_id || "N/A"}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(investment.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(investment.daily_interest)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatNumber(investment.total_profit)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(investment.start_date)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                              {formatDate(investment.end_date)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  getInvestmentStatusClass(
                                    investment.status,
                                  ) === "status-active"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : getInvestmentStatusClass(
                                          investment.status,
                                        ) === "status-pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                      : getInvestmentStatusClass(
                                            investment.status,
                                          ) === "status-inactive"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                                }`}
                              >
                                {investment.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() =>
                                  openDeleteInvestmentModal(investment)
                                }
                                className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                aria-label="Delete investment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                          >
                            No investment history found
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

      {/* Delete Stake Modal */}
      {showDeleteStakeModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
          onClick={() => {}}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-stake-title"
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3
                id="delete-stake-title"
                className="flex items-center gap-2.5 text-lg font-semibold text-red-600 dark:text-red-400"
              >
                <Trash2 size={20} />
                Delete Stake Record
              </h3>
              <button
                onClick={() => setShowDeleteStakeModal(false)}
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
                  Are you sure you want to delete this stake record?
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Plan:</strong> {deleteStakeForm.title}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Amount:</strong>{" "}
                  {formatNumber(deleteStakeForm.amount)}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Status:</strong> {deleteStakeForm.status}
                </p>
                <p className="mt-3 text-sm font-medium text-red-500">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteStakeModal(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteStake}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Stake"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Investment Modal */}
      {showDeleteInvestmentModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
          onClick={() => {}}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-investment-title"
        >
          <div
            className="flex w-full max-w-md max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
              <h3
                id="delete-investment-title"
                className="flex items-center gap-2.5 text-lg font-semibold text-red-600 dark:text-red-400"
              >
                <Trash2 size={20} />
                Delete Investment Record
              </h3>
              <button
                onClick={() => setShowDeleteInvestmentModal(false)}
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
                  Are you sure you want to delete this investment record?
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Amount:</strong>{" "}
                  {formatNumber(deleteInvestmentForm.amount)}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Total Profit:</strong>{" "}
                  {formatNumber(deleteInvestmentForm.total_profit)}
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <strong>Status:</strong> {deleteInvestmentForm.status}
                </p>
                <p className="mt-3 text-sm font-medium text-red-500">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteInvestmentModal(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteInvestment}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Investment"
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
