"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import {
  User,
  ShieldCheck,
  Copy,
  BarChart3,
  Activity,
  Calendar,
  Pencil,
  Check,
  X,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  MapPin,
} from "lucide-react";
import styles from "./Profile.module.css";
import { useRouter } from "next/navigation";

const chainGradients = {
  Ethereum: "linear-gradient(135deg, #627eea, #8fa4ff)",
  Solana: "linear-gradient(135deg, #14f195, #627eea)",
  Polygon: "linear-gradient(135deg, #8247e5, #a879ff)",
  Bitcoin: "linear-gradient(135deg, #f7931a, #ffb84d)",
};

function walletGradient(chain) {
  return chainGradients[chain] ?? "linear-gradient(135deg, #22c55e, #4ade80)";
}

function truncate(address) {
  if (!address) return "—";

  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useMe();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [draft, setDraft] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    city: "",
    zipcode: "",
    dob: "",
  });

  const userData = user.data?.user;

  const formatCurrency = (amount, currency) => {
    if (amount == null || !currency) return "N/A";

    return `${currency}${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const stats = [
    {
      label: "Deposit Value",
      value: formatCurrency(userData?.deposit, userData?.currency),
      icon: BarChart3,
    },
    {
      label: "Total Withdrawal Value",
      value: formatCurrency(userData?.withdrawal, userData?.currency),
      icon: Activity,
    },
    {
      label: "Member Since",
      value: userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString()
        : "Unknown",
      icon: Calendar,
    },
    {
      label: "Email Status",
      value: "Verified",
      icon: ShieldCheck,
    },
  ];

  const avatarInitial =
    user.data?.user?.fullname?.charAt(0)?.toUpperCase() ?? "A";

  function startEdit() {
    const currentUser = user.data?.user;

    setDraft({
      fullName: currentUser?.fullname ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
      country: currentUser?.country ?? "",
      address: currentUser?.address ?? "",
      city: currentUser?.city ?? "",
      zipcode: currentUser?.zipcode ?? "",
      dob: currentUser?.dob ? String(currentUser.dob).split("T")[0] : "",
    });

    setIsEditing(true);
  }

  function cancelEdit() {
    if (isSaving) return;
    setIsEditing(false);
  }

  function handleInputChange(field, value) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveEdit() {
    if (isSaving) return;

    setIsSaving(true);
    toast.dismiss();

    try {
      const response = await api.post("/user/profile_update.php", {
        phone: draft.phone,
        address: draft.address,
        country: draft.country,
        city: draft.city,
        zipcode: draft.zipcode,
        dob: draft.dob || "",
      });

      const res = response.data;

      if (!res.success) {
        throw new Error(res.message || "Could not update profile.");
      }

      // Refresh user data
      await queryClient.invalidateQueries({
        queryKey: ["session"],
      });

      // If useMe() uses ["me"], keep this too.
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });

      setIsEditing(false);

      toast.success(res.message || "Profile updated successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyAddress(address) {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Could not copy address");
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Profile header */}
      <div className={styles.profileHeader}>
        <div className={styles.cover}>
          <div className={styles.coverGrid}></div>
          <div className={styles.coverGlow}></div>
        </div>

        <div className={styles.headerBody}>
          <div className={styles.avatarBlock}>
            <div className={styles.avatarLg}>{avatarInitial}</div>

            <button className={styles.avatarEdit} aria-label="Change avatar">
              <User size={14} />
            </button>
          </div>

          <div className={styles.headerMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{user.data?.user?.fullname}</h1>

              {userData?.kyc_status === "true" ? (
                <span className={styles.verifiedBadge}>
                  <ShieldCheck size={13} />
                  Verified
                </span>
              ) : (
                <Link href="/dashboard/kyc" className={styles.verifyLink}>
                  <span className={styles.NotVerifiedBadge}>
                    <ShieldCheck size={13} />
                    Not Verified
                  </span>
                </Link>
              )}
            </div>

            <p className={styles.email}>{user.data?.user?.email}</p>
          </div>

          {!isEditing && (
            <button className={styles.btnEdit} onClick={startEdit}>
              <Pencil size={14} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon size={18} />
              </div>

              <div className={styles.statMeta}>
                <span className={styles.statLabel}>{stat.label}</span>

                <span className={styles.statValue}>{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div className={styles.contentGrid}>
        {/* Personal Info Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Personal Information</h2>

            {isEditing && (
              <div className={`${styles.editActions} ${styles.desktopOnly}`}>
                <button
                  type="button"
                  className={`${styles.btnIconText} ${styles.ghost}`}
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  className={`${styles.btnIconText} ${styles.primary}`}
                  onClick={saveEdit}
                  disabled={isSaving}
                >
                  <Check size={14} />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>

          <div className={styles.fieldGrid}>
            {/* Full Name */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Full Name</span>

              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={draft.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  disabled
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.fullname || "—"}
                </span>
              )}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <Mail size={12} />
                Email
              </span>

              {isEditing ? (
                <input
                  type="email"
                  className={styles.fieldInput}
                  value={draft.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.email || "—"}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <Phone size={12} />
                Phone
              </span>

              {isEditing ? (
                <input
                  type="tel"
                  className={styles.fieldInput}
                  value={draft.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.phone || "—"}
                </span>
              )}
            </div>

            {/* Country */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <Globe size={12} />
                Country
              </span>

              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={draft.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.country || "—"}
                </span>
              )}
            </div>

            {/* Address */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <MapPin size={12} />
                Address
              </span>

              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={draft.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your address"
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.address || "—"}
                </span>
              )}
            </div>

            {/* City */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <MapPin size={12} />
                City
              </span>

              {isEditing ? (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={draft.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.city || "—"}
                </span>
              )}
            </div>

            {/* Zipcode */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Zipcode</span>

              {isEditing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.fieldInput}
                  value={draft.zipcode}
                  onChange={(e) => handleInputChange("zipcode", e.target.value)}
                  placeholder="Enter zipcode"
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.zipcode || "—"}
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <Calendar size={12} />
                Date of Birth
              </span>

              {isEditing ? (
                <input
                  type="date"
                  className={styles.fieldInput}
                  value={draft.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              ) : (
                <span className={styles.fieldValue}>
                  {user.data?.user?.dob || "—"}
                </span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className={styles.mobileEditActions}>
              <button
                type="button"
                className={`${styles.btnIconText} ${styles.ghost} ${styles.fullWidth}`}
                onClick={cancelEdit}
                disabled={isSaving}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className={`${styles.btnIconText} ${styles.primary} ${styles.fullWidth}`}
                onClick={saveEdit}
                disabled={isSaving}
              >
                <Check size={14} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Side Column */}
        <div className={styles.sideCol}>
          {/* Connected Wallets */}
          {/* Connected Wallets */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Connected Wallet</h2>
            </div>

            <div className={styles.walletList}>
              {userData?.wallet_address ? (
                <div className={styles.walletRow}>
                  <div
                    className={styles.walletChainIcon}
                    style={{
                      background: walletGradient("Ethereum"),
                    }}
                  >
                    E
                  </div>

                  <div className={styles.walletMeta}>
                    <span className={styles.walletChain}>Connected Wallet</span>

                    <span className={styles.walletAddress}>
                      {truncate(userData.wallet_address)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyAddress(userData.wallet_address)}
                    aria-label="Copy wallet address"
                    title="Copy wallet address"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ) : (
                <p className={styles.walletEmpty}>No wallet connected yet.</p>
              )}
            </div>
          </div>

          {/* Security Status */}
          <div className={`${styles.panel} ${styles.securityMini}`}>
            <div className={styles.panelHeader}>
              <h2>Security</h2>
            </div>

            <div className={styles.securityStack}>
              <div className={styles.securityRow}>
                <span className={styles.securityLabel}>
                  Two-factor authentication
                </span>

                <span className={styles.securityStatusOn}>Secured</span>
              </div>
            </div>

            <Link href="/dashboard/kyc" className={styles.securityLink}>
              <span>Identity Verification</span>
              <ExternalLink size={12} />
            </Link>

            <button
              className={`${styles.btnEdit2} bg-red-800 hover:bg-red-700 mt-2`}
              onClick={() => router.push("/dashboard/security")}
            >
              <Pencil size={14} />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
