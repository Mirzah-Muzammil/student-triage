import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLoading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex bg-white w-full h-full">
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafd]">
          <main className="flex-1">
            {/* Header Skeleton */}
            <div className="space-y-2 animate-pulse shrink-0">
              <div className="h-7 w-48 bg-slate-200 rounded-lg" />
              <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
            </div>

            {/* Content Skeleton Box */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-6 animate-pulse flex-1 shadow-xs">
              {/* Tabs Placeholder */}
              <div className="flex gap-2">
                <div className="h-9 w-28 bg-slate-100 rounded-xl" />
                <div className="h-9 w-20 bg-slate-100 rounded-xl" />
                <div className="h-9 w-24 bg-slate-100 rounded-xl" />
              </div>

              {/* Filters Placeholder */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-slate-100 p-4 rounded-xl">
                <div className="h-10 w-full sm:max-w-md bg-slate-100 rounded-xl" />
                <div className="flex gap-2 justify-end">
                  <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                  <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                </div>
              </div>

              {/* Table / List Placeholder */}
              <div className="border border-slate-200/50 rounded-xl overflow-hidden bg-white">
                <div className="divide-y divide-slate-100">
                  {/* Table Header Placeholder */}
                  <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                    <div className="h-4 w-32 bg-slate-200 rounded-md" />
                    <div className="h-4 w-24 bg-slate-200 rounded-md hidden md:block" />
                    <div className="h-4 w-20 bg-slate-200 rounded-md hidden sm:block" />
                    <div className="h-4 w-16 bg-slate-200 rounded-md" />
                  </div>

                  {/* Rows Placeholder */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-6 py-5 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4.5 w-40 bg-slate-100 rounded-md" />
                        <div className="h-3 w-52 bg-slate-50 rounded-sm" />
                      </div>
                      <div className="h-4 w-24 bg-slate-50 rounded-md hidden md:block" />
                      <div className="h-4 w-20 bg-slate-50 rounded-md hidden sm:block" />
                      <div className="h-8.5 w-24 bg-slate-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
