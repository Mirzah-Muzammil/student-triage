"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LeftHeroPanel from "@/components/intake/LeftHeroPanel";
import IntakeResultScreen from "@/components/intake/IntakeResultScreen";
import { type ApiResponse } from "@/services/submit/api";

const RESULT_STORAGE_KEY = "student-triage-result";

export default function ResultPage() {
  const router = useRouter();
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (stored) {
        try {
          setResponse(JSON.parse(stored) as ApiResponse);
        } catch {
          sessionStorage.removeItem(RESULT_STORAGE_KEY);
        }
      }
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleReset() {
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
    router.push("/");
  }

  function handleResponseChange(nextResponse: ApiResponse) {
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(nextResponse));
    setResponse(nextResponse);
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center select-none">
      <div className="w-full h-full bg-white rounded-none grid grid-cols-1 lg:grid-cols-12">
        <LeftHeroPanel />

        <div className="lg:col-span-7 h-full overflow-y-auto flex flex-col bg-white">
          <div className="my-auto w-full max-w-3xl mx-auto px-6 sm:px-12 py-10 sm:py-12">
            {!hasLoaded ? null : response ? (
              <IntakeResultScreen
                response={response}
                onReset={handleReset}
                onResponseChange={handleResponseChange}
              />
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                    No Request Outcome
                  </h1>
                  <p className="text-slate-400 text-xs mt-2 font-medium">
                    Submit a request to see the result here.
                  </p>
                </div>

                <button
                  id="new-request-button"
                  onClick={handleReset}
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 px-6 text-xs font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-100 uppercase tracking-wider"
                >
                  Submit A Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
