"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  X,
  MessageSquare,
  Plus,
  ArrowLeft,
  Send,
  Loader2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ManageTicketsModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  // view: "list" | "thread" | "create"
  const [view, setView] = useState("list");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Thread state
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Create state
  const [createForm, setCreateForm] = useState({
    subject: "",
    message: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (show) {
      setView("list");
      setTickets([]);
      setActiveTicket(null);
      setMessages([]);
      setReply("");
      setError("");
      setCreateForm({ subject: "", message: "" });
      if (user?.id) {
        fetchTickets();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user?.id]);

  // Scroll thread to bottom
  useEffect(() => {
    if (view === "thread" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  async function fetchTickets() {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get(
        `/admin/support-tickets.php?userid=${user.id}`,
      );
      const res = response.data;
      if (res.success) {
        setTickets(res.tickets || []);
      } else {
        setError(res.message || "Failed to load tickets");
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchThread(ticketId) {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get(
        `/admin/support-ticket.php?id=${ticketId}`,
      );
      const res = response.data;
      if (res.success) {
        setActiveTicket(res.data.ticket);
        setMessages(res.data.messages || []);
        setView("thread");
      } else {
        toast.error(res.message || "Failed to load ticket");
      }
    } catch (err) {
      console.error("Fetch thread error:", err);
      toast.error(err.response?.data?.message || "Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    toast.dismiss();

    if (!reply.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSending(true);
    try {
      const response = await api.post("/admin/support-ticket.php", {
        ticket_id: activeTicket.id,
        message: reply.trim(),
      });
      const res = response.data;
      if (res.success) {
        toast.success(res.message || "Reply sent");
        setReply("");
        await fetchThread(activeTicket.id);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to send reply");
      }
    } catch (err) {
      console.error("Reply error:", err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    toast.dismiss();

    if (!createForm.subject.trim() || !createForm.message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post("/admin/create-ticket.php", {
        userid: user.id,
        subject: createForm.subject.trim(),
        message: createForm.message.trim(),
      });
      const res = response.data;
      if (res.success) {
        toast.success(res.message || "Ticket created");
        setCreateForm({ subject: "", message: "" });
        setView("list");
        await fetchTickets();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to create ticket");
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  }

  function handleClose() {
    if (onClose) onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  if (!show) return null;

  const headerTitle =
    view === "list"
      ? `Manage Tickets - ${user?.fullname || "User"}`
      : view === "thread"
        ? `Ticket #${activeTicket?.id} - ${user?.fullname || "User"}`
        : `Create Ticket - ${user?.fullname || "User"}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
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
          <div className="flex items-center gap-2.5">
            {view !== "list" && (
              <button
                onClick={() => {
                  setView("list");
                  setActiveTicket(null);
                  setMessages([]);
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-[#1a2035] dark:hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3
              id="modal-title"
              className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
            >
              <MessageSquare
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              {headerTitle}
            </h3>
          </div>
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
          {/* ===================== LIST VIEW ===================== */}
          {view === "list" && (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                  {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => setView("create")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02]"
                >
                  <Plus size={14} />
                  Create Ticket
                </button>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/15 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={24}
                    className="animate-spin text-green-600 dark:text-green-400"
                  />
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <MessageSquare
                    size={40}
                    className="text-zinc-300 dark:text-[#232a3b]"
                  />
                  <p className="text-sm text-zinc-500 dark:text-[#8b93a7]">
                    No tickets for this user yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => fetchThread(ticket.id)}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left transition-colors hover:border-green-500/40 hover:bg-green-500/5 dark:border-[#232a3b] dark:bg-[#1a2035] dark:hover:border-green-500/40 dark:hover:bg-green-500/10"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <MessageSquare size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {ticket.subject}
                          </span>
                          {ticket.admin_read === 1 && (
                            <span className="flex-shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                              Unread
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500 dark:text-[#8b93a7]">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} />
                            {ticket.created_at}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===================== THREAD VIEW ===================== */}
          {view === "thread" && (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={24}
                    className="animate-spin text-green-600 dark:text-green-400"
                  />
                </div>
              ) : (
                <>
                  <div className="mb-5 max-h-[350px] overflow-y-auto pr-1">
                    {messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-zinc-500 dark:text-[#8b93a7]">
                        No messages in this ticket yet.
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isAdmin = msg.is_admin_reply === 1;
                        return (
                          <div
                            key={msg.id}
                            className="mb-4 flex items-start gap-3"
                          >
                            <div
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                isAdmin
                                  ? "bg-green-600 text-white"
                                  : "bg-green-500/10 text-green-600 dark:text-green-400"
                              }`}
                            >
                              {isAdmin
                                ? "S"
                                : (user?.fullname || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div
                              className={`min-w-0 flex-1 rounded-lg border bg-zinc-50 p-3 dark:bg-[#1a2035] ${
                                isAdmin
                                  ? "border-green-500/30 border-l-[3px] border-l-green-500"
                                  : "border-zinc-200 dark:border-[#232a3b]"
                              }`}
                            >
                              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                  {isAdmin
                                    ? "Support Team"
                                    : user?.fullname || "User"}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                                  {msg.created_at}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply form */}
                  <form
                    onSubmit={handleReply}
                    className="border-t border-zinc-200 pt-4 dark:border-[#232a3b]"
                  >
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                      <Send
                        size={14}
                        className="text-green-600 dark:text-green-400"
                      />
                      Reply as Support
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      disabled={isSending}
                      className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                      required
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSending || !reply.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                      >
                        {isSending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}

          {/* ===================== CREATE VIEW ===================== */}
          {view === "create" && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-green-500/15 bg-green-500/10 p-3 dark:border-green-500/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-sm font-semibold text-white">
                  {(user?.fullname || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {user?.fullname}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-[#8b93a7]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Ticket subject"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  disabled={isCreating}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
                  Message
                </label>
                <textarea
                  rows="6"
                  placeholder="Message body..."
                  value={createForm.message}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, message: e.target.value }))
                  }
                  disabled={isCreating}
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              </div>

              <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="mr-2 inline animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-1 inline" />
                      Create Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer (list/thread only) */}
        {view !== "create" && (
          <div className="flex justify-end border-t border-zinc-200 px-6 py-3 dark:border-[#232a3b]">
            <button
              onClick={handleClose}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
