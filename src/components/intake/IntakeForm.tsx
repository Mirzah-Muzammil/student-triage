"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitIntake } from "@/services/submit/api";
import LeftHeroPanel from "./LeftHeroPanel";
import IntakeFormFields from "./IntakeFormFields";

export default function IntakeForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    course: "",
    yearOfStudy: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await submitIntake(formData);
      sessionStorage.setItem("student-triage-result", JSON.stringify(data));
      router.push("/result");
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center select-none">
      <div className="w-full h-full bg-white rounded-none  grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side Hero Vector Panel */}
        <LeftHeroPanel />

        {/* Right Side scrollable form / result view */}
        <div className="lg:col-span-7 h-full overflow-y-auto flex flex-col bg-white">
          <div className="my-auto w-full max-w-3xl mx-auto px-6 sm:px-12 py-10 sm:py-12">
            <IntakeFormFields
              formData={formData}
              onChange={(fields) => setFormData((prev) => ({ ...prev, ...fields }))}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
            
          </div>
        </div>

      </div>
    </div>
  );
}
