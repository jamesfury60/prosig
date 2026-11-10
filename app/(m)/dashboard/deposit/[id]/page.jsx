"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, UploadCloud, Landmark, Wallet2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import styles from "../deposit.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import LoadingDiamond from "@/components/LoadingEffect";

export default function DepositPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const coinId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("crypto");
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Bank state
  const [bankAmount, setBankAmount] = useState("");
  const [bankProofFile, setBankProofFile] = useState(null);
  const [isBankSubmitting, setIsBankSubmitting] = useState(false);
  const [bankSubmitSuccess, setBankSubmitSuccess] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Format number
  const formatNumber = (num, precision = 2) => {
    if (num === 0 || !num) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    if (num < 1000) return num.toFixed(precision);
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Fetch coin data
  const fetchCoinData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/portfolio.php?coin_id=${coinId}`);
      const res = response.data;

      if (res.success) {
        setCoinData(res.data);
        // Set default network
        if (res.data.networks && res.data.networks.length > 0) {
          setNetwork(res.data.networks[0].id);
        }
      } else {
        throw new Error(res.message || "Failed to load coin data");
      }
    } catch (err) {
      console.error("Failed to fetch coin data:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load coin data",
      );
      toast.error("Failed to load coin data");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (coinId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCoinData();
    }
  }, [coinId]);

  // Copy to clipboard
  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error("Could not copy — copy it manually");
    }
  };

  // Handle crypto form submit
  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter the deposit amount.");
      return;
    }

    if (!proofFile) {
      toast.error("Please upload a screenshot of your transaction.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("coin_id", coinId);
      formData.append("amount", amount);
      formData.append("photo_proof", proofFile);
      formData.append("network", network);

      const response = await api.post("/user/verify-payment.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        toast.success(res.message || "Payment verification submitted!");
        setAmount("");
        setProofFile(null);
        // Reset file input

        // Refresh user balance after trade
        await queryClient.invalidateQueries({
          queryKey: ["session"],
        });

        // Refresh activities
        await queryClient.invalidateQueries({
          queryKey: ["activities"],
        });

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(res.message || "Failed to submit payment verification");
      }
    } catch (err) {
      console.error("Failed to submit:", err);
      setSubmitError(
        err?.response?.data?.message || err?.message || "Failed to submit",
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to submit",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bank form submit
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setSubmitError("");
    setBankSubmitSuccess(false);

    if (!bankAmount || Number(bankAmount) <= 0) {
      toast.error("Please enter the deposit amount.");
      return;
    }

    if (!bankProofFile) {
      toast.error("Please upload proof of transfer.");
      return;
    }

    setIsBankSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("coin_id", coinId);
      formData.append("amount", bankAmount);
      formData.append("photo_proof", bankProofFile);
      formData.append("method", "bank");

      const response = await api.post("/user/verify-payment.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = response.data;

      if (res.success) {
        setBankSubmitSuccess(true);
        toast.success(res.message || "Bank transfer verification submitted!");
        setBankAmount("");
        setBankProofFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        setTimeout(() => setBankSubmitSuccess(false), 5000);
      } else {
        throw new Error(res.message || "Failed to submit bank verification");
      }
    } catch (err) {
      console.error("Failed to submit bank:", err);
      setSubmitError(
        err?.response?.data?.message || err?.message || "Failed to submit",
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to submit",
      );
    } finally {
      setIsBankSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return <LoadingDiamond />;
  }

  // Error state
  if (error || !coinData) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Deposit</h2>
          <p>{error || "Coin not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className={styles.backBtn}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Bank details (static for now - can be fetched from API)
  const BANK_DETAILS = {
    bankName: "First Continental Bank",
    accountName: "Vaultline Payments Ltd",
    accountNumber: "0192837465",
    swift: "FCBKUS33",
    // eslint-disable-next-line react-hooks/purity
    reference: `DEP-${Math.floor(Math.random() * 10000)}-VL`,
  };

  return (
    <div className={styles.page}>
      {/* Back Button */}
      {/* <button
        onClick={() => router.push("/dashboard")}
        className={styles.backBtn}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button> */}

      <h1 className={styles.title}>Deposit Funds</h1>

      {/* Method Toggle */}
      <div
        className={styles.methodToggle}
        role="tablist"
        aria-label="Payment method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={method === "crypto"}
          className={`${styles.methodTab} ${method === "crypto" ? styles.methodTabActive : ""}`}
          onClick={() => setMethod("crypto")}
        >
          <Wallet2 size={16} />
          <span>Crypto</span>
        </button>
        {/* <button
          type="button"
          role="tab"
          aria-selected={method === "bank"}
          className={`${styles.methodTab} ${method === "bank" ? styles.methodTabActive : ""}`}
          onClick={() => setMethod("bank")}
        >
          <Landmark size={16} />
          <span>Bank Transfer</span>
        </button> */}
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {method === "crypto" ? (
            <>
              {/* Selected Coin */}
              <div className={styles.field}>
                <label className={styles.label}>Selected Coin</label>
                <div className={styles.coinDisplay}>
                  {coinData.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coinData.photo}
                      alt={coinData.coin_name}
                      className={styles.coinIcon}
                    />
                  ) : (
                    <div className={styles.coinIconPlaceholder}>
                      {coinData.coin_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Network */}
              <div className={styles.field}>
                <label className={styles.label}>Select Network</label>
                <select
                  className={styles.select}
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  {(
                    coinData.networks || [
                      {
                        id: coinData.coin_name,
                        label: `${coinData.coin_name} Network`,
                      },
                    ]
                  ).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <p className={styles.hint}>
                  Make sure the network you choose for the deposit matches the
                  withdrawal network or your assets may be lost.
                </p>
              </div>

              {/* Deposit Address */}
              <div className={styles.field}>
                <label className={styles.label}>Deposit Address</label>
                <div className={styles.addressRow}>
                  <span className={styles.address}>
                    {coinData.deposit_address ||
                      "Please contact support for wallet address"}
                  </span>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() =>
                      handleCopy(
                        coinData.deposit_address ||
                          "Please contact support for wallet address",
                        "Address",
                      )
                    }
                    aria-label="Copy deposit address"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Info Grid */}
              <div className={styles.infoGrid}>
                <div>
                  <span className={styles.infoLabel}>Expected Arrival</span>
                  <span className={styles.infoValue}>
                    1 network confirmation
                  </span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Coin</span>
                  <span className={styles.infoValue}>
                    Only send {coinData.coin_name?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Minimum Deposit</span>
                  <span className={styles.infoValue}>
                    {coinData.with_min
                      ? formatCurrency(coinData.with_min)
                      : "No minimum"}
                  </span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Maximum Deposit</span>
                  <span className={styles.infoValue}>
                    {coinData.with_max
                      ? formatCurrency(coinData.with_max)
                      : "No maximum"}
                  </span>
                </div>
              </div>

              {/* Verify Payment Form */}
              <form
                className={styles.verifyPanel}
                onSubmit={handleCryptoSubmit}
              >
                <h3 className={styles.verifyTitle}>Verify Payment</h3>

                {/* {submitSuccess && (
                  <div className={styles.successMessage}>
                    Payment verification submitted successfully! Our team will
                    review it shortly.
                  </div>
                )}

                {submitError && (
                  <div className={styles.errorMessage}>{submitError}</div>
                )} */}

                <div className={styles.field}>
                  <label className={styles.label}>Amount ({currency})</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    className={styles.input}
                    placeholder={`Enter amount in ${currency}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Upload Photo Proof</label>
                  <div className={styles.fileInputWrapper}>
                    <label className={styles.fileInput}>
                      <span>{proofFile ? proofFile.name : "Choose File"}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] ?? null)
                        }
                        required
                        hidden
                      />
                    </label>
                  </div>
                  <p className={styles.hint}>
                    Upload screenshot of transaction confirmation (JPG, PNG,
                    PDF)
                  </p>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  <UploadCloud size={18} />
                  <span>
                    {isSubmitting ? "Submitting..." : "Verify Payment"}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Bank Transfer */}
              <div className={styles.bankHeader}>
                <span className={styles.bankIcon}>
                  <Landmark size={20} />
                </span>
                <div>
                  <h3 className={styles.verifyTitle}>Bank Transfer Details</h3>
                  <p className={styles.hint}>
                    Transfer to the account below, then submit your proof for
                    verification.
                  </p>
                </div>
              </div>

              <div className={styles.bankDetails}>
                {[
                  ["Bank Name", BANK_DETAILS.bankName],
                  ["Account Name", BANK_DETAILS.accountName],
                  ["Account Number", BANK_DETAILS.accountNumber],
                  ["SWIFT / BIC", BANK_DETAILS.swift],
                  ["Reference (required)", BANK_DETAILS.reference],
                ].map(([label, value]) => (
                  <div key={label} className={styles.bankRow}>
                    <div>
                      <span className={styles.infoLabel}>{label}</span>
                      <span className={styles.infoValue}>{value}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => handleCopy(value, label)}
                      aria-label={`Copy ${label}`}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bank Verify Form */}
              <form className={styles.verifyPanel} onSubmit={handleBankSubmit}>
                <h3 className={styles.verifyTitle}>Verify Payment</h3>

                {bankSubmitSuccess && (
                  <div className={styles.successMessage}>
                    Bank transfer verification submitted successfully! Our team
                    will review it shortly.
                  </div>
                )}

                {submitError && (
                  <div className={styles.errorMessage}>{submitError}</div>
                )}

                <div className={styles.field}>
                  <label className={styles.label}>Amount ({currency})</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    className={styles.input}
                    placeholder={`Enter amount in ${currency}`}
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Upload Proof of Transfer
                  </label>
                  <div className={styles.fileInputWrapper}>
                    <label className={styles.fileInput}>
                      <span>
                        {bankProofFile ? bankProofFile.name : "Choose File"}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) =>
                          setBankProofFile(e.target.files?.[0] ?? null)
                        }
                        required
                        hidden
                      />
                    </label>
                  </div>
                  <p className={styles.hint}>
                    Upload bank receipt or confirmation (JPG, PNG, PDF)
                  </p>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isBankSubmitting}
                >
                  <UploadCloud size={18} />
                  <span>
                    {isBankSubmitting ? "Submitting..." : "Verify Payment"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>
            {method === "crypto"
              ? "Facing Deposit Issues?"
              : "Bank Transfer Tips"}
          </h3>
          <ul className={styles.tipsList}>
            {method === "crypto" ? (
              <>
                <li>
                  Ensure the selected network matches your sending platform.
                </li>
                <li>Double check the wallet address before sending.</li>
                <li>
                  Reach out to support if funds don&rsquo;t arrive in 1 hour.
                </li>
                <li>Keep your transaction hash for verification.</li>
                <li>
                  Minimum deposit:{" "}
                  {coinData.with_min
                    ? formatCurrency(coinData.with_min)
                    : "None specified"}
                </li>
                <li>
                  Maximum deposit:{" "}
                  {coinData.with_max
                    ? formatCurrency(coinData.with_max)
                    : "None specified"}
                </li>
              </>
            ) : (
              <>
                <li>Always include the reference code with your transfer.</li>
                <li>Transfers typically take 1–3 business days to reflect.</li>
                <li>The sender name must match your account name.</li>
                <li>Keep your bank receipt for verification.</li>
                <li>
                  Contact support if funds don&rsquo;t arrive within 3 days.
                </li>
              </>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
