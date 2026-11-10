"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Globe,
  Shield,
  DollarSign,
  Briefcase,
  TrendingUp,
  Coins,
  Image,
  FileText,
  Settings,
  CreditCard,
  Clock,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

// Import the BotTokenModal component
import BotTokenModal from "@/components/admin/BotTokenModal";
import UserBalancesModal from "@/components/admin/UserBalancesModal";
import HistoryModal from "@/components/admin/HistoryModal";
import CreateHistoryModal from "@/components/admin/CreateHistoryModal";
import CreditDebitModal from "@/components/admin/CreditDebitModal";
import ManageTradeRecordsModal from "@/components/admin/ManageTradeRecordsModal";
import CreateTradeRecordsModal from "@/components/admin/CreateTradeRecordsModal";
import StakeInvestmentHistoryModal from "@/components/admin/StakeInvestmentHistoryModal";
import SendEmailModal from "@/components/admin/SendEmailModal";
import ConvertBalancesModal from "@/components/admin/ConvertBalancesModal";
import DemoHistoryModal from "@/components/admin/DemoHistoryModal";
import ManageTicketsModal from "@/components/admin/ManageTicketsModal";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCoins, setAvailableCoins] = useState([]);

  // Form data
  const [form, setForm] = useState({
    fullname: "",
    offbal: "",
    email: "",
    phone: "",
    account_type: "",
    is_verified: "",
    kyc_status: "",
    botrequest: "",
    country: "",
    city: "",
    zipcode: "",
    address: "",
    current_trader: "",
    win_rate: "",
    trade_status: "",
    trader_profit: "",
    copiers: "",
    activeplan: "",
    planamount: "",
    profit: "",
    deposit: "",
    withdrawal: "",
    bonus: "",
  });

  // Modal states
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [showCreditDebitModal, setShowCreditDebitModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateHistoryModal, setShowCreateHistoryModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showConvertBalancesModal, setShowConvertBalancesModal] =
    useState(false);
  const [showStakeInvestmentModal, setShowStakeInvestmentModal] =
    useState(false);
  const [showManageTradeRecordsModal, setShowManageTradeRecordsModal] =
    useState(false);
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);
  const [showBotTokenModal, setShowBotTokenModal] = useState(false);
  const [showDemoHistoryModal, setShowDemoHistoryModal] = useState(false);
  const [showManageTicketsModal, setShowManageTicketsModal] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSelectChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Fetch user details
  async function fetchUser() {
    setIsLoading(true);

    try {
      const response = await api.get(`/admin/get-user.php?id=${userId}`);
      const res = response.data;

      if (res.success) {
        setUser(res.user);
        // Update form with user data
        const userData = res.user;
        const formData = {};
        Object.keys(form).forEach((key) => {
          if (userData[key] !== undefined) {
            formData[key] = userData[key];
          }
        });
        setForm((prev) => ({ ...prev, ...formData }));
      } else {
        toast.error(res.message || "User not found");
        setTimeout(() => {
          router.push("/admin/users");
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load user details",
      );
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch available coins
  async function fetchAvailableCoins() {
    try {
      const response = await api.get("/admin/edit-get-coins.php");
      const res = response.data;

      if (res.success) {
        setAvailableCoins(res.coins || []);
      }
    } catch (error) {
      console.error("Failed to fetch coins:", error);
      setAvailableCoins([]);
    }
  }

  // Update user
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    setIsSaving(true);

    try {
      const response = await api.post("/admin/update-user.php", {
        id: parseInt(userId),
        fullname: form.fullname,
        email: form.email,
        phone: form.phone,
        country: form.country,
        city: form.city,
        zipcode: form.zipcode,
        address: form.address,
        current_trader: form.current_trader,
        win_rate: form.win_rate,
        trade_status: form.trade_status,
        trader_profit: form.trader_profit,
        copiers: form.copiers,
        activeplan: form.activeplan,
        planamount: form.planamount,
        profit: form.profit,
        deposit: form.deposit,
        withdrawal: form.withdrawal,
        offbal: form.offbal,
        bonus: form.bonus,
        account_type: form.account_type,
        is_verified: form.is_verified,
        kyc_status: form.kyc_status,
        botrequest: form.botrequest,
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "User updated successfully!");
        await fetchUser();
      } else {
        toast.error(res.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle modal success
  function handleModalSuccess() {
    fetchUser();
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    return (
      "$" +
      Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `/uploads/kyc/${imagePath}`;
  };

  // Load data on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
    fetchAvailableCoins();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-4 lg:p-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-[#232a3b] dark:bg-[#12161f]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600 dark:border-[#232a3b] dark:border-t-green-400" />
            <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
              Loading user details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Link>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Edit User - {user?.fullname || "Loading..."}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Update user information, balances, and settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-4 text-white">
          <span className="block text-xs opacity-80">Total Balance</span>
          <span className="text-xl font-bold">
            {formatCurrency(user?.balances?.total_usd_value)}
          </span>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
          <span className="block text-xs opacity-80">Transactions</span>
          <span className="text-xl font-bold">
            {user?.stats?.transaction_count || 0}
          </span>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-4 text-white">
          <span className="block text-xs opacity-80">Trades</span>
          <span className="text-xl font-bold">
            {user?.stats?.trade_count || 0}
          </span>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-orange-600 to-orange-700 p-4 text-white">
          <span className="block text-xs opacity-80">Coins Held</span>
          <span className="text-xl font-bold">
            {user?.stats?.total_coins || 0}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              User Information
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="fullname"
                      type="text"
                      value={form.fullname}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                    />
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Wallet Address
                  </label>
                  <div className="relative">
                    <CreditCard
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      value={user?.wallet_address || ""}
                      disabled
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                    />
                  </div>
                </div>

                {/* Bot Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Bot Name
                  </label>
                  <div className="relative">
                    <Settings
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      value={user?.botname || ""}
                      disabled
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                    />
                  </div>
                </div>

                {/* Bot Days */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Bot Days
                  </label>
                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      value={user?.botdays || ""}
                      disabled
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                    />
                  </div>
                </div>

                {/* Bot Request */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-amber-500 dark:text-amber-400">
                    Bot Request
                  </label>
                  <select
                    name="botrequest"
                    value={form.botrequest}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  >
                    <option value="not_active">not_active</option>
                    <option value="requested">requested</option>
                    <option value="active">active</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="phone"
                      type="text"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Country
                  </label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="country"
                      type="text"
                      value={form.country}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    City
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Address
                  </label>
                  <div className="relative">
                    <Home
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    />
                  </div>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="zipcode"
                      type="text"
                      value={form.zipcode}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pl-9 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  >
                    <option value={user?.account_type || "N/A"}>
                      {user?.account_type || "N/A"}
                    </option>
                    <option value="Basic Account">Basic Account</option>
                    <option value="Standard Account">Standard Account</option>
                    <option value="Premium Account">Premium Account</option>
                    <option value="vip Account">VIP Account</option>
                  </select>
                </div>

                {/* KYC Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    KYC Status
                  </label>
                  <select
                    name="kyc_status"
                    value={form.kyc_status}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                    <option value="pending">pending</option>
                  </select>
                </div>

                {/* Email Verified */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                    Email Verified
                  </label>
                  <select
                    name="is_verified"
                    value={form.is_verified}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </div>

                {/* Trading Fields */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-red-500 dark:text-red-400">
                    Current Trader
                  </label>
                  <input
                    name="current_trader"
                    type="text"
                    value={form.current_trader}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-red-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-red-500 dark:text-red-400">
                    Win Rate
                  </label>
                  <input
                    name="win_rate"
                    type="text"
                    value={form.win_rate}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-red-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-red-500 dark:text-red-400">
                    Trade Status
                  </label>
                  <input
                    name="trade_status"
                    type="text"
                    value={form.trade_status}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-red-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-red-500 dark:text-red-400">
                    Trader Profit
                  </label>
                  <input
                    name="trader_profit"
                    type="text"
                    value={form.trader_profit}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-red-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-red-500 dark:text-red-400">
                    Copiers
                  </label>
                  <input
                    name="copiers"
                    type="text"
                    value={form.copiers}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-red-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                {/* Financial Fields */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Active Plan
                  </label>
                  <input
                    name="activeplan"
                    type="text"
                    value={form.activeplan}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Plan Amount ($)
                  </label>
                  <input
                    name="planamount"
                    type="number"
                    step="any"
                    value={form.planamount}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Profit ($)
                  </label>
                  <input
                    name="profit"
                    type="number"
                    step="any"
                    value={form.profit}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Deposit ($)
                  </label>
                  <input
                    name="deposit"
                    type="number"
                    step="any"
                    value={form.deposit}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Payout/Withdrawal ($)
                  </label>
                  <input
                    name="withdrawal"
                    type="number"
                    step="any"
                    value={form.withdrawal}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Bonus ($)
                  </label>
                  <input
                    name="bonus"
                    type="number"
                    step="any"
                    value={form.bonus}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-emerald-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#1a2035] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Demo Balance ($)
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="number"
                      step="any"
                      value={user?.demobal || ""}
                      disabled
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-sm text-zinc-500 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Offshore Balance ($)
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="number"
                      name="offbal"
                      value={form.offbal}
                      onChange={handleChange}
                      disabled={isSaving}
                      step="any"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2.5 pl-9 text-bold text-orange-800 opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-orange-800"
                    />
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-[#232a3b]">
                <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-white">
                  KYC Documents
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
                    <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                      Front Image
                    </label>
                    {user?.frontimage ? (
                      <div className="text-center">
                        <img
                          src={getImageUrl(user.frontimage)}
                          alt="Front ID"
                          className="mx-auto max-h-48 w-auto rounded-md object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="mt-2 break-all text-xs text-zinc-500 dark:text-[#8b93a7]">
                          {user.frontimage}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6 text-zinc-400">
                        <Image size={48} className="opacity-30" />
                        <p className="text-sm">No front image uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[#232a3b] dark:bg-[#1a2035]">
                    <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                      Back Image
                    </label>
                    {user?.backimage ? (
                      <div className="text-center">
                        <img
                          src={getImageUrl(user.backimage)}
                          alt="Back ID"
                          className="mx-auto max-h-48 w-auto rounded-md object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="mt-2 break-all text-xs text-zinc-500 dark:text-[#8b93a7]">
                          {user.backimage}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6 text-zinc-400">
                        <Image size={48} className="opacity-30" />
                        <p className="text-sm">No back image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b] sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update User
                    </>
                  )}
                </button>

                <Link
                  href="/admin/users"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                >
                  <X size={18} />
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
            <h2 className="mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowBalancesModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <Coins size={18} />
                View Balances
              </button>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 hover:translate-x-1"
              >
                <FileText size={18} />
                Manage History
              </button>

              <button
                onClick={() => setShowCreateHistoryModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 hover:translate-x-1"
              >
                <FileText size={18} />
                Create History
              </button>

              <button
                onClick={() => setShowCreditDebitModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <DollarSign size={18} />
                Credit & Debit
              </button>

              <button
                onClick={() => setShowManageTradeRecordsModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <TrendingUp size={18} />
                Manage Trade Records
              </button>

              <button
                onClick={() => setShowCreateTradeModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <TrendingUp size={18} />
                Create Trade Records
              </button>

              <button
                onClick={() => setShowStakeInvestmentModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-pink-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-pink-700 hover:translate-x-1"
              >
                <Shield size={18} />
                Stake History
              </button>

              <button
                onClick={() => setShowStakeInvestmentModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 hover:translate-x-1"
              >
                <Briefcase size={18} />
                Investment History
              </button>

              <button
                onClick={() => setShowSendEmailModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-lime-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-lime-700 hover:translate-x-1"
              >
                <Mail size={18} />
                Send Email
              </button>

              <button
                onClick={() => setShowConvertBalancesModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 hover:translate-x-1"
              >
                <Coins size={18} />
                Convert Balances
              </button>

              <button
                onClick={() => setShowBotTokenModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <Settings size={18} />
                Bot Token Manager
                {user?.botrequest === "active" && (
                  <span className="ml-auto rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                    Active
                  </span>
                )}
                {user?.botrequest === "requested" && (
                  <span className="ml-auto rounded-full bg-amber-500/30 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    Pending
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowDemoHistoryModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <TrendingUp size={18} />
                Demo History
              </button>

              <button
                onClick={() => setShowManageTicketsModal(true)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 hover:translate-x-1"
              >
                <MessageSquare size={18} />
                Manage Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Note: Modals would be rendered here */}
      {/* Since this is a complex page with multiple modals, you would need to create separate modal components */}
      {/* and import them here. For now, this is the main page structure. */}

      {/* Render BotTokenModal */}
      {/* ===== ALL MODALS RENDERED HERE ===== */}

      {/* User Balances Modal */}
      <UserBalancesModal
        show={showBalancesModal}
        user={user}
        onClose={() => {
          setShowBalancesModal(false);
          handleModalSuccess();
        }}
      />

      {/* Bot Token Modal */}
      <BotTokenModal
        show={showBotTokenModal}
        user={user}
        onClose={() => {
          setShowBotTokenModal(false);
        }}
        onSuccess={() => {
          setShowBotTokenModal(false);
          handleModalSuccess();
        }}
      />

      {/* Credit Debit Modal */}
      <CreditDebitModal
        show={showCreditDebitModal}
        user={user}
        availableCoins={availableCoins}
        onClose={() => {
          setShowCreditDebitModal(false);
        }}
        onSuccess={() => {
          setShowCreditDebitModal(false);
          handleModalSuccess();
        }}
      />

      {/* History Modal */}
      <HistoryModal
        show={showHistoryModal}
        user={user}
        onClose={() => {
          setShowHistoryModal(false);
        }}
        onSuccess={() => {
          setShowHistoryModal(false);
          handleModalSuccess();
        }}
      />

      {/* Create History Modal */}
      <CreateHistoryModal
        show={showCreateHistoryModal}
        user={user}
        availableCoins={availableCoins}
        onClose={() => {
          setShowCreateHistoryModal(false);
        }}
        onSuccess={() => {
          setShowCreateHistoryModal(false);
          handleModalSuccess();
        }}
      />

      {/* Manage Trade Records Modal */}
      <ManageTradeRecordsModal
        show={showManageTradeRecordsModal}
        user={user}
        onClose={() => {
          setShowManageTradeRecordsModal(false);
        }}
        onSuccess={() => {
          setShowManageTradeRecordsModal(false);
          handleModalSuccess();
        }}
      />

      {/* Create Trade Records Modal */}
      <CreateTradeRecordsModal
        show={showCreateTradeModal}
        user={user}
        onClose={() => {
          setShowCreateTradeModal(false);
        }}
        onSuccess={() => {
          setShowCreateTradeModal(false);
          handleModalSuccess();
        }}
      />

      {/* Stake Investment Modal */}
      <StakeInvestmentHistoryModal
        show={showStakeInvestmentModal}
        user={user}
        onClose={() => {
          setShowStakeInvestmentModal(false);
        }}
        onSuccess={() => {
          setShowStakeInvestmentModal(false);
          handleModalSuccess();
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        show={showSendEmailModal}
        user={user}
        onClose={() => {
          setShowSendEmailModal(false);
        }}
        onSuccess={() => {
          setShowSendEmailModal(false);
          handleModalSuccess();
        }}
      />

      {/* Convert Balances Modal */}
      <ConvertBalancesModal
        show={showConvertBalancesModal}
        user={user}
        availableCoins={availableCoins}
        onClose={() => {
          setShowConvertBalancesModal(false);
        }}
        onSuccess={() => {
          setShowConvertBalancesModal(false);
          handleModalSuccess();
        }}
      />

      {/* Demo History Modal */}

      <DemoHistoryModal
        show={showDemoHistoryModal}
        user={user}
        onClose={() => setShowDemoHistoryModal(false)}
        onSuccess={() => {
          setShowDemoHistoryModal(false);
          handleModalSuccess();
        }}
      />

      {/* Manage Tickets Modal */}

      <ManageTicketsModal
        show={showManageTicketsModal}
        user={user}
        onClose={() => setShowManageTicketsModal(false)}
        onSuccess={() => {
          handleModalSuccess();
        }}
      />
    </div>
  );
}
