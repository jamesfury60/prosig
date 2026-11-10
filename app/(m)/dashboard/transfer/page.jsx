"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowUpFromLine,
  ChevronDown,
  Clipboard,
  QrCode,
  Wallet,
  AlertTriangle,
  Check,
  X,
  Copy,
  ExternalLink,
  Zap,
  Clock3,
  Users,
} from "lucide-react";

import styles from "./Transfer.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function truncateAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatNum(n, digits = 4) {
  if (!n && n !== 0) return "0.00";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

export default function TransferPage() {
  const user = useMe();
  const userData = user.data?.user;

  const [userCoins, setUserCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [speed, setSpeed] = useState("standard");

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successTx, setSuccessTx] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dropdownRef = useRef(null);

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
      // await new Promise((resolve) => setTimeout(resolve, 8000));
      const response = await api.get("/user/allcoins.php");
      const res = response.data;

      if (res.success && Array.isArray(res.data)) {
        const coins = res.data.filter((coin) => coin && coin.coin_id);
        setUserCoins(coins);
        if (coins.length > 0) {
          setSelectedCoin(coins[0]);
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

  // Speed options
  const SPEED_OPTIONS = [
    { id: "standard", label: "Standard", eta: "~30 sec", mult: 1 },
    { id: "fast", label: "Fast", eta: "~5 sec", mult: 2.2 },
  ];

  const numericAmount = parseFloat(amount) || 0;
  const speedOption = SPEED_OPTIONS.find((s) => s.id === speed);
  const fee = (selectedCoin?.with_fee || 0) * speedOption?.mult || 0;
  const total = numericAmount + fee;

  const resolvedContact = useMemo(
    () =>
      recipient.trim().length > 0
        ? { address: recipient, name: truncateAddress(recipient) }
        : null,
    [recipient],
  );

  function selectCoin(coin) {
    setSelectedCoin(coin);
    setCoinDropdownOpen(false);
    setAmount("");
    setErrors((prev) => ({ ...prev, amount: "" }));
  }

  function handleMax() {
    const maxAmount = Math.max(0, (selectedCoin?.available_balance || 0) - fee);
    setAmount(String(Number(maxAmount.toFixed(6))));
    setErrors((prev) => ({ ...prev, amount: "" }));
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text.trim());
      setErrors((prev) => ({ ...prev, recipient: "" }));
    } catch {
      toast.error("Couldn't read clipboard. Paste it manually.");
    }
  }

  function validate() {
    const newErrors = {};
    if (!recipient) {
      newErrors.recipient = "Enter a recipient wallet address.";
    }
    if (!numericAmount || numericAmount <= 0) {
      newErrors.amount = "Enter an amount to send.";
    } else if (total > (selectedCoin?.available_balance || 0)) {
      newErrors.amount = `Amount plus fee exceeds your ${selectedCoin?.coin_name || ""} balance.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleReview(e) {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  }

  async function handleConfirmSend() {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await api.post("/user/transfercoin.php", {
        coin_id: selectedCoin?.coin_id,
        amount: numericAmount,
        wallet_address: recipient.trim(),
        memo: memo,
        speed: speed,
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        setSuccessTx({
          hash: res.transaction_id || "0x...",
          amount: numericAmount,
          asset: selectedCoin?.coin_name || "",
        });
        setShowConfirm(false);
        toast.success(res.message || "Transfer completed successfully!");

        // Refresh coin balances
        await fetchUserCoins();
      } else {
        throw new Error(res.message || "Failed to process transfer");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process transfer",
      );
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process transfer",
      );
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setRecipient("");
    setAmount("");
    setMemo("");
    setSpeed("standard");
    setErrors({});
    setSuccessTx(null);
    setSubmitSuccess(false);
  }

  function copyHash() {
    if (!successTx) return;
    navigator.clipboard?.writeText(successTx.hash);
    toast.success("Transaction hash copied");
  }

  // Loading state
  if (loading) {
    return <LoadingDiamond />;
  }

  return (
    <div className={styles["page-container"]}>
      {/* Page Header */}
      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <ArrowUpFromLine size={22} />
        </div>
        <div>
          <h1 className={styles["page-title"]}>Transfer</h1>
          <p className={styles["page-subtitle"]}>
            Send crypto to any wallet address, instantly and securely.
          </p>
        </div>
      </div>

      <div className={styles["content-grid"]}>
        {/* Main: Transfer Form */}
        <div className={styles.panel}>
          <div className={styles["panel-header"]}>
            <div className={styles["title-with-icon"]}>
              <ArrowUpFromLine size={18} className="accent-icon" />
              <h2>Send Funds</h2>
            </div>
          </div>

          {successTx ? (
            <div className={styles["success-state"]}>
              <div className={styles["success-icon"]}>
                <Check size={26} />
              </div>
              <p className={styles["success-title"]}>Transfer completed</p>
              <p className={styles["success-desc"]}>
                {userCurrencySymbol}
                {formatNum(successTx.amount)} {successTx.asset} is on its way to
                the recipient.
              </p>
              <div className={styles["tx-hash-box"]}>
                <span>{successTx.hash}</span>
                <button
                  type="button"
                  onClick={copyHash}
                  aria-label="Copy transaction hash"
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <Copy size={13} />
                </button>
              </div>
              <div className={styles["success-actions"]}>
                <button className={styles["btn-secondary"]} onClick={resetForm}>
                  Send Another
                </button>
                <button
                  className={styles["btn-primary"]}
                  style={{ flex: 1 }}
                  onClick={() => toast("Opening block explorer...")}
                >
                  View on Explorer
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReview} className={styles.form}>
              {/* Asset Selector */}
              <div className={styles.field}>
                <label className={styles["field-label"]}>Asset</label>
                <div className={styles["asset-select"]} ref={dropdownRef}>
                  <button
                    type="button"
                    className={cx(
                      styles["asset-select-btn"],
                      coinDropdownOpen && styles.open,
                    )}
                    onClick={() => setCoinDropdownOpen((o) => !o)}
                  >
                    <span
                      className={styles["asset-icon"]}
                      style={{ background: selectedCoin?.color || "#22c55e" }}
                    >
                      {selectedCoin?.coin_name?.slice(0, 3) || "???"}
                    </span>
                    <span className={styles["asset-select-meta"]}>
                      <span className={styles["asset-select-symbol"]}>
                        {selectedCoin?.coin_name || "Select"} ·{" "}
                        {selectedCoin?.coin_title || ""}
                      </span>
                      <span className={styles["asset-select-balance"]}>
                        {formatNum(selectedCoin?.available_balance || 0)}{" "}
                        available
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={cx(
                        styles["asset-chevron"],
                        coinDropdownOpen && styles.open,
                      )}
                    />
                  </button>

                  {coinDropdownOpen && (
                    <div className={styles["asset-dropdown"]}>
                      {userCoins.map((coin) => (
                        <button
                          type="button"
                          key={coin.coin_id}
                          className={cx(
                            styles["asset-option"],
                            coin.coin_id === selectedCoin?.coin_id &&
                              styles.selected,
                          )}
                          onClick={() => selectCoin(coin)}
                        >
                          <span
                            className={styles["asset-icon"]}
                            style={{ background: coin.color || "#22c55e" }}
                          >
                            {coin.coin_name?.slice(0, 3) || "???"}
                          </span>
                          <span>
                            <span className={styles["asset-select-symbol"]}>
                              {coin.coin_name}
                            </span>
                            <span className={styles["asset-option-name"]}>
                              {" "}
                              · {coin.coin_title}
                            </span>
                          </span>
                          <span className={styles["asset-option-right"]}>
                            <span className={styles["asset-option-balance"]}>
                              {formatNum(coin.available_balance)}
                            </span>
                            <span className={styles["asset-option-fiat"]}>
                              {userCurrencySymbol}
                              {formatNum(coin.available_balance, 2)}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Address */}
              <div className={styles.field}>
                <label className={styles["field-label"]}>
                  Recipient Wallet Address
                </label>
                <div className={styles["address-input-wrapper"]}>
                  <input
                    className={styles["field-input"]}
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      if (errors.recipient)
                        setErrors((prev) => ({ ...prev, recipient: "" }));
                    }}
                  />
                  <div className={styles["address-actions"]}>
                    <button
                      type="button"
                      className={styles["address-action-btn"]}
                      onClick={handlePaste}
                      aria-label="Paste address"
                      title="Paste"
                    >
                      <Clipboard size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles["address-action-btn"]}
                      onClick={() => toast("Opening QR scanner...")}
                      aria-label="Scan QR code"
                      title="Scan QR"
                    >
                      <QrCode size={15} />
                    </button>
                  </div>
                </div>
                {errors.recipient ? (
                  <span className={styles["error-text"]}>
                    {errors.recipient}
                  </span>
                ) : (
                  <span className={styles["field-hint"]}>
                    Double-check the address — transfers can&apos;t be reversed.
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className={styles.field}>
                <label className={styles["field-label"]}>Amount</label>
                <div className={styles["amount-input-wrapper"]}>
                  <input
                    type="number"
                    className={styles["field-input"]}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount)
                        setErrors((prev) => ({ ...prev, amount: "" }));
                    }}
                  />
                  <div className={styles["amount-actions"]}>
                    <button
                      type="button"
                      className={styles["btn-max"]}
                      onClick={handleMax}
                    >
                      Max
                    </button>
                    <span className={styles["amount-unit"]}>
                      {selectedCoin?.coin_name || ""}
                    </span>
                  </div>
                </div>
                <div className={styles["amount-fiat-row"]}>
                  <span>
                    {errors.amount ? (
                      <span className={styles["error-text"]}>
                        {errors.amount}
                      </span>
                    ) : (
                      `≈ ${userCurrencySymbol}${formatNum(numericAmount, 2)}`
                    )}
                  </span>
                  <span>
                    Balance: {formatNum(selectedCoin?.available_balance || 0)}{" "}
                    {selectedCoin?.coin_name || ""}
                  </span>
                </div>
              </div>

              {/* Network Speed */}
              <div className={styles.field}>
                <label className={styles["field-label"]}>Network Fee</label>
                <div className={styles["speed-grid"]}>
                  {SPEED_OPTIONS.map((opt) => {
                    const optFee = (selectedCoin?.with_fee || 0) * opt.mult;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        className={cx(
                          styles["speed-card"],
                          speed === opt.id && styles.selected,
                        )}
                        onClick={() => setSpeed(opt.id)}
                      >
                        <span className={styles["speed-card-title"]}>
                          {opt.id === "fast" ? (
                            <Zap size={13} style={{ marginRight: 4 }} />
                          ) : (
                            <Clock3 size={13} style={{ marginRight: 4 }} />
                          )}
                          {opt.label}
                        </span>
                        <span className={styles["speed-card-sub"]}>
                          {opt.eta} · {formatNum(optFee, 6)}{" "}
                          {selectedCoin?.coin_name || ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memo */}
              <div className={styles.field}>
                <label className={styles["field-label"]}>
                  Memo{" "}
                  <span style={{ textTransform: "none", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  className={styles["field-textarea"]}
                  placeholder="What's this transfer for?"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              {submitError && (
                <div className={styles["error-message"]}>
                  <AlertTriangle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <button type="submit" className={styles["btn-primary"]}>
                Review Transfer
              </button>
            </form>
          )}
        </div>

        {/* Side Column */}
        <div className={styles["side-col"]}>
          {/* Recent Recipients - Static for now */}
          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <div className={styles["title-with-icon"]}>
                <Users size={18} className="accent-icon" />
                <h2>Recent Recipients</h2>
              </div>
            </div>
            <div className={styles["recipient-list"]}>
              <div className={styles["recipient-row"]} style={{ opacity: 0.5 }}>
                <span className={styles["recipient-avatar"]}>?</span>
                <span className={styles["recipient-meta"]}>
                  <span className={styles["recipient-name"]}>
                    No recent recipients
                  </span>
                  <span className={styles["recipient-address"]}>
                    Your contacts will appear here
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className={cx(styles.panel, styles["alert-panel"])}>
            <div className={styles["alert-content"]}>
              <AlertTriangle size={18} className="alert-icon" />
              <div className={styles["alert-text"]}>
                <h4>Double-check before sending</h4>
                <p>
                  Crypto transfers are irreversible. Verify the recipient
                  address and network before confirming.
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
                <h3>Confirm Transfer</h3>
                <p>Please review the details before sending.</p>
              </div>
              <button
                className={styles["modal-close"]}
                onClick={() => setShowConfirm(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles["summary-box"]}>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>To</span>
                <span className={styles["summary-value"]}>
                  {resolvedContact
                    ? resolvedContact.name
                    : truncateAddress(recipient)}
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>Asset</span>
                <span className={styles["summary-value"]}>
                  {selectedCoin?.coin_name || ""}
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>Amount</span>
                <span className={styles["summary-value"]}>
                  {userCurrencySymbol}
                  {formatNum(numericAmount)} {selectedCoin?.coin_name || ""}
                </span>
              </div>
              <div className={styles["summary-row"]}>
                <span className={styles["summary-key"]}>
                  Network Fee ({speedOption?.label || "Standard"})
                </span>
                <span className={styles["summary-value"]}>
                  {formatNum(fee, 6)} {selectedCoin?.coin_name || ""}
                </span>
              </div>
              <div className={cx(styles["summary-row"], styles.highlight)}>
                <span className={styles["summary-key"]}>Total Deducted</span>
                <span className={styles["summary-value"]}>
                  {userCurrencySymbol}
                  {formatNum(total)} {selectedCoin?.coin_name || ""}
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
                style={{ flex: 1 }}
                onClick={handleConfirmSend}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
