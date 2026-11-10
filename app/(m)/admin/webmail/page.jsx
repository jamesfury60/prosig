"use client";

import { Mail, Lock, User, ExternalLink, Shield, Key } from "lucide-react";
import { toast } from "react-hot-toast";

export default function WebmailPage() {
  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.dismiss();
      toast.success(`${label} copied to clipboard!`);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.dismiss();
      toast.success(`${label} copied to clipboard!`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white lg:text-4xl">
          Webmail Details
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b93a7]">
          Access your webmail and email account credentials
        </p>
      </div>

      {/* Webmail Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        {/* Login Section */}
        <div className="border-b border-zinc-200 bg-zinc-50 p-6 text-center dark:border-[#232a3b] dark:bg-[#1a2035]">
          <a
            href="https://mail.hostinger.com/v2/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-600 to-green-600 px-6 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Mail size={20} />
            Login to Webmail
            <ExternalLink size={16} />
          </a>
          <p className="mt-2 text-xs text-zinc-500 dark:text-[#8b93a7]">
            Click to access your webmail portal
          </p>
        </div>

        {/* Credentials Section */}
        <div className="p-6">
          <h2 className="mb-4 border-b border-zinc-200 pb-3 text-base font-semibold text-zinc-900 dark:border-[#232a3b] dark:text-white">
            Email Credentials
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Email 1 */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-green-500 dark:border-[#232a3b] dark:bg-[#1a2035]">
              <div className="mb-2 flex items-center gap-2">
                <User
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                  Email Address 1
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-medium text-zinc-900 dark:text-white">
                <Mail size={14} className="text-zinc-400" />
                <span>info@Prosignalbase.com</span>
                <button
                  onClick={() =>
                    copyToClipboard("info@Prosignalbase.com", "Email")
                  }
                  className="ml-auto rounded p-1 text-sm opacity-60 transition hover:bg-zinc-200 hover:opacity-100 dark:hover:bg-zinc-800"
                  title="Copy email"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Email 2 */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-green-500 dark:border-[#232a3b] dark:bg-[#1a2035]">
              <div className="mb-2 flex items-center gap-2">
                <User
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                  Email Address 2
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-medium text-zinc-900 dark:text-white">
                <Mail size={14} className="text-zinc-400" />
                <span>support@Prosignalbase.com</span>
                <button
                  onClick={() =>
                    copyToClipboard("support@Prosignalbase.com", "Email")
                  }
                  className="ml-auto rounded p-1 text-sm opacity-60 transition hover:bg-zinc-200 hover:opacity-100 dark:hover:bg-zinc-800"
                  title="Copy email"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="col-span-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-green-500 dark:border-[#232a3b] dark:bg-[#1a2035] md:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <Lock
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#8b93a7]">
                  Password
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-medium">
                <Key size={14} className="text-zinc-400" />
                <span className="tracking-wide text-amber-500 dark:text-amber-400">
                  FBDB5QM2XxQ@8
                </span>
                <button
                  onClick={() => copyToClipboard("FBDB5QM2XxQ@8", "Password")}
                  className="ml-auto rounded p-1 text-sm opacity-60 transition hover:bg-zinc-200 hover:opacity-100 dark:hover:bg-zinc-800"
                  title="Copy password"
                >
                  📋
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-[#8b93a7]">
                Use this password for both email accounts
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 border-t border-zinc-200 bg-red-50/50 px-6 py-3 text-sm text-red-600 dark:border-[#232a3b] dark:bg-red-950/20 dark:text-red-400">
          <Shield size={18} className="flex-shrink-0" />
          <span>
            Keep these credentials secure. Never share them with unauthorized
            users.
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#232a3b] dark:bg-[#12161f]">
        <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://mail.hostinger.com/v2/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-green-500 hover:bg-white dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:border-green-400 dark:hover:bg-[#12161f]"
          >
            <Mail size={16} />
            Webmail Login
            <ExternalLink size={14} className="opacity-50" />
          </a>
          <a
            href="https://www.hostinger.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-green-500 hover:bg-white dark:border-[#232a3b] dark:bg-[#1a2035] dark:text-zinc-300 dark:hover:border-green-400 dark:hover:bg-[#12161f]"
          >
            <Shield size={16} />
            Hostinger Dashboard
            <ExternalLink size={14} className="opacity-50" />
          </a>
        </div>
      </div>
    </div>
  );
}
