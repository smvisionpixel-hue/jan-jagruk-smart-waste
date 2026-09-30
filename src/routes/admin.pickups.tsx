import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { PICKUP_QUEUE } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/pickups")({
  head: () => ({
    meta: [
      { title: "Pickup Management — Jan Jagruk Admin" },
      { name: "description", content: "Assign and track waste pickup crews against detected incidents." },
      { property: "og:title", content: "Pickup Management — Jan Jagruk Admin" },
      { property: "og:description", content: "Pickup queue, crew assignment and completion tracking." },
    ],
  }),
  component: Pickups,
});

function Pickups() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="Pickup Management" subtitle="Crew assignment against detected waste incidents" />
      <div className="card-elevated overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[42rem] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pickup ID</th>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Crew</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {PICKUP_QUEUE.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{p.id}</td>
                <td className="px-4 py-3">{p.incident}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.area}</td>
                <td className="px-4 py-3">{p.crew}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.eta}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.state} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" disabled={p.state === "Resolved"}>
                    {p.state === "Awaiting Assignment" ? "Assign crew" : "Update"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
