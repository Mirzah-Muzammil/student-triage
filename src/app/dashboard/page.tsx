import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { getCases } from "@/features/cases/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { cases, stats } = await getCases({ view: "escalations", tab: "all" });

  return <DashboardOverview cases={cases} stats={stats} />;
}
