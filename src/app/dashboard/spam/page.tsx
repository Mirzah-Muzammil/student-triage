import Sidebar from "@/components/layout/Sidebar";
import DashboardTable from "@/components/dashboard/DashboardTable";
import { getCases } from "@/services/caseServices";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    from?: string;
    to?: string;
    sort?: string;
    asc?: string;
    urgency?: string;
  }>;
}

export default async function SpamPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const currentParams = {
    view: "spam" as const,
    tab: resolvedParams.tab || "all",
    search: resolvedParams.search || "",
    from: resolvedParams.from || "",
    to: resolvedParams.to || "",
    sort: resolvedParams.sort || "createdAt",
    asc: resolvedParams.asc === "true",
    urgency: resolvedParams.urgency || "",
  };

  const { cases, stats } = await getCases(currentParams);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex bg-white w-full h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafd]">
          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
            <DashboardTable
              view="spam"
              cases={cases}
              stats={stats}
              currentParams={currentParams}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
