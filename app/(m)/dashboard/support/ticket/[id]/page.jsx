"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, CircleCheck, Send } from "lucide-react";
import toast from "react-hot-toast";

import styles from "./ticket.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

export default function TicketThreadPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;

  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const messageContainerRef = useRef(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/user/support-ticket.php?id=${ticketId}`);
      const res = response.data;

      if (res.success && res.data) {
        setTicket(res.data.ticket);
        setMessages(res.data.messages || []);
      } else {
        throw new Error(res.message || "Failed to load ticket");
      }
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load ticket",
      );
      toast.error("Failed to load ticket");
      setTimeout(() => router.push("/dashboard/support"), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setSubmitError("");

    if (!reply.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/user/support-ticket.php", {
        ticket_id: parseInt(ticketId),
        message: reply.trim(),
      });

      const res = response.data;

      if (res.success) {
        toast.success(res.message || "Reply sent");
        setReply("");
        await fetchTicket();
      } else {
        throw new Error(res.message || "Failed to send reply");
      }
    } catch (err) {
      console.error("Reply error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to send reply";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingDiamond />;
  }

  if (error || !ticket) {
    return (
      <div className={styles["page-container"]}>
        <div className={styles["error-state"]}>
          <div className={styles["error-icon"]}>⚠️</div>
          <h2>Error Loading Ticket</h2>
          <p>{error || "Ticket not found"}</p>
          <Link href="/dashboard/support" className={styles["btn-secondary"]}>
            <ArrowLeft size={16} />
            Back to Support
          </Link>
        </div>
      </div>
    );
  }

  const userInitial = (userData?.username || userData?.fullname || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className={styles["page-container"]}>
      <Link href="/dashboard/support" className={styles["back-link"]}>
        <ArrowLeft size={14} />
        Back to Support
      </Link>

      <div className={styles.panel}>
        {/* Header */}
        <div className={styles["ticket-header"]}>
          <div className={styles["header-icon"]}>
            <MessageSquare size={16} />
          </div>
          <div className={styles["header-meta"]}>
            <h2>Ticket</h2>
            <p>Title — {ticket.subject}</p>
          </div>
          <span className={styles["status-badge"]}>
            <CircleCheck size={12} />
            {ticket.status === "closed" ? "Closed" : "Open"}
          </span>
        </div>

        {/* Messages */}
        <div className={styles["messages"]} ref={messageContainerRef}>
          {messages.length === 0 ? (
            <div className={styles["empty-messages"]}>
              <MessageSquare size={32} />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.is_admin_reply === 1;
              return (
                <div key={msg.id} className={styles["message-row"]}>
                  <div
                    className={
                      isAdmin ? styles["avatar-admin"] : styles["avatar-user"]
                    }
                  >
                    {isAdmin ? "S" : userInitial}
                  </div>
                  <div
                    className={
                      isAdmin
                        ? styles["message-box-admin"]
                        : styles["message-box"]
                    }
                  >
                    <div className={styles["message-meta"]}>
                      <span className={styles["message-author"]}>
                        {isAdmin
                          ? "Support Team"
                          : `@${userData?.username || "you"}`}
                      </span>
                      <span className={styles["message-time"]}>
                        {msg.created_at}
                      </span>
                    </div>
                    <p className={styles["message-text"]}>{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className={styles["reply-form"]}>
          <label className={styles["reply-label"]}>
            <Send size={14} className={styles["reply-label-icon"]} />
            Your Reply
          </label>
          <textarea
            className={styles["reply-textarea"]}
            rows={4}
            placeholder="Type your reply here..."
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              if (submitError) setSubmitError("");
            }}
            disabled={submitting}
            required
          />
          <div className={styles["reply-footer"]}>
            <span className={styles["char-count"]}>
              {reply.length} characters
            </span>
          </div>

          {submitError && (
            <div className={styles["error-message"]}>{submitError}</div>
          )}

          <div className={styles["reply-actions"]}>
            <button
              type="submit"
              className={styles["btn-primary"]}
              disabled={submitting || !reply.trim()}
            >
              <Send size={16} />
              {submitting ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
