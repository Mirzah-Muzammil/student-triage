import ProviderStatusPanel from "@/components/dashboard/ProviderStatusPanel";
import { getProviderStatuses } from "@/features/triage/provider-status";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const statuses = await getProviderStatuses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          System Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage your triage tool preferences and monitor connected AI provider integrations.
        </p>
      </div>

      {/* Provider Status Panel */}
      <ProviderStatusPanel statuses={statuses} />
    </div>
  );
}
