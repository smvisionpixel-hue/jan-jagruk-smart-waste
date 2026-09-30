import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, StatusBadge } from "@/components/jan/bits";
import { POINTS_AUDIT } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/points")({
  head: () => ({
    meta: [
      { title: "User Points Audit — Jan Jagruk Admin" },
      { name: "description", content: "Audit eco point awards and adjustments across citizens." },
      { property: "og:title", content: "User Points Audit — Jan Jagruk Admin" },
      { property: "og:description", content: "Review awarded, adjusted and pending eco points." },
    ],
  }),
  component: Points,
});

function Points() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="User Points Audit" subtitle="Eco point awards and adjustments" />
      <div className="card-elevated overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[38rem] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Citizen</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {POINTS_AUDIT.map((p) => (
              <tr key={p.user + p.time} className="border-t">
                <td className="px-4 py-3 font-medium">{p.user}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.action}</td>
                <td className={`px-4 py-3 font-bold ${p.points < 0 ? "text-danger" : "text-primary"}`}>
                  {p.points > 0 ? `+${p.points}` : p.points}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.time}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
