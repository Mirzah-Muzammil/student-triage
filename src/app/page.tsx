"use client";

import { useState, type FormEvent } from "react";

const YEAR_OPTIONS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Postgraduate",
  "Other",
];

interface ApiResponse {
  disposition: string;
  title: string;
  message: string;
}

export default function IntakeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    course: "",
    yearOfStudy: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messageLength = formData.message.length;
  const isMessageValid = messageLength >= 10 && messageLength <= 5000;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error || `Something went wrong (${res.status})`
        );
      }

      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setResponse(null);
    setError(null);
    setFormData({
      name: "",
      email: "",
      university: "",
      course: "",
      yearOfStudy: "",
      message: "",
    });
  }

  // ── RESULT CARD ──────────────────────────────────────────────────────────
  if (response) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <ResultCard response={response} onReset={handleReset} />
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      {/* Hero section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Tell us what you need and we&apos;ll get you the right support — often
          in seconds.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          id="error-banner"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        {/* Name + Email row */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="you@university.ac.uk"
            />
          </div>
        </div>

        {/* University */}
        <div>
          <label
            htmlFor="university"
            className="mb-1.5 block text-sm font-medium"
          >
            University <span className="text-destructive">*</span>
          </label>
          <input
            id="university"
            type="text"
            required
            maxLength={200}
            value={formData.university}
            onChange={(e) =>
              setFormData({ ...formData, university: e.target.value })
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="e.g. University of Edinburgh"
          />
        </div>

        {/* Course + Year row */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="course"
              className="mb-1.5 block text-sm font-medium"
            >
              Current Course <span className="text-destructive">*</span>
            </label>
            <input
              id="course"
              type="text"
              required
              maxLength={200}
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="e.g. MSc Computer Science"
            />
          </div>
          <div>
            <label
              htmlFor="yearOfStudy"
              className="mb-1.5 block text-sm font-medium"
            >
              Year of Study <span className="text-destructive">*</span>
            </label>
            <select
              id="yearOfStudy"
              required
              value={formData.yearOfStudy}
              onChange={(e) =>
                setFormData({ ...formData, yearOfStudy: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="" disabled>
                Select year
              </option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-medium"
          >
            How can we help? <span className="text-destructive">*</span>
          </label>
          <textarea
            id="message"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y min-h-[120px]"
            placeholder="Describe your situation or question in detail. The more specific you are, the faster we can help."
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>
              {messageLength < 10 && messageLength > 0
                ? `${10 - messageLength} more characters needed`
                : "\u00A0"}
            </span>
            <span
              className={
                messageLength > 4500
                  ? "text-amber-500"
                  : messageLength > 4900
                    ? "text-red-500"
                    : ""
              }
            >
              {messageLength} / 5,000
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          id="submit-button"
          type="submit"
          disabled={isSubmitting || !isMessageValid}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting…
            </>
          ) : (
            "Submit Request"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Your information will only be shared with the student support team.
        </p>
      </form>
    </div>
  );
}

// ── RESULT CARD COMPONENT ────────────────────────────────────────────────

function ResultCard({
  response,
  onReset,
}: {
  response: ApiResponse;
  onReset: () => void;
}) {
  const { disposition, title, message } = response;

  // Card styling by disposition
  const styles = getCardStyles(disposition);

  // Parse markdown bold (**text**) for emergency contacts
  const formattedMessage = message
    ? message.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    : "";

  return (
    <div
      id="result-card"
      className={`rounded-xl border-2 ${styles.border} ${styles.bg} overflow-hidden shadow-lg transition-all animate-in fade-in duration-500`}
    >
      {/* Crisis banner */}
      {disposition === "escalate" && response.message?.includes("999") && (
        <div
          id="crisis-banner"
          className="bg-red-600 px-6 py-3 text-white"
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">If you are in immediate danger, call 999</p>
              <p className="text-sm text-red-100">
                For emotional support 24/7: Samaritans on 116 123
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Icon */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

        {/* Message */}
        <div
          className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        />

        {/* New request button */}
        <button
          id="new-request-button"
          onClick={onReset}
          className="mt-6 flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Submit another request
        </button>
      </div>
    </div>
  );
}

function getCardStyles(disposition: string) {
  switch (disposition) {
    case "handle_now":
      return {
        border: "border-emerald-200 ",
        bg: "bg-emerald-50/50 ",
        iconBg: "bg-emerald-100 ",
        icon: (
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case "clarify":
      return {
        border: "border-blue-200 ",
        bg: "bg-blue-50/50 ",
        iconBg: "bg-blue-100 ",
        icon: (
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        ),
      };
    case "escalate":
      return {
        border: "border-amber-200 ",
        bg: "bg-amber-50/50 ",
        iconBg: "bg-amber-100 ",
        icon: (
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
      };
    default:
      return {
        border: "border-border",
        bg: "bg-card",
        iconBg: "bg-muted",
        icon: (
          <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ),
      };
  }
}
