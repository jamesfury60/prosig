"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  X,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SendEmailModal({
  show = false,
  user = null,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [form, setForm] = useState({
    subject: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // Email templates with rich text
  const emailTemplates = {
    welcome: {
      subject: "Welcome to Our Platform!",
      message: `<h2>Welcome to Our Platform!</h2>
<p>Dear <strong>${user?.fullname || "Valued Customer"}</strong>,</p>
<p>Welcome to our platform! We're thrilled to have you on board.</p>
<p>At our platform, you'll find:</p>
<ul>
<li><strong>Secure</strong> and reliable trading environment</li>
<li><strong>Competitive rates</strong> and low fees</li>
<li><strong>24/7 customer support</strong></li>
<li><strong>Advanced trading tools</strong></li>
</ul>
<p>Your account has been successfully created and is ready for use. You can now:</p>
<ol>
<li>Deposit funds to start trading</li>
<li>Explore our various trading options</li>
<li>Set up your trading preferences</li>
</ol>
<p><em>If you have any questions or need assistance, our support team is always here to help.</em></p>
<p>Best regards,<br><strong>The Platform Team</strong></p>`,
    },
    account_update: {
      subject: "Important Account Update",
      message: `<h2>Important Account Update</h2>
<p>Dear <strong>${user?.fullname || "Valued Customer"}</strong>,</p>
<p>This is an important update regarding your account.</p>
<p>We're continuously working to improve our services and enhance your trading experience. Please take a moment to review the following updates:</p>
<ul>
<li><strong>Enhanced security features</strong> - New two-factor authentication</li>
<li><strong>New trading instruments</strong> - Added 20+ new cryptocurrencies</li>
<li><strong>Updated fee structure</strong> - Reduced fees for active traders</li>
<li><strong>Improved user interface</strong> - More intuitive and responsive design</li>
</ul>
<p>These changes are designed to provide you with a <strong>better trading experience</strong> and <strong>enhanced security</strong> for your funds.</p>
<p><em>If you have any questions about these updates, please don't hesitate to contact our support team.</em></p>
<p>Thank you for being a valued member of our platform.</p>
<p>Sincerely,<br><strong>The Platform Team</strong></p>`,
    },
    promotion: {
      subject: "Special Promotion Just For You!",
      message: `<h2>🎉 Special Promotion Just For You!</h2>
<p>Dear <strong>${user?.fullname || "Valued Customer"}</strong>,</p>
<p>We have an <strong>exclusive promotion</strong> available for you!</p>
<p>As a valued member of our platform, we're offering you a special opportunity:</p>
<h3>🎁 SPECIAL OFFER:</h3>
<ul>
<li><strong>Increased returns</strong> on selected trades</li>
<li><strong>Reduced trading fees</strong> for the next 7 days</li>
<li><strong>Bonus</strong> on your next deposit</li>
<li><strong>Priority customer support</strong></li>
</ul>
<p><em>This promotion is available for a limited time only. Don't miss this chance to maximize your trading potential!</em></p>
<p>To take advantage of this offer, simply continue with your regular trading activities or make a deposit to qualify for the bonus.</p>
<p>Happy trading!</p>
<p>Best regards,<br><strong>The Platform Team</strong></p>`,
    },
    support: {
      subject: "Following Up on Your Account",
      message: `<h2>Following Up on Your Account</h2>
<p>Dear <strong>${user?.fullname || "Valued Customer"}</strong>,</p>
<p>We hope this message finds you well.</p>
<p>We're reaching out to ensure you're having a <strong>great experience</strong> with our platform. Our records show you've been an active member, and we want to make sure everything is meeting your expectations.</p>
<p><strong>Is there anything we can help you with?</strong></p>
<ul>
<li>Account-related questions</li>
<li>Trading assistance</li>
<li>Technical support</li>
<li>Feature explanations</li>
</ul>
<p>Our support team is available <strong>24/7</strong> to assist you with any questions or concerns you may have. Don't hesitate to reach out to us.</p>
<p><em>Thank you for choosing our platform for your trading needs.</em></p>
<p>Warm regards,<br><strong>Customer Support Team</strong></p>`,
    },
  };

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setForm({
        subject: "",
        message: "",
      });
      setMessage({ type: "", text: "" });
      setShowPreview(false);
    }
  }, [show]);

  // Apply template
  function applyTemplate(templateKey) {
    const template = emailTemplates[templateKey];
    if (template) {
      setForm({
        subject: template.subject,
        message: template.message,
      });
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Text formatting functions
  function formatText(command) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.message.substring(start, end);

    if (!selectedText && command !== "insertHTML") {
      // Insert a sample if nothing selected
      const sampleTexts = {
        bold: "**bold text**",
        italic: "*italic text*",
        underline: "__underlined text__",
        heading: "## Heading",
        link: "[link text](url)",
        list: "- Item 1\n- Item 2",
        listOrdered: "1. Item 1\n2. Item 2",
        quote: "> quoted text",
        code: "`code here`",
      };
      const textToInsert = sampleTexts[command] || "";
      if (textToInsert) {
        const newText =
          form.message.substring(0, start) +
          textToInsert +
          form.message.substring(end);
        setForm({ ...form, message: newText });
        const newCursorPos = start + textToInsert.length;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
      return;
    }

    if (!selectedText) return;

    let wrappedText = selectedText;
    const wrappers = {
      bold: { prefix: "**", suffix: "**" },
      italic: { prefix: "*", suffix: "*" },
      underline: { prefix: "__", suffix: "__" },
      heading: { prefix: "## ", suffix: "" },
      code: { prefix: "`", suffix: "`" },
    };

    const wrapper = wrappers[command];
    if (wrapper) {
      wrappedText = wrapper.prefix + selectedText + wrapper.suffix;
    }

    const newText =
      form.message.substring(0, start) +
      wrappedText +
      form.message.substring(end);
    setForm({ ...form, message: newText });

    const newCursorPos = start + wrappedText.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function insertLink() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const url = prompt("Enter URL:", "https://");
    if (!url) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.message.substring(start, end) || "link text";

    const linkText = `[${selectedText}](${url})`;
    const newText =
      form.message.substring(0, start) + linkText + form.message.substring(end);
    setForm({ ...form, message: newText });

    const newCursorPos = start + linkText.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function insertImage() {
    const url = prompt("Enter image URL:", "https://");
    if (!url) return;

    const imageText = `![image](${url})`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        form.message.substring(0, start) +
        imageText +
        form.message.substring(end);
      setForm({ ...form, message: newText });
      const newCursorPos = start + imageText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  function alignText(alignment) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.message.substring(start, end);

    if (!selectedText) return;

    const alignedText = `<p style="text-align: ${alignment}">${selectedText}</p>`;

    const newText =
      form.message.substring(0, start) +
      alignedText +
      form.message.substring(end);
    setForm({ ...form, message: newText });

    const newCursorPos = start + alignedText.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function togglePreview() {
    setShowPreview(!showPreview);
  }

  function stripHtml(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  // Send email
  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();

    if (!form.subject) {
      toast.error("Please enter a subject");
      return;
    }

    if (!form.message) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/send-email.php", {
        userid: user?.id,
        email: user?.email,
        username: user?.fullname,
        subject: form.subject,
        message: form.message,
      });

      const res = response.data;

      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "Email sent successfully!",
        });
        toast.success(res.message || "Email sent successfully!");
        if (onSuccess) onSuccess();

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to send email",
        });
        toast.error(res.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Send email error:", error);
      const errorMsg = error.response?.data?.message || "Failed to send email";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  }

  function handleClose() {
    if (onClose) onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="flex w-full max-w-3xl max-h-[90vh] flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-[#232a3b] dark:bg-[#12161f] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-[#232a3b]">
          <h3
            id="modal-title"
            className="flex items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-white"
          >
            <Mail size={20} className="text-green-600 dark:text-green-400" />
            Send Email - {user?.fullname || "User"}
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
          {/* Recipient Info */}
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-500/15 bg-green-500/10 p-3 dark:border-green-500/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-600 text-sm font-semibold text-white">
              {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {user?.fullname}
              </p>
              <p className="text-xs text-zinc-500 dark:text-[#8b93a7]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label
              htmlFor="subject"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Enter email subject"
              value={form.subject}
              onChange={handleChange}
              disabled={isSending}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-white dark:placeholder:text-[#8b93a7]"
              required
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-0.5 rounded-t-lg border border-zinc-200 border-b-0 bg-zinc-50 p-1 dark:border-[#232a3b] dark:bg-[#1a2035]">
            <button
              type="button"
              onClick={() => formatText("bold")}
              title="Bold"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("italic")}
              title="Italic"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("underline")}
              title="Underline"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("heading")}
              title="Heading"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Heading size={16} />
            </button>
            <div className="mx-0.5 w-px bg-zinc-300 dark:bg-[#232a3b]" />
            <button
              type="button"
              onClick={() => formatText("list")}
              title="Bullet List"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("listOrdered")}
              title="Numbered List"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("quote")}
              title="Quote"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={() => formatText("code")}
              title="Code"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Code size={16} />
            </button>
            <div className="mx-0.5 w-px bg-zinc-300 dark:bg-[#232a3b]" />
            <button
              type="button"
              onClick={insertLink}
              title="Insert Link"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Link size={16} />
            </button>
            <button
              type="button"
              onClick={insertImage}
              title="Insert Image"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <Image size={16} />
            </button>
            <div className="mx-0.5 w-px bg-zinc-300 dark:bg-[#232a3b]" />
            <button
              type="button"
              onClick={() => alignText("left")}
              title="Align Left"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignText("center")}
              title="Align Center"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignText("right")}
              title="Align Right"
              disabled={isSending}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-40 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
            >
              <AlignRight size={16} />
            </button>
            <div className="mx-0.5 w-px bg-zinc-300 dark:bg-[#232a3b]" />
            <button
              type="button"
              onClick={togglePreview}
              title="Toggle Preview"
              disabled={isSending}
              className={`rounded p-1.5 transition-colors disabled:opacity-40 ${
                showPreview
                  ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-[#8b93a7] dark:hover:bg-[#232a3b] dark:hover:text-white"
              }`}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Message Editor / Preview */}
          <div className="mb-4">
            <label
              htmlFor="message-editor"
              className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]"
            >
              Message
            </label>
            <div className="overflow-hidden rounded-b-lg border border-zinc-200 bg-zinc-50 dark:border-[#232a3b] dark:bg-[#1a2035]">
              {showPreview ? (
                <div className="max-h-60 min-h-[150px] overflow-y-auto p-3">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: form.message }}
                  />
                </div>
              ) : (
                <textarea
                  id="message-editor"
                  ref={textareaRef}
                  name="message"
                  rows="10"
                  placeholder="Compose your message here... Use the toolbar for formatting."
                  value={form.message}
                  onChange={handleChange}
                  disabled={isSending}
                  className="w-full min-h-[150px] resize-y border-0 bg-transparent p-3 font-mono text-sm text-zinc-900 outline-none dark:text-white dark:placeholder:text-[#8b93a7]"
                  required
                />
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b93a7]">
              Tip: Select text and use the toolbar buttons to format. Supports
              Markdown-style formatting.
            </p>
          </div>

          {/* Quick Templates */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-[#8b93a7]">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => applyTemplate("welcome")}
                disabled={isSending}
                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-400"
              >
                Welcome
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("account_update")}
                disabled={isSending}
                className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-500/20 disabled:opacity-60 dark:text-green-400"
              >
                Account Update
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("promotion")}
                disabled={isSending}
                className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-500/20 disabled:opacity-60 dark:text-green-400"
              >
                Promotion
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("support")}
                disabled={isSending}
                className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-60 dark:text-amber-400"
              >
                Support
              </button>
            </div>
          </div>

          {/* Character Count */}
          <div
            className={`mb-4 text-right text-xs ${
              stripHtml(form.message).length > 5000
                ? "text-red-500"
                : "text-zinc-500 dark:text-[#8b93a7]"
            }`}
          >
            {stripHtml(form.message).length}/5000 characters (HTML tags
            excluded)
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-[#232a3b]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSending}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:bg-[#232a3b]"
            >
              {message.type === "success" ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:scale-[1.02] disabled:opacity-60"
            >
              {isSending ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2 inline" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
