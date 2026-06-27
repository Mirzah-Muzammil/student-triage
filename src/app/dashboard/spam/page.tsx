import DashboardTable from "@/components/dashboard/DashboardTable";
import { getCases } from "@/features/cases/actions";

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
    sort: resolvedParams.sort || "importance",
    asc: resolvedParams.asc === "true",
    urgency: resolvedParams.urgency || "",
  };

  const { cases, stats } = await getCases(currentParams);

  return (
    <DashboardTable
      view="spam"
      cases={cases}
      stats={stats}
      currentParams={currentParams}
    />
  );
}
