"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "./support.module.css";
import { api } from "@/lib/axios";
import { useMe } from "@/lib/auth";
import LoadingDiamond from "@/components/LoadingEffect";

export default function NewSupportPage() {
  const router = useRouter();
  const { data: meResponse } = useMe();
  const userData = meResponse?.user ?? null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);

  // Set user data when available
  useEffect(() => {
    if (userData) {
      setForm((prev) => ({
        ...prev,
        name: userData.fullname || "",
        email: userData.email || "",
      }));

      setLoading(false);
    }
  }, [userData]);

  // Fetch unread ticket count
  useEffect(() => {
    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const response = await api.get("/user/support-tickets.php");
        const res = response.data;

        if (res.success && Array.isArray(res.data)) {
          // "Unread" matches the list page logic: is_read === 1
          const count = res.data.filter((t) => t.is_read === 1).length;
          if (!cancelled) setUnreadCount(count);
        }
      } catch {
        // Silent — badge just stays at 0
      }
    }

    fetchUnreadCount();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await api.post("/user/support.php", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      const res = response.data;

      if (res.success) {
        setSubmitSuccess(true);
        toast.success(res.message || "Support request submitted successfully!");

        setForm((prev) => ({
          ...prev,
          message: "",
        }));

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        throw new Error(res.message || "Failed to submit support request");
      }
    } catch (err) {
      console.error("Support submission error:", err);
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit support request",
      );
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit support request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingDiamond />;
  }

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/dashboard/support" className={styles.backLink}>
          <ArrowLeft size={14} />
          Back to Support
        </Link>

        <Link
          href="/dashboard/support/ticket"
          className={styles.viewTicketsLink}
        >
          <Ticket size={14} />
          View My Tickets ({unreadCount})
        </Link>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Support Center</h1>
          <p className={styles.subtitle}>
            We&rsquo;re here to help you with any questions or concerns
          </p>
        </div>
      </div>

      {/* Support Info Cards */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <Mail size={22} />
          </div>
          <h3 className={styles.infoTitle}>Email Support</h3>
          <p className={styles.infoDesc}>Get help via email</p>
          <p className={styles.infoDetail}>
            Direct email communication for detailed inquiries and support
            requests.
          </p>
          <a
            href="mailto:support@prosignalbase.com"
            className={styles.infoEmail}
          >
            support@prosignalbase.com
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Send us a Message</h2>
          <p className={styles.formSubtitle}>
            Have a specific question or need assistance? Fill out the form below
            and our support team will get back to you as soon as possible.
          </p>
        </div>

        {submitSuccess && (
          <div className={styles.successMessage}>
            <CheckCircle size={20} className={styles.successIcon} />
            <div>
              <p className={styles.successTitle}>
                Support request submitted successfully!
              </p>
              <p className={styles.successDesc}>
                We typically respond within 24 hours during business days.
              </p>
              <Link href="/dashboard/support" className={styles.successLink}>
                View your tickets →
              </Link>
            </div>
          </div>
        )}

        {submitError && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} className={styles.errorIcon} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formFields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                Your Name <span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.input}
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Your Email <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">
                Message <span className={styles.required}>*</span>
              </label>
              <textarea
                id="message"
                name="message"
                className={styles.textarea}
                placeholder="Please describe your issue or question in detail..."
                rows="6"
                value={form.message}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              <p className={styles.fieldHint}>
                Please provide as much detail as possible to help us assist you
                better.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !form.message.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>

          <p className={styles.responseTime}>
            We typically respond within 24 hours during business days.
          </p>
        </form>
      </div>
    </div>
  );
}
