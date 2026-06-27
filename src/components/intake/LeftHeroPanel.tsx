"use client";

import Link from "next/link";

export default function LeftHeroPanel() {
  return (
    <div className="lg:col-span-5 bg-[#4b62a6] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden m-0 lg:m-4 rounded-none lg:rounded-[24px] h-[350px] lg:h-[calc(100%-32px)] shrink-0 shadow-md">
      {/* Subtle Background Shapes for Curve Aesthetic */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-12 translate-x-16 pointer-events-none" />
      
      <div className="flex items-center justify-between z-10">
        <span className="text-lg font-bold tracking-tight select-none">edin.world</span>
        <Link 
          href="/dashboard" 
          className="border border-white/40 text-white rounded-full px-5 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          Staff Login
        </Link>
      </div>

      {/* Illustration Container */}
      <div className="my-auto py-4 flex justify-center z-10 overflow-hidden">
        <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square bg-[#bfe3f7]/15 rounded-[24px] p-4 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
          <img 
            src="/students_illustration.png" 
            alt="Students collaborating" 
            className="w-full h-full object-cover rounded-[16px] transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <div className="space-y-3 z-10">
        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
          Welcome to Your Student Support Desk.
        </h2>
        <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
          Submit your enquiry to receive helpful resources instantly, ask quick questions, or route your case to a university support advisor.
        </p>
      </div>
    </div>
  );
}
