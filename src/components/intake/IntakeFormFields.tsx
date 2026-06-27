"use client";

import { type FormEvent } from "react";
import { type IntakeData } from "@/services/submit/api";

const YEAR_OPTIONS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Postgraduate",
  "Other",
];

interface IntakeFormFieldsProps {
  formData: IntakeData;
  onChange: (fields: Partial<IntakeData>) => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function IntakeFormFields({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: IntakeFormFieldsProps) {
  const messageLength = formData.message.length;
  const isMessageValid = messageLength >= 10 && messageLength <= 5000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Get Support
        </h1>
        <p className="text-black/80 text-xs mt-2 font-medium">
          Tell us what you need and we&apos;ll get you the right support — often in seconds.
        </p>
      </div>

      {/* Error alert banner */}
      {error && (
        <div
          id="error-banner"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 animate-in fade-in duration-300"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-4 w-4 shrink-0 text-red-600 mt-0.5"
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
              <p className="font-bold">Something went wrong</p>
              <p className="mt-1 font-medium text-red-700/90">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name + Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
            >
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all"
              placeholder="you@university.ac.uk"
            />
          </div>
        </div>

        {/* University */}
        <div>
          <label
            htmlFor="university"
            className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
          >
            University <span className="text-red-500">*</span>
          </label>
          <input
            id="university"
            type="text"
            required
            maxLength={200}
            value={formData.university}
            onChange={(e) => onChange({ university: e.target.value })}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all"
            placeholder="e.g. University of Edinburgh"
          />
        </div>

        {/* Course + Year Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="course"
              className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
            >
              Current course <span className="text-red-500">*</span>
            </label>
            <input
              id="course"
              type="text"
              required
              maxLength={200}
              value={formData.course}
              onChange={(e) => onChange({ course: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all"
              placeholder="e.g. MSc Computer Science"
            />
          </div>

          <div>
            <label
              htmlFor="yearOfStudy"
              className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
            >
              Year of study <span className="text-red-500">*</span>
            </label>
            <select
              id="yearOfStudy"
              required
              value={formData.yearOfStudy}
              onChange={(e) => onChange({ yearOfStudy: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all"
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
            className="block text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1"
          >
            How can we help? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            minLength={10}
            maxLength={5000}
            rows={4}
            value={formData.message}
            onChange={(e) => onChange({ message: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#4b62a6] focus:outline-none focus:ring-1 focus:ring-[#4b62a6] transition-all min-h-[90px] resize-y"
            placeholder="Describe your situation in detail. The more specific you are, the faster we can help."
          />
          <div className="mt-1 flex justify-between text-[9px] font-bold text-black/80 uppercase tracking-wider">
            <span>
              {messageLength < 10 && messageLength > 0
                ? `${10 - messageLength} more characters needed`
                : "\u00A0"}
            </span>
            <span
              className={
                messageLength > 4500
                  ? "text-orange-500"
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
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#4b62a6] hover:bg-[#3d518c] px-6 text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4b62a6]/20 disabled:cursor-not-allowed disabled:opacity-50 mt-2 uppercase tracking-wider"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
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
      </form>

      <p className="text-center text-[9px] font-bold text-black/80 uppercase tracking-wider">
        Your information will only be shared with the student support team.
      </p>
    </div>
  );
}
