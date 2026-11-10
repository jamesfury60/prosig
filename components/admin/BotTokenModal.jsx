"use client";

import { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  Mail,
  AlertCircle,
  CheckCircle,
  Bot,
  Power,
  PowerOff,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";

export default function BotTokenModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [form, setForm] = useState({
    bottoken: "",
    botrequest: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Status description helper
  const getStatusDescription = (status) => {
    switch (status) {
      case "active":
        return "Bot is active and running for this user";
      case "not_active":
        return "Bot is inactive/stopped for this user";
      case "requested":
        return "Send activation email to user with the token";
      default:
        return "Select a status to update bot settings";
    }
  };

  // Button text helper
  const getButtonText = (status) => {
    switch (status) {
      case "requested":
        return "Request & Send Email";
      case "active":
        return "Activate Bot";
      case "not_active":
        return "Deactivate Bot";
      default:
        return "Update Bot Token";
    }
  };

  // Generate random token
  const generateToken = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters

    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    setForm((prev) => ({ ...prev, bottoken: token }));
  };

  // Generate token and return
  const generateTokenAndReturn = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    const length = Math.floor(Math.random() * 3) + 6;
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (show && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        bottoken: user?.bottoken || generateTokenAndReturn(),
        botrequest: user?.botrequest || "not_active",
      });
      setMessage({ type: "", text: "" });
    }
  }, [show, user]);

  // Update bot token
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!form.botrequest) {
      toast.error("Please select a bot request status");
      return;
    }

    if (!form.bottoken) {
      toast.error("Please enter or generate a bot token");
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/update-bot-token.php", {
        userid: user?.id,
        email: user?.email,
        fullname: user?.fullname,
        botrequest: form.botrequest,
        bottoken: form.bottoken,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Bot token updated successfully!",
        });
        toast.success(res.message || "Bot token updated successfully!");
        if (onSuccess) onSuccess();

        // Auto close after delay
        const delay = form.botrequest === "requested" ? 3000 : 1500;
        setTimeout(() => {
          if (onClose) onClose();
        }, delay);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update bot token",
        });
        toast.error(res.message || "Failed to update bot token");
      }
    } catch (error) {
      console.error("Failed to update bot token:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update bot token";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleOverlayKeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClose();
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
          <h3
            id="modal-title"
            className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
          >
            <Bot size={20} className="text-green-600 dark:text-green-400" />
            Bot Token Management - {user?.fullname || "User"}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Bot Token Field */}
          <div className="mb-4">
            <label
              htmlFor="bottoken"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Bot Token
            </label>
            <div className="flex gap-2">
              <input
                id="bottoken"
                type="text"
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                placeholder="Enter bot token"
                value={form.bottoken}
                onChange={(e) => setForm({ ...form, bottoken: e.target.value })}
                disabled={isSaving}
                required
              />
              <button
                type="button"
                onClick={generateToken}
                disabled={isSaving}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
                title="Generate Random Token"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              Generate a random 6-8 character token or enter manually
            </p>
          </div>

          {/* Bot Request Status */}
          <div className="mb-4">
            <label
              htmlFor="botrequest"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Bot Request Status
            </label>
            <select
              id="botrequest"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white"
              value={form.botrequest}
              onChange={(e) => setForm({ ...form, botrequest: e.target.value })}
              disabled={isSaving}
              required
            >
              <option value="">Select Status</option>
              <option value="active">✅ Active - Bot is running</option>
              <option value="not_active">❌ Not Active - Bot is stopped</option>
              <option value="requested">
                📧 Requested - Send activation email
              </option>
            </select>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              {getStatusDescription(form.botrequest)}
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <span className="text-sm text-zinc-600 dark:text-[#8b93a7]">
              Current Status:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                user?.botrequest === "active"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : user?.botrequest === "requested"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
              }`}
            >
              {user?.botrequest === "active" ? (
                <>
                  <Power size={12} />
                  Active
                </>
              ) : user?.botrequest === "requested" ? (
                <>
                  <Mail size={12} />
                  Requested
                </>
              ) : (
                <>
                  <PowerOff size={12} />
                  Not Active
                </>
              )}
            </span>
          </div>

          {/* Warning for requested status */}
          {form.botrequest === "requested" && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
              <Send size={18} className="text-amber-500 flex-shrink-0" />
              <div className="text-sm text-zinc-600 dark:text-[#8b93a7]">
                <strong className="text-amber-500">Email will be sent</strong>{" "}
                to {user?.email} with the bot activation token.
              </div>
            </div>
          )}

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !form.botrequest}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60 ${
                form.botrequest === "requested"
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                  : form.botrequest === "active"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    : "bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800"
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="mr-2 inline animate-spin" />
                  Updating...
                </>
              ) : (
                getButtonText(form.botrequest)
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
