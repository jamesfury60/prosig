"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  User,
  FileText,
  ClipboardCheck,
  UploadCloud,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Lock,
  CreditCard,
  IdCard,
  BadgeCheck,
} from "lucide-react";
import styles from "./KYC.module.css";
import { useMe } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

const STEPS = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
  },
  {
    id: "document",
    label: "Identity Document",
    icon: FileText,
  },
  {
    id: "review",
    label: "Review & Submit",
    icon: ClipboardCheck,
  },
];

const DOC_TYPES = [
  {
    id: "passport",
    label: "Passport",
    icon: BadgeCheck,
  },
  {
    id: "national_id",
    label: "National ID",
    icon: IdCard,
  },
  {
    id: "drivers_license",
    label: "Driver's License",
    icon: CreditCard,
  },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function KYCPage() {
  const router = useRouter();

  const user = useMe();
  const userData = user.data?.user;

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState("not-started");

  const [errors, setErrors] = useState({});

  const [docType, setDocType] = useState("passport");

  const [docFront, setDocFront] = useState(null);
  const [docBack, setDocBack] = useState(null);

  const [consent, setConsent] = useState(false);

  const currentStep = STEPS[stepIndex];

  const isLastStep = stepIndex === STEPS.length - 1;

  const progressPct = useMemo(() => {
    return Math.round(((stepIndex + 1) / STEPS.length) * 100);
  }, [stepIndex]);

  /*
   * ==========================================================
   * PROFILE DATA
   * ==========================================================
   *
   * KYC uses the information already stored in the user's
   * profile. These fields are NOT editable from the KYC page.
   */

  const profile = {
    fullName: userData?.fullname || "",
    country: userData?.country || "",
    phone: userData?.phone || "",
    dob: userData?.dob || "",
    address: userData?.address || "",
  };

  /*
   * ==========================================================
   * PROFILE VALIDATION
   * ==========================================================
   */

  function getMissingProfileFields() {
    const missing = [];

    if (!String(profile.fullName).trim()) {
      missing.push("Full Name");
    }

    if (!String(profile.country).trim()) {
      missing.push("Country");
    }

    if (!String(profile.phone).trim()) {
      missing.push("Phone Number");
    }

    if (!profile.dob) {
      missing.push("Date of Birth");
    }

    if (!String(profile.address).trim()) {
      missing.push("Residential Address");
    }

    return missing;
  }

  function profileIsComplete() {
    return getMissingProfileFields().length === 0;
  }

  /*
   * ==========================================================
   * FILE VALIDATION
   * ==========================================================
   */

  function handleFileChange(event, setter, field) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only JPG, PNG or PDF files are allowed.",
      }));

      event.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [field]: "File must be less than 4MB.",
      }));

      event.target.value = "";
      return;
    }

    setter(file);

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  /*
   * ==========================================================
   * STEP VALIDATION
   * ==========================================================
   */

  function validateStep() {
    const newErrors = {};

    /*
     * STEP 1
     *
     * User must have a complete profile before continuing.
     */
    if (currentStep.id === "personal") {
      const missingFields = getMissingProfileFields();

      if (missingFields.length > 0) {
        toast.error(
          `Please update your profile first: ${missingFields.join(", ")}`,
        );

        router.push("/dashboard/profile");

        return false;
      }
    }

    /*
     * STEP 2
     *
     * PHP requires BOTH files.
     */
    if (currentStep.id === "document") {
      if (!docFront) {
        newErrors.docFront = "Upload the front of your document.";
      }

      if (!docBack) {
        newErrors.docBack = "Upload the back of your document.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /*
   * ==========================================================
   * NEXT
   * ==========================================================
   */

  function goNext() {
    if (!validateStep()) {
      return;
    }

    if (isLastStep) {
      return;
    }

    setStepIndex((current) => current + 1);
  }

  /*
   * ==========================================================
   * BACK
   * ==========================================================
   */

  function goBack() {
    if (submitting) {
      return;
    }

    setStepIndex((current) => Math.max(0, current - 1));
  }

  /*
   * ==========================================================
   * STEP NAVIGATION
   * ==========================================================
   */

  function goToStep(index) {
    if (submitting) {
      return;
    }

    /*
     * Don't allow jumping forward.
     *
     * User must complete each step sequentially.
     */
    if (index <= stepIndex) {
      setStepIndex(index);
    }
  }

  /*
   * ==========================================================
   * SUBMIT KYC
   * ==========================================================
   *
   * PHP expects:
   *
   * certificate_type
   * front_file
   * back_file
   *
   * User ID comes from:
   *
   * $_SESSION['userid']
   */

  async function handleSubmit() {
    /*
     * Consent
     */
    if (!consent) {
      toast.error("Please confirm the consent checkbox to submit.");

      return;
    }

    /*
     * Profile
     */
    const missingFields = getMissingProfileFields();

    if (missingFields.length > 0) {
      toast.error(
        `Please update your profile first: ${missingFields.join(", ")}`,
      );

      router.push("/dashboard/profile");

      return;
    }

    /*
     * Front document
     */
    if (!docFront) {
      toast.error("Please upload the front of your document.");

      setStepIndex(1);

      return;
    }

    /*
     * Back document
     */
    if (!docBack) {
      toast.error("Please upload the back of your document.");

      setStepIndex(1);

      return;
    }

    setSubmitting(true);

    toast.dismiss();

    try {
      /*
       * Create multipart form data.
       */
      const formData = new FormData();

      /*
       * IMPORTANT:
       *
       * These names MUST match the PHP API.
       */

      formData.append("certificate_type", docType);

      formData.append("front_file", docFront);

      formData.append("back_file", docBack);

      /*
       * Send request using Axios.
       *
       * ---------------------------------------------------
       * FIX (this is the change from the previous version):
       * ---------------------------------------------------
       * Do NOT let a fixed Content-Type reach this request.
       *
       * If `api` (lib/axios.js) has a default header like
       * "Content-Type: application/json" configured on the
       * shared instance, that default silently overrides the
       * multipart boundary axios would otherwise auto-generate
       * for FormData bodies. Without that boundary, PHP cannot
       * parse the request body into $_FILES at all — which
       * produces exactly the "Both front and back documents are
       * required" error even though both files were correctly
       * attached client-side.
       *
       * Explicitly setting it to `undefined` here removes any
       * inherited default for this one request, so the browser
       * generates the correct
       * "multipart/form-data; boundary=..." header itself.
       */

      const response = await api.post("/user/kyc_update.php", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": undefined,
        },
      });

      const data = response?.data;

      /*
       * Handle API failure.
       */
      if (!data?.success) {
        throw new Error(data?.message || "KYC submission failed.");
      }

      /*
       * Submission successful.
       */
      setStatus("pending");

      toast.success(data.message || "KYC documents submitted successfully.");

      /*
       * Stay on Review page.
       */
      setStepIndex(STEPS.length - 1);
    } catch (error) {
      console.error("KYC submission error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while submitting your KYC.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================================
   * STATUS
   * ==========================================================
   */

  const statusMeta = {
    "not-started": {
      label: "Not Started",
      desc: "Complete the steps to the left to verify your identity.",
    },

    pending: {
      label: "In Review",
      desc: "Your documents are being reviewed. This usually takes 1–2 business days.",
    },

    verified: {
      label: "Verified",
      desc: "Your identity has been verified. You now have full account access.",
    },

    rejected: {
      label: "Rejected",
      desc: "We couldn't verify your documents. Please resubmit with clearer copies.",
    },
  }[status];

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className={styles["page-container"]}>
      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className={styles["page-header"]}>
        <div className={styles["header-icon"]}>
          <ShieldCheck size={22} />
        </div>

        <div>
          <h1 className={styles["page-title"]}>Identity Verification</h1>

          <p className={styles["page-subtitle"]}>
            Verify your identity to unlock higher limits and full account
            access.
          </p>
        </div>
      </div>

      {/* ====================================================
          STEPPER
      ===================================================== */}

      <div className={styles.stepper}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;

          const isActive = i === stepIndex;

          const isComplete = i < stepIndex || status === "verified";

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={cx(
                  styles.step,
                  isActive && styles.active,
                  isComplete && styles.complete,
                  i <= stepIndex && styles.clickable,
                )}
                onClick={() => goToStep(i)}
                disabled={submitting}
              >
                <span className={styles["step-dot"]}>
                  {isComplete ? <Check size={13} /> : <Icon size={13} />}
                </span>

                <span className={styles["step-label"]}>{step.label}</span>
              </button>

              {i < STEPS.length - 1 && (
                <span
                  className={cx(
                    styles["step-connector"],
                    i < stepIndex && styles.complete,
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ====================================================
          CONTENT GRID
      ===================================================== */}

      <div className={styles["content-grid"]}>
        {/* ==================================================
            MAIN PANEL
        =================================================== */}

        <div className={styles.panel}>
          {/* PANEL HEADER */}

          <div className={styles["panel-header"]}>
            <div className={styles["title-with-icon"]}>
              <currentStep.icon size={18} className="accent-icon" />

              <div>
                <h2>{currentStep.label}</h2>

                <p className={styles["step-hint"]}>
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              STEP 1 - PERSONAL INFO
          ================================================== */}

          {currentStep.id === "personal" && (
            <div className={styles.form}>
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  marginBottom: "1rem",
                }}
              >
                <strong>Profile Information</strong>

                <p
                  style={{
                    margin: "0.4rem 0 0",
                    fontSize: "0.875rem",
                    opacity: 0.75,
                  }}
                >
                  Your KYC information is taken directly from your profile. Make
                  sure your information is complete and matches your identity
                  document.
                </p>
              </div>

              {/* INCOMPLETE PROFILE */}

              {!profileIsComplete() ? (
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "10px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 0.5rem",
                      color: "#ef4444",
                    }}
                  >
                    Complete your profile first
                  </h3>

                  <p
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Please update the following information in your profile
                    before continuing with KYC:
                  </p>

                  <ul
                    style={{
                      margin: "0 0 1rem",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    {!String(profile.fullName).trim() && <li>Full Name</li>}

                    {!String(profile.country).trim() && <li>Country</li>}

                    {!String(profile.phone).trim() && <li>Phone Number</li>}

                    {!profile.dob && <li>Date of Birth</li>}

                    {!String(profile.address).trim() && (
                      <li>Residential Address</li>
                    )}
                  </ul>

                  <button
                    type="button"
                    className={styles["btn-primary"]}
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    Update Profile
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {/* FULL NAME */}

                  <div className={styles.field}>
                    <label className={styles["field-label"]}>
                      Full Legal Name
                    </label>

                    <input
                      className={styles["field-input"]}
                      value={profile.fullName}
                      readOnly
                    />
                  </div>

                  {/* DOB + COUNTRY */}

                  <div className={cx(styles["field-row"], styles["two-col"])}>
                    <div className={styles.field}>
                      <label className={styles["field-label"]}>
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        className={styles["field-input"]}
                        value={profile.dob}
                        readOnly
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles["field-label"]}>Country</label>

                      <input
                        className={styles["field-input"]}
                        value={profile.country}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div className={styles.field}>
                    <label className={styles["field-label"]}>
                      Residential Address
                    </label>

                    <textarea
                      className={styles["field-textarea"]}
                      value={profile.address}
                      readOnly
                    />
                  </div>

                  {/* PHONE */}

                  <div className={styles.field}>
                    <label className={styles["field-label"]}>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      className={styles["field-input"]}
                      value={profile.phone}
                      readOnly
                    />
                  </div>

                  {/* PROFILE COMPLETE */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.9rem 1rem",
                      borderRadius: "8px",
                      background: "rgba(34, 197, 94, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      color: "#16a34a",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Check size={16} />

                    <span>
                      Your profile information is complete. Make sure it matches
                      your identity document before continuing.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =================================================
              STEP 2 - DOCUMENT
          ================================================== */}

          {currentStep.id === "document" && (
            <div className={styles.form}>
              {/* DOCUMENT TYPE */}

              <div className={styles.field}>
                <label className={styles["field-label"]}>Document Type</label>

                <div className={styles["doc-type-grid"]}>
                  {DOC_TYPES.map((doc) => {
                    const Icon = doc.icon;

                    return (
                      <button
                        type="button"
                        key={doc.id}
                        className={cx(
                          styles["doc-type-card"],
                          docType === doc.id && styles.selected,
                        )}
                        onClick={() => setDocType(doc.id)}
                        disabled={submitting}
                      >
                        <Icon size={18} />

                        {doc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FRONT + BACK */}

              <div className={cx(styles["upload-grid"], styles["two-col"])}>
                {/* FRONT */}

                <label
                  className={cx(styles.dropzone, docFront && styles.filled)}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,application/pdf"
                    disabled={submitting}
                    onChange={(e) =>
                      handleFileChange(e, setDocFront, "docFront")
                    }
                  />

                  <span className={styles["dropzone-icon"]}>
                    {docFront ? <Check size={18} /> : <UploadCloud size={18} />}
                  </span>

                  <span className={styles["dropzone-title"]}>
                    {docFront ? "Front uploaded" : "Upload front side"}
                  </span>

                  {docFront ? (
                    <span className={styles["dropzone-file"]}>
                      {docFront.name}
                    </span>
                  ) : (
                    <span className={styles["dropzone-sub"]}>
                      PNG, JPG or PDF · max 4MB
                    </span>
                  )}
                </label>

                {/* BACK */}

                <label
                  className={cx(styles.dropzone, docBack && styles.filled)}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,application/pdf"
                    disabled={submitting}
                    onChange={(e) => handleFileChange(e, setDocBack, "docBack")}
                  />

                  <span className={styles["dropzone-icon"]}>
                    {docBack ? <Check size={18} /> : <UploadCloud size={18} />}
                  </span>

                  <span className={styles["dropzone-title"]}>
                    {docBack ? "Back uploaded" : "Upload back side"}
                  </span>

                  {docBack ? (
                    <span className={styles["dropzone-file"]}>
                      {docBack.name}
                    </span>
                  ) : (
                    <span className={styles["dropzone-sub"]}>
                      PNG, JPG or PDF · max 4MB
                    </span>
                  )}
                </label>
              </div>

              {/* ERRORS */}

              {(errors.docFront || errors.docBack) && (
                <span className={styles["error-text"]}>
                  {errors.docFront || errors.docBack}
                </span>
              )}
            </div>
          )}

          {/* =================================================
              STEP 3 - REVIEW
          ================================================== */}

          {currentStep.id === "review" && (
            <div className={styles.form}>
              <div className={styles["review-list"]}>
                {/* FULL NAME */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Full Name</span>

                  <span className={styles["review-value"]}>
                    {profile.fullName || "—"}
                  </span>
                </div>

                {/* DOB */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Date of Birth</span>

                  <span className={styles["review-value"]}>
                    {profile.dob || "—"}
                  </span>
                </div>

                {/* COUNTRY */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Country</span>

                  <span className={styles["review-value"]}>
                    {profile.country || "—"}
                  </span>
                </div>

                {/* PHONE */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Phone</span>

                  <span className={styles["review-value"]}>
                    {profile.phone || "—"}
                  </span>
                </div>

                {/* ADDRESS */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Address</span>

                  <span className={styles["review-value"]}>
                    {profile.address || "—"}
                  </span>
                </div>

                {/* DOCUMENT TYPE */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Document Type</span>

                  <span className={styles["review-value"]}>
                    {DOC_TYPES.find((d) => d.id === docType)?.label}
                  </span>
                </div>

                {/* FRONT */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Front Document</span>

                  <span className={styles["review-value"]}>
                    {docFront ? docFront.name : "—"}
                  </span>
                </div>

                {/* BACK */}

                <div className={styles["review-row"]}>
                  <span className={styles["review-key"]}>Back Document</span>

                  <span className={styles["review-value"]}>
                    {docBack ? docBack.name : "—"}
                  </span>
                </div>
              </div>

              {/* CONSENT */}

              <label className={styles["consent-row"]}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={submitting || status === "pending"}
                />

                <span>
                  I confirm the information provided is accurate and I consent
                  to Vaultline processing my data for identity verification
                  purposes.
                </span>
              </label>
            </div>
          )}

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <div className={styles["step-nav"]}>
            <button
              type="button"
              className={styles["btn-secondary"]}
              onClick={goBack}
              disabled={stepIndex === 0 || submitting}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {isLastStep ? (
              <button
                type="button"
                className={styles["btn-primary"]}
                onClick={handleSubmit}
                disabled={submitting || status === "pending"}
              >
                {submitting ? "Submitting..." : "Submit for Review"}

                {!submitting && <Check size={16} />}
              </button>
            ) : (
              <button
                type="button"
                className={styles["btn-primary"]}
                onClick={goNext}
                disabled={submitting}
              >
                Continue
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            SIDE COLUMN
        =================================================== */}

        <div className={styles["side-col"]}>
          {/* VERIFICATION STATUS */}

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <div className={styles["title-with-icon"]}>
                <Clock size={18} className="accent-icon" />

                <h2>Verification Status</h2>
              </div>
            </div>

            <div className={styles["status-card"]}>
              <span
                className={cx(
                  styles["status-badge-lg"],
                  status === "pending" && styles.pending,
                  status === "verified" && styles.verified,
                  status === "rejected" && styles.rejected,
                  status === "not-started" && styles["not-started"],
                )}
              >
                {status === "pending" && <Clock size={13} />}

                {status === "verified" && <BadgeCheck size={13} />}

                {statusMeta.label}
              </span>

              <p className={styles["status-desc"]}>{statusMeta.desc}</p>

              <div className={styles["progress-track"]}>
                <div
                  className={styles["progress-fill"]}
                  style={{
                    width: `${progressPct}%`,
                  }}
                />
              </div>

              <div className={styles["progress-meta"]}>
                <span>
                  Step {stepIndex + 1} of {STEPS.length}
                </span>

                <span>{progressPct}%</span>
              </div>
            </div>
          </div>

          {/* BEFORE YOU START */}

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <div className={styles["title-with-icon"]}>
                <FileText size={18} className="accent-icon" />

                <h2>Before You Start</h2>
              </div>
            </div>

            <div className={styles.checklist}>
              {/* PROFILE */}

              <div className={styles["checklist-item"]}>
                <Check
                  size={14}
                  className={cx(
                    styles["checklist-icon"],
                    profileIsComplete() && styles.done,
                  )}
                />

                <span>Complete your profile information</span>
              </div>

              {/* DOCUMENTS */}

              <div className={styles["checklist-item"]}>
                <Check
                  size={14}
                  className={cx(
                    styles["checklist-icon"],
                    docFront && docBack && styles.done,
                  )}
                />

                <span>Clear, uncropped photos of both sides</span>
              </div>

              {/* MATCHING DETAILS */}

              <div className={styles["checklist-item"]}>
                <Check
                  size={14}
                  className={cx(
                    styles["checklist-icon"],
                    profileIsComplete() && docFront && docBack && styles.done,
                  )}
                />

                <span>Name and details matching your ID exactly</span>
              </div>

              {/* VALID ID */}

              <div className={styles["checklist-item"]}>
                <Check
                  size={14}
                  className={cx(
                    styles["checklist-icon"],
                    docFront && docBack && styles.done,
                  )}
                />

                <span>Valid, unexpired government-issued ID</span>
              </div>
            </div>
          </div>

          {/* PRIVACY */}

          <div className={cx(styles.panel, styles["alert-panel"])}>
            <div className={styles["alert-content"]}>
              <Lock size={18} className="alert-icon" />

              <div className={styles["alert-text"]}>
                <h4>Your data is encrypted</h4>

                <p>
                  Documents are encrypted in transit and at rest, used only for
                  verification, and never shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
