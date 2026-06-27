import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { getCases } from "@/features/cases/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { cases, stats } = await getCases({ view: "escalations", tab: "all" });

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex bg-white w-full h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafd]">
          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
            <DashboardOverview cases={cases} stats={stats} />
          </main>
        </div>
      </div>
    </div>
  );
}
