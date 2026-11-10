"use client";

import { X, Coins } from "lucide-react";

export default function UserBalancesModal({
  show = false,
  user = null,
  onClose = () => {},
}) {
  function formatNumber(num, precision = 2) {
    if (num === null || num === undefined || Number.isNaN(num)) {
      return "0." + "0".repeat(precision);
    }
    if (num === 0) return (0).toFixed(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  }

  function handleClose() {
    onClose();
  }

  // Handle overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  // Handle Escape key
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
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
            <Coins size={20} className="text-green-600 dark:text-green-400" />
            User Balances - {user?.fullname || "User"}
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
          {/* Balance Summary */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-green-500/15 bg-green-500/10 p-3 text-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                Total Balance
              </span>
              <span className="block text-xl font-bold text-zinc-900 dark:text-white">
                ${formatNumber(user?.balances?.total_usd_value || 0)}
              </span>
            </div>
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 p-3 text-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Available
              </span>
              <span className="block text-xl font-bold text-zinc-900 dark:text-white">
                ${formatNumber(user?.balances?.total_available || 0)}
              </span>
            </div>
            <div className="rounded-lg border border-amber-500/15 bg-amber-500/10 p-3 text-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                On Order
              </span>
              <span className="block text-xl font-bold text-zinc-900 dark:text-white">
                ${formatNumber(user?.balances?.total_on_order || 0)}
              </span>
            </div>
            <div className="rounded-lg border border-green-500/15 bg-green-500/10 p-3 text-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                Staked
              </span>
              <span className="block text-xl font-bold text-zinc-900 dark:text-white">
                ${formatNumber(user?.balances?.total_staked || 0)}
              </span>
            </div>
          </div>

          {/* Coin Balances Table */}
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="border-b border-zinc-200 bg-white dark:border-[#232a3b] dark:bg-[#12161f]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      Coin
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      Available
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      On Order
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      Staked
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                      USD Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user?.balances?.coins?.length > 0 ? (
                    user.balances.coins.map((coin) => (
                      <tr
                        key={coin.coin_id}
                        className="border-b border-zinc-200 transition-colors hover:bg-white dark:border-[#232a3b] dark:hover:bg-[#12161f]"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {coin.photo ? (
                              <img
                                src={coin.photo}
                                alt={coin.coin_name}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 dark:border-[#232a3b] dark:bg-[#12161f]">
                                <Coins size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-white">
                                {coin.coin_name}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                                {coin.coin_code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                          {formatNumber(coin.available_balance, 6)}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                          {formatNumber(coin.on_order_balance, 6)}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-900 dark:text-white">
                          {formatNumber(coin.staked_balance, 6)}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-white">
                          {formatNumber(coin.total_balance, 6)}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          ${formatNumber(coin.usd_value)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-zinc-500 dark:text-[#8b93a7]"
                      >
                        No balances found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
  );
}
