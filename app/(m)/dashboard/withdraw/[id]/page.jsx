"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Landmark, Wallet2, ArrowLeft, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import styles from "../withdraw.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

const QUICK_PERCENTAGES = [25, 50, 75, 100];

export default function WithdrawPage() {
  const router = useRouter();
  const params = useParams();
  const coinId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;
  const currency = userData?.currency || "$";

  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("crypto");

  // Crypto state
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [addressTouched, setAddressTouched] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Bank state
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swift, setSwift] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [isBankSubmitting, setIsBankSubmitting] = useState(false);

  const availableBalance = coinData?.available_balance || 0;

  // Format currency with user's symbol
  const formatCurrency = (amount) => {
    const symbol = currency;
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  // Format number
  const formatNumber = (num, precision = 6) => {
    if (num === 0 || !num) return "0." + "0".repeat(precision);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(precision);
    return num.toFixed(2);
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

  // Validate address
  const isValidAddress = (value) => {
    return value.trim().length >= 10;
  };

  const addressError =
    addressTouched && !isValidAddress(address)
      ? `Please enter a valid ${coinData?.coin_name || "wallet"} address`
      : null;

  // Quick-amount / Max helpers — shared logic for both the crypto and
  // bank forms, just pointed at different setters.
  function applyQuickAmount(setter, pct) {
    if (!availableBalance) return;
    const value = (availableBalance * pct) / 100;
    // Keep full precision for crypto-style amounts, 2dp is fine for both
    // since the input itself is just a plain number field.
    setter(String(Number(value.toFixed(8))));
  }

  const cryptoFiatEquivalent =
    amount && coinData?.coin_rate
      ? Number(amount) * Number(coinData.coin_rate)
      : null;

  // Handle crypto form submit
  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setAddressTouched(true);
    setSubmitError("");
    setSubmitSuccess(false);

    if (!isValidAddress(address)) {
      toast.error(
        `Please enter a valid ${coinData?.coin_name || "wallet"} address.`,
      );
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter an amount to withdraw.");
      return;
    }

    if (numericAmount > availableBalance) {
      toast.error("Amount exceeds your available balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/user/withdrawal-payment.php", {
        coin_id: parseInt(coinId),
        amount: numericAmount,
        address: address,
        network: network,
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        setTransactionId(res.transaction_id || "N/A");
        toast.success(res.message || "Withdrawal submitted successfully!");
        setAddress("");
        setAmount("");
        setAddressTouched(false);
        await fetchCoinData();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(res.message || "Failed to process withdrawal");
      }
    } catch (err) {
      console.error("Failed to submit withdrawal:", err);
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process withdrawal",
      );
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process withdrawal",
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
    setSubmitSuccess(false);

    if (!accountHolder.trim() || !bankName.trim() || !accountNumber.trim()) {
      toast.error("Please fill in all bank details.");
      return;
    }

    const numericAmount = Number(bankAmount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter an amount to withdraw.");
      return;
    }

    if (numericAmount > availableBalance) {
      toast.error("Amount exceeds your available balance.");
      return;
    }

    setIsBankSubmitting(true);

    try {
      const response = await api.post("/user/withdrawal-payment.php", {
        coin_id: parseInt(coinId),
        amount: numericAmount,
        method: "bank",
        account_holder: accountHolder,
        bank_name: bankName,
        account_number: accountNumber,
        swift: swift,
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        setTransactionId(res.transaction_id || "N/A");
        toast.success(res.message || "Bank withdrawal submitted successfully!");
        setAccountHolder("");
        setBankName("");
        setAccountNumber("");
        setSwift("");
        setBankAmount("");
        await fetchCoinData();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(res.message || "Failed to process bank withdrawal");
      }
    } catch (err) {
      console.error("Failed to submit bank withdrawal:", err);
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process bank withdrawal",
      );
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process bank withdrawal",
      );
    } finally {
      setIsBankSubmitting(false);
    }
  };

  // Go back
  const goBack = () => {
    router.push(`/dashboard/portfolio/${coinId}`);
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
          <h2>Error Loading Withdrawal</h2>
          <p>{error || "Coin not found"}</p>
          <button onClick={goBack} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Withdraw Funds</h1>

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
            <form onSubmit={handleCryptoSubmit} className={styles.form}>
              {/* Select Cryptocurrency */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="coin">
                  Select Cryptocurrency
                </label>
                <div className={styles.coinDisplay}>
                  {coinData.photo ? (
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
                  <div>
                    <div className={styles.coinSymbol}>
                      {coinData.coin_name}
                    </div>
                    <div className={styles.coinName}>{coinData.coin_title}</div>
                  </div>
                  <div className={styles.coinBadge}>Selected</div>
                </div>
              </div>

              {/* Set Destination */}
              <div className={styles.field}>
                <span className={styles.label}>Set Destination</span>
                <div className={styles.destinationTabs}>
                  <span className={styles.destinationTabActive}>
                    <Send size={15} />
                    On-Chain Withdrawal
                  </span>
                </div>
              </div>

              {/* Network */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="network">
                  Network
                </label>
                <select
                  id="network"
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
              </div>

              {/* Withdrawal Address */}
              <div className={styles.field}>
                <label className={styles.label}>Withdrawal Address</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter destination address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => setAddressTouched(true)}
                />
                {addressError && <p className={styles.error}>{addressError}</p>}
              </div>

              {/* Amount — redesigned */}
              <div className={styles.field}>
                <label className={styles.label}>Amount to Withdraw</label>

                <div className={styles.amountCard}>
                  <div className={styles.amountTopRow}>
                    <span className={styles.balancePill}>
                      Available
                      <span className={styles.balancePillValue}>
                        {currency}
                        {formatNumber(availableBalance)} {coinData?.coin_name}
                      </span>
                    </span>
                  </div>

                  <div className={styles.amountWrapper}>
                    <span className={styles.amountPrefix}>
                      {coinData?.coin_name}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={styles.amountInput}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.maxBtn}
                      onClick={() => applyQuickAmount(setAmount, 100)}
                      disabled={!availableBalance}
                    >
                      Max
                    </button>
                  </div>

                  <div className={styles.quickAmounts}>
                    {QUICK_PERCENTAGES.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className={styles.quickAmountBtn}
                        onClick={() => applyQuickAmount(setAmount, pct)}
                        disabled={!availableBalance}
                      >
                        {pct === 100 ? "100%" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className={styles.successMessage}>
                  <span>✅</span>
                  <div>
                    <p className={styles.successTitle}>
                      Withdrawal submitted successfully!
                    </p>
                    <p className={styles.successSub}>
                      Transaction ID: {transactionId}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !address || !amount}
              >
                <Send size={17} />
                <span>{isSubmitting ? "Processing..." : "Withdraw Funds"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleBankSubmit} className={styles.form}>
              {/* Bank Transfer Form */}
              <div className={styles.field}>
                <label className={styles.label}>Account Holder Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Full name on the account"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Bank Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. First Continental Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Account Number / IBAN</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>SWIFT / BIC (optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. FCBKUS33"
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                />
              </div>

              {/* Amount — redesigned */}
              <div className={styles.field}>
                <label className={styles.label}>Amount to Withdraw</label>

                <div className={styles.amountCard}>
                  <div className={styles.amountTopRow}>
                    <span className={styles.balancePill}>
                      Available
                      <span className={styles.balancePillValue}>
                        {formatCurrency(availableBalance)}
                      </span>
                    </span>
                  </div>

                  <div className={styles.amountWrapper}>
                    <span className={styles.amountPrefix}>{currency}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={styles.amountInput}
                      placeholder="0.00"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.maxBtn}
                      onClick={() => applyQuickAmount(setBankAmount, 100)}
                      disabled={!availableBalance}
                    >
                      Max
                    </button>
                  </div>

                  <div className={styles.quickAmounts}>
                    {QUICK_PERCENTAGES.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className={styles.quickAmountBtn}
                        onClick={() => applyQuickAmount(setBankAmount, pct)}
                        disabled={!availableBalance}
                      >
                        {pct === 100 ? "100%" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className={styles.successMessage}>
                  <span>✅</span>
                  <div>
                    <p className={styles.successTitle}>
                      Bank withdrawal submitted successfully!
                    </p>
                    <p className={styles.successSub}>
                      Transaction ID: {transactionId}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={
                  isBankSubmitting ||
                  !accountHolder ||
                  !bankName ||
                  !accountNumber ||
                  !bankAmount
                }
              >
                <Send size={17} />
                <span>
                  {isBankSubmitting ? "Processing..." : "Request Withdrawal"}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBlock}>
            <h3 className={styles.sidebarTitle}>Withdrawal Information</h3>
            <p className={styles.rateLabel}>Current Rate:</p>
            <p className={styles.rateValue}>
              1 {coinData?.coin_name} ={" "}
              {formatCurrency(coinData?.coin_rate || 0)}
            </p>
          </div>

          <div className={styles.sidebarBlock}>
            <h3 className={styles.sidebarTitle}>FAQ</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <p className={styles.faqQ}>How do I make a withdrawal?</p>
                <p className={styles.faqA}>
                  Select your cryptocurrency, enter a valid network address,
                  specify the amount, and click &quot;Withdraw Funds.&quot;
                </p>
              </div>
              <div className={styles.faqItem}>
                <p className={styles.faqQ}>
                  Why have I not received my withdrawal?
                </p>
                <p className={styles.faqA}>
                  Delays may occur due to network congestion. Contact support if
                  it exceeds 24 hours.
                </p>
              </div>
              <div className={styles.faqItem}>
                <p className={styles.faqQ}>Can I cancel a withdrawal?</p>
                <p className={styles.faqA}>
                  No, withdrawals cannot be canceled once processed.
                </p>
              </div>
              <div className={styles.faqItem}>
                <p className={styles.faqQ}>
                  Is there a minimum withdrawal amount?
                </p>
                <p className={styles.faqA}>
                  Minimum: {coinData?.with_min || "Not specified"}{" "}
                  {coinData?.coin_name}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
