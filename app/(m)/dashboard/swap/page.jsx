"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Repeat,
  ChevronDown,
  ArrowDownUp,
  RefreshCw,
  SlidersHorizontal,
  X,
  Check,
  Info,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Swap.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatNum(n, digits = 4) {
  if (!isFinite(n) || !n) return "0.00";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];
const SWAP_FEE_PCT = 0.3;

export default function SwapPage() {
  const router = useRouter();
  const user = useMe();
  const userData = user.data?.user;

  const [userCoins, setUserCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromAsset, setFromAsset] = useState(null);
  const [toAsset, setToAsset] = useState(null);
  const [fromAmount, setFromAmount] = useState("");
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [swapError, setSwapError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // User currency
  const userCurrencySymbol =
    typeof userData?.currency === "string" && userData.currency.trim()
      ? userData.currency.trim()
      : "$";

  // Fetch user coins
  const fetchUserCoins = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/user/allcoins.php");
      const res = response.data;

      if (res.success && Array.isArray(res.data)) {
        const coins = res.data.filter((coin) => coin && coin.coin_id);
        setUserCoins(coins);
        if (coins.length > 0) {
          setFromAsset(coins[0]);
          if (coins.length > 1) {
            setToAsset(coins[1]);
          }
        }
      } else {
        throw new Error(res.message || "Failed to load coins");
      }
    } catch (err) {
      console.error("Failed to fetch coins:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load coins",
      );
      toast.error("Failed to load coins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCoins();
  }, []);

  const numericFrom = parseFloat(fromAmount) || 0;
  const fromFiatValue = numericFrom;

  // Calculate rate and amounts
  const rate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return (toAsset.coin_rate || 0) / (fromAsset.coin_rate || 0);
  }, [fromAsset, toAsset]);

  const toAmount = useMemo(() => {
    if (!numericFrom || !fromAsset || !toAsset) return 0;
    // Simple calculation: amount * rate
    return numericFrom;
  }, [numericFrom, rate]);

  const priceImpact = useMemo(() => {
    if (!numericFrom) return 0;
    return Math.min(fromFiatValue);
  }, [fromFiatValue, numericFrom]);

  const minReceived = toAmount;
  const networkFee = fromAsset?.with_fee || 0;

  // Filter available target coins (exclude the selected source coin)
  const availableTargetCoins = useMemo(() => {
    return userCoins.filter((coin) => coin.coin_id !== fromAsset?.coin_id);
  }, [userCoins, fromAsset]);

  // If toAsset is the same as fromAsset, select the next available coin
  useEffect(() => {
    if (fromAsset && toAsset && fromAsset.coin_id === toAsset.coin_id) {
      const nextCoin = availableTargetCoins[0];
      if (nextCoin) {
        setToAsset(nextCoin);
      }
    }
  }, [fromAsset, toAsset, availableTargetCoins]);

  function toggleFromDropdown() {
    setFromDropdownOpen((o) => !o);
    setToDropdownOpen(false);
  }

  function toggleToDropdown() {
    setToDropdownOpen((o) => !o);
    setFromDropdownOpen(false);
  }

  function selectFromAsset(asset) {
    if (asset.coin_id === toAsset?.coin_id) {
      setToAsset(fromAsset);
    }
    setFromAsset(asset);
    setFromDropdownOpen(false);
    setSwapError("");
  }

  function selectToAsset(asset) {
    if (asset.coin_id === fromAsset?.coin_id) {
      setFromAsset(toAsset);
    }
    setToAsset(asset);
    setToDropdownOpen(false);
    setSwapError("");
  }

  function flipAssets() {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount("");
    setSwapError("");
  }

  function handleMax() {
    setFromAmount(String(fromAsset?.available_balance || 0));
    setSwapError("");
  }

  function selectSlippagePreset(val) {
    setSlippage(val);
    setCustomSlippage("");
  }

  function handleCustomSlippage(val) {
    setCustomSlippage(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSlippage(num);
    }
  }

  function validate() {
    if (!fromAsset || !toAsset) {
      setSwapError("Select both assets to swap.");
      return false;
    }
    if (!numericFrom || numericFrom <= 0) {
      setSwapError("Enter an amount to swap.");
      return false;
    }
    if (numericFrom > (fromAsset?.available_balance || 0)) {
      setSwapError(`Insufficient ${fromAsset?.coin_name || ""} balance.`);
      return false;
    }
    setSwapError("");
    return true;
  }

  function handleReview() {
    if (!validate()) return;
    setShowConfirm(true);
  }

  async function handleConfirmSwap() {
    setSubmitting(true);
    setSwapError("");
    setSubmitSuccess(false);

    try {
      const response = await api.post("/user/swap.php", {
        source_coin: fromAsset?.coin_id,
        target_coin: toAsset?.coin_id,
        swap_amount: numericFrom,
        slippage: slippage,
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        setSuccessData({
          fromAmount: numericFrom,
          fromSymbol: fromAsset?.coin_name || "",
          toAmount: res.data?.target_amount || toAmount,
          toSymbol: toAsset?.coin_name || "",
          transaction_id: res.transaction_id,
        });
        setShowConfirm(false);
        toast.success(res.message || "Swap completed successfully!");
        await fetchUserCoins();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(res.message || "Failed to process swap");
      }
    } catch (err) {
      console.error("Swap error:", err);
      setSwapError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process swap",
      );
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process swap",
      );
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFromAmount("");
    setSuccessData(null);
    setSwapError("");
    setSubmitSuccess(false);
  }

  // Loading state
  if (loading) {
    return <LoadingDiamond />;
  }

  // No coins state
  if (userCoins.length === 0) {
    return (
      <div className={styles["page-container"]}>
        <div className={styles["page-header"]}>
          <div className={styles["header-icon"]}>
            <Repeat size={22} />
          </div>
          <div>
            <h1 className={styles["page-title"]}>Swap</h1>
            <p className={styles["page-subtitle"]}>
              No coins available for swap.
            </p>
          </div>
        </div>
        <div className={styles["content-grid"]}>
          <div className={styles.panel}>
            <div className={styles["empty-state"]}>
              <p>You don&rsquo;t have any coins to swap.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["page-container"]}>
      {/* Page Header */}
      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <Repeat size={22} />
        </div>
        <div>
          <h1 className={styles["page-title"]}>Swap</h1>
          <p className={styles["page-subtitle"]}>
            Trade between assets instantly at the best available rate.
          </p>
        </div>
      </div>

      <div className={styles["content-grid"]}>
        {/* Main Swap Panel */}
        <div className={styles.panel}>
          <div className={styles["panel-header"]}>
            <div className={styles["title-with-icon"]}>
              <Repeat size={18} className="accent-icon" />
              <h2>Swap Tokens</h2>
            </div>
            {!successData && (
              <button
                type="button"
                className={cx(
                  styles["settings-btn"],
                  settingsOpen && styles.active,
                )}
                onClick={() => setSettingsOpen((o) => !o)}
                aria-label="Slippage settings"
                title="Settings"
              >
                <SlidersHorizontal size={16} />
              </button>
            )}
          </div>

          {successData ? (
            <div className={styles["success-state"]}>
              <div className={styles["success-icon"]}>
                <Check size={26} />
              </div>
              <p className={styles["success-title"]}>Swap completed</p>
              <p className={styles["success-desc"]}>
                {userCurrencySymbol}
                {formatNum(successData.fromAmount)} {successData.fromSymbol} was
                swapped for {userCurrencySymbol}
                {formatNum(successData.toAmount)} {successData.toSymbol}.
              </p>
              <div className={styles["success-actions"]}>
                <button className={styles["btn-secondary"]} onClick={resetForm}>
                  New Swap
                </button>
                <button
                  className={styles["btn-primary"]}
                  onClick={() => router.push("/dashboard/transactions")}
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <>
              {settingsOpen && (
                <div className={styles["slippage-panel"]}>
                  <span className={styles["slippage-row-label"]}>
                    Slippage Tolerance
                  </span>
                  <div className={styles["slippage-options"]}>
                    {SLIPPAGE_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={cx(
                          styles["slippage-btn"],
                          slippage === val &&
                            !customSlippage &&
                            styles.selected,
                        )}
                        onClick={() => selectSlippagePreset(val)}
                      >
                        {val}%
                      </button>
                    ))}
                    <input
                      type="number"
                      className={styles["slippage-custom-input"]}
                      placeholder="Custom"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippage(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Swap Card */}
              <div className={styles["swap-card"]}>
                {/* From */}
                <div className={styles["token-box"]}>
                  <div className={styles["token-box-top-row"]}>
                    <span className={styles["token-box-label"]}>You Pay</span>
                    <span className={styles["token-box-balance"]}>
                      Balance: {formatNum(fromAsset?.available_balance || 0)}
                      <button
                        type="button"
                        className={styles["btn-max-inline"]}
                        onClick={handleMax}
                      >
                        Max
                      </button>
                    </span>
                  </div>
                  <div className={styles["token-box-main-row"]}>
                    <input
                      type="number"
                      className={styles["token-amount-input"]}
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => {
                        setFromAmount(e.target.value);
                        if (swapError) setSwapError("");
                      }}
                    />
                    <div className={styles["asset-pill-wrap"]}>
                      <button
                        type="button"
                        className={cx(
                          styles["asset-pill-btn"],
                          fromDropdownOpen && styles.open,
                        )}
                        onClick={toggleFromDropdown}
                      >
                        <span
                          className={styles["asset-icon"]}
                          style={{ background: "#22c55e" }}
                        >
                          {fromAsset?.coin_name?.slice(0, 3) || "???"}
                        </span>
                        <span className={styles["asset-pill-symbol"]}>
                          {fromAsset?.coin_name || "Select"}
                        </span>
                        <ChevronDown size={14} />
                      </button>
                      {fromDropdownOpen && (
                        <div className={styles["asset-dropdown"]}>
                          {userCoins.map((coin) => (
                            <button
                              type="button"
                              key={coin.coin_id}
                              className={cx(
                                styles["asset-option"],
                                coin.coin_id === fromAsset?.coin_id &&
                                  styles.selected,
                              )}
                              onClick={() => selectFromAsset(coin)}
                            >
                              <span
                                className={styles["asset-icon"]}
                                style={{ background: "#22c55e" }}
                              >
                                {coin.coin_name?.slice(0, 3) || "???"}
                              </span>
                              <span className={styles["asset-option-meta"]}>
                                <span className={styles["asset-option-symbol"]}>
                                  {coin.coin_name}
                                </span>
                                <span className={styles["asset-option-name"]}>
                                  {coin.coin_title}
                                </span>
                              </span>
                              <span className={styles["asset-option-balance"]}>
                                {formatNum(coin.available_balance)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={styles["token-fiat-value"]}>
                    ≈ {userCurrencySymbol}
                    {formatNum(fromFiatValue, 2)}
                  </span>
                </div>

                {/* To */}
                <div className={styles["token-box"]}>
                  <div className={styles["token-box-top-row"]}>
                    <span className={styles["token-box-label"]}>
                      You Receive
                    </span>
                    <span className={styles["token-box-balance"]}>
                      Balance: {formatNum(toAsset?.available_balance || 0)}
                    </span>
                  </div>
                  <div className={styles["token-box-main-row"]}>
                    <input
                      type="text"
                      className={styles["token-amount-input"]}
                      placeholder="0.0"
                      value={numericFrom ? formatNum(toAmount, 6) : ""}
                      disabled
                      readOnly
                    />
                    <div className={styles["asset-pill-wrap"]}>
                      <button
                        type="button"
                        className={cx(
                          styles["asset-pill-btn"],
                          toDropdownOpen && styles.open,
                        )}
                        onClick={toggleToDropdown}
                      >
                        <span
                          className={styles["asset-icon"]}
                          style={{ background: "#22c55e" }}
                        >
                          {toAsset?.coin_name?.slice(0, 3) || "???"}
                        </span>
                        <span className={styles["asset-pill-symbol"]}>
                          {toAsset?.coin_name || "Select"}
                        </span>
                        <ChevronDown size={14} />
                      </button>
                      {toDropdownOpen && (
                        <div className={styles["asset-dropdown"]}>
                          {availableTargetCoins.length > 0 ? (
                            availableTargetCoins.map((coin) => (
                              <button
                                type="button"
                                key={coin.coin_id}
                                className={cx(
                                  styles["asset-option"],
                                  coin.coin_id === toAsset?.coin_id &&
                                    styles.selected,
                                )}
                                onClick={() => selectToAsset(coin)}
                              >
                                <span
                                  className={styles["asset-icon"]}
                                  style={{ background: "#22c55e" }}
                                >
                                  {coin.coin_name?.slice(0, 3) || "???"}
                                </span>
                                <span className={styles["asset-option-meta"]}>
                                  <span
                                    className={styles["asset-option-symbol"]}
                                  >
                                    {coin.coin_name}
                                  </span>
                                  <span className={styles["asset-option-name"]}>
                                    {coin.coin_title}
                                  </span>
                                </span>
                                <span
                                  className={styles["asset-option-balance"]}
                                >
                                  {formatNum(coin.available_balance)}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className={styles["no-options"]}>
                              No other coins available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={styles["token-fiat-value"]}>
                    ≈ {userCurrencySymbol}
                    {formatNum(toAmount, 2)}
                  </span>
                </div>

                {/* Flip Button */}
                <div className={styles["flip-btn-wrap"]}>
                  <button
                    type="button"
                    className={styles["flip-btn"]}
                    onClick={flipAssets}
                    aria-label="Flip assets"
                    disabled={!fromAsset || !toAsset}
                  >
                    <ArrowDownUp size={16} />
                  </button>
                </div>
              </div>

              {/* Rate */}
              {/* <div className={styles["rate-row"]}>
                <span>
                  1 {fromAsset?.coin_name || ""} ≈ {formatNum(rate, 6)}{" "}
                  {toAsset?.coin_name || ""}
                </span>
                <button
                  type="button"
                  className={styles["rate-refresh-btn"]}
                  onClick={() => toast.success("Rate refreshed")}
                  aria-label="Refresh rate"
                >
                  <RefreshCw size={13} />
                </button>
              </div> */}

              {swapError && (
                <div className={styles["error-text"]}>{swapError}</div>
              )}

              {/* Details */}
              {numericFrom > 0 && fromAsset && toAsset && (
                <div className={styles["details-box"]}>
                  <div className={styles["details-row"]}>
                    <span className={styles["details-key"]}>Price Impact</span>
                    <span
                      className={cx(
                        styles["details-value"],
                        priceImpact > 4
                          ? styles.danger
                          : priceImpact > 1.5
                            ? styles.warn
                            : "",
                      )}
                    >
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className={styles["details-row"]}>
                    <span className={styles["details-key"]}>
                      Minimum Received
                    </span>
                    <span className={styles["details-value"]}>
                      {userCurrencySymbol}
                      {formatNum(minReceived, 6)} {toAsset?.coin_name || ""}
                    </span>
                  </div>
                  <div className={styles["details-row"]}>
                    <span className={styles["details-key"]}>Network Fee</span>
                    <span className={styles["details-value"]}>
                      {formatNum(networkFee, 6)} {fromAsset?.coin_name || ""}
                    </span>
                  </div>
                  <div className={styles["details-row"]}>
                    <span className={styles["details-key"]}>Route</span>
                    <span className={styles["details-value"]}>
                      {fromAsset?.coin_name || ""} → {toAsset?.coin_name || ""}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles["btn-swap"]}
                onClick={handleReview}
                disabled={!numericFrom || !fromAsset || !toAsset}
                style={{ marginTop: numericFrom > 0 ? 0 : "1rem" }}
              >
                {!fromAsset || !toAsset
                  ? "Select assets"
                  : !numericFrom
                    ? "Enter an amount"
                    : `Swap ${fromAsset?.coin_name || ""} for ${toAsset?.coin_name || ""}`}
              </button>
            </>
          )}
        </div>

        {/* Side Column */}
        <div className={styles["side-col"]}>
          {/* Info Panel */}
          <div className={cx(styles.panel, styles["alert-panel"])}>
            <div className={styles["alert-content"]}>
              <Info size={18} className="alert-icon" />
              <div className={styles["alert-text"]}>
                <h4>About slippage tolerance</h4>
                <p>
                  If the price moves unfavorably by more than your slippage
                  tolerance, your swap will revert to protect you from a bad
                  trade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setShowConfirm(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles["modal-header"]}>
              <div>
                <h3>Confirm Swap</h3>
                <p>Review the trade details before confirming.</p>
              </div>
              <button
                className={styles["modal-close"]}
                onClick={() => setShowConfirm(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles["modal-swap-preview"]}>
              <div className={styles["modal-swap-side"]}>
                <span
                  className={styles["asset-icon"]}
                  style={{ background: "#22c55e" }}
                >
                  {fromAsset?.coin_name?.slice(0, 3) || "???"}
                </span>
                <span className={styles["modal-swap-amount"]}>
                  {userCurrencySymbol}
                  {formatNum(numericFrom)}
                </span>
                <span className={styles["swap-row-sub"]}>
                  {fromAsset?.coin_name || ""}
                </span>
              </div>
              <ArrowRight size={18} className={styles["modal-swap-arrow"]} />
              <div className={styles["modal-swap-side"]}>
                <span
                  className={styles["asset-icon"]}
                  style={{ background: "#22c55e" }}
                >
                  {toAsset?.coin_name?.slice(0, 3) || "???"}
                </span>
                <span className={styles["modal-swap-amount"]}>
                  {userCurrencySymbol}
                  {formatNum(toAmount, 6)}
                </span>
                <span className={styles["swap-row-sub"]}>
                  {toAsset?.coin_name || ""}
                </span>
              </div>
            </div>

            <div className={styles["details-box"]}>
              <div className={styles["details-row"]}>
                <span className={styles["details-key"]}>
                  Slippage Tolerance
                </span>
                <span className={styles["details-value"]}>{slippage}%</span>
              </div>
              <div className={styles["details-row"]}>
                <span className={styles["details-key"]}>Minimum Received</span>
                <span className={styles["details-value"]}>
                  {userCurrencySymbol}
                  {formatNum(minReceived, 6)} {toAsset?.coin_name || ""}
                </span>
              </div>
              <div className={styles["details-row"]}>
                <span className={styles["details-key"]}>Network Fee</span>
                <span className={styles["details-value"]}>
                  {formatNum(networkFee, 6)} {fromAsset?.coin_name || ""}
                </span>
              </div>
            </div>

            <div className={styles["modal-actions"]}>
              <button
                type="button"
                className={styles["btn-secondary"]}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles["btn-primary"]}
                onClick={handleConfirmSwap}
                disabled={submitting}
              >
                {submitting ? "Swapping..." : "Confirm Swap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
