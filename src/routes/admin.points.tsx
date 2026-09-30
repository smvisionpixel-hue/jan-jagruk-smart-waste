import { createFileRoute } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { SectionTitle, StatCard } from "@/components/jan/bits";
import { POINTS_AUDIT } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/points")({
  head: () => ({ meta: [{ title: "User Points Audit — Jan Jagruk" }] }),
  component: PointsAudit,
});

function PointsAudit() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="User Points Audit" subtitle="Eco Points changes are recorded as auditable transactions." />
      <StatCard label="Transactions shown" value={POINTS_AUDIT.length} icon={Coins} />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[42rem] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Citizen</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Points</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {POINTS_AUDIT.map((entry) => (
              <tr key={`${entry.user}-${entry.time}`} className="border-t">
                <td className="px-4 py-3 font-medium">{entry.user}</td>
                <td className="px-4 py-3">{entry.action}</td>
                <td className="px-4 py-3">{entry.points > 0 ? `+${entry.points}` : entry.points}</td>
                <td className="px-4 py-3">{entry.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}