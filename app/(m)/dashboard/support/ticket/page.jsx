"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleHelp,
  Plus,
  MessageSquare,
  Calendar,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./support.module.css";
import { api } from "@/lib/axios";
import LoadingDiamond from "@/components/LoadingEffect";

export default function SupportPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/user/support-tickets.php");
      const res = response.data;

      if (res.success && Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        throw new Error(res.message || "Failed to load tickets");
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tickets",
      );
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return <LoadingDiamond />;
  }

  return (
    <div className={styles["page-container"]}>
      {/* Page Header */}
      <div className={styles["page-header"]}>
        <div className={styles["header-left"]}>
          <div className={styles["header-icon"]}>
            <CircleHelp size={22} />
          </div>
          <div>
            <h1 className={styles["page-title"]}>Support Tickets</h1>
            <p className={styles["page-subtitle"]}>
              View and manage your support requests
            </p>
          </div>
        </div>

        <Link href="/dashboard/support/" className={styles["btn-new"]}>
          <Plus size={16} />
          New
        </Link>
      </div>

      {/* Main Card */}
      <div className={styles.panel}>
        {error ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <CircleHelp size={36} />
            </div>
            <h3>Could not load tickets</h3>
            <p>{error}</p>
            <button className={styles["btn-primary"]} onClick={fetchTickets}>
              Try Again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <CircleHelp size={36} />
            </div>
            <h3>No Tickets Found</h3>
            <p>You haven&apos;t created any support tickets yet.</p>
            <Link
              href="/dashboard/support/new"
              className={styles["btn-primary"]}
            >
              <Plus size={16} />
              Create New Ticket
            </Link>
          </div>
        ) : (
          <div className={styles["ticket-list"]}>
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/ticket/${ticket.id}`}
                className={styles["ticket-item"]}
              >
                <div className={styles["ticket-icon"]}>
                  <MessageSquare size={16} />
                </div>

                <div className={styles["ticket-body"]}>
                  <div className={styles["ticket-top"]}>
                    <span className={styles["ticket-subject"]}>
                      {ticket.subject}
                    </span>
                    {ticket.is_read === 1 && (
                      <span className={styles["badge-unread"]}>
                        <span className={styles["badge-dot"]} />
                        Unread
                      </span>
                    )}
                  </div>
                  <div className={styles["ticket-meta"]}>
                    <span>
                      <Calendar size={12} />
                      {ticket.created_at}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className={styles["ticket-arrow"]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
