"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Invalid username or password");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />

      <div className="w-full max-w-md bg-white border border-slate-200/60 shadow-xl rounded-3xl p-8 z-10 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            Staff Portal
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Dashboard Sign In
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            Authorized support agents only. Sign in with the system configuration credentials.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Username
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
