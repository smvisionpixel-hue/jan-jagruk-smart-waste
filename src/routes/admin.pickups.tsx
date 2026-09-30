import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionTitle, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { getAdminIncidents } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/pickups")({
  loader: () => getAdminIncidents(),
  head: () => ({ meta: [{ title: "Pickup Management — Jan Jagruk" }] }),
  component: PickupManagement,
});

function PickupManagement() {
  const { incidents } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="Pickup Management" subtitle="Assign and track operational work from real incident records" />
      <div className="grid gap-4">
        {incidents.map((incident) => (
          <div key={incident.incident_code} className="card-elevated flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
            <div>
              <p className="font-semibold">{incident.incident_code} · {incident.category}</p>
              <p className="mt-1 text-sm text-muted-foreground">{incident.report_count} related reports · {incident.vehicle_code ? `${incident.vehicle_code} · ${incident.driver_name}` : "Awaiting vehicle assignment"}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={incident.status.replace("_", " ")} />
              <Button asChild size="sm"><Link to="/admin/incidents/$id" params={{ id: incident.incident_code }}>Open assignment</Link></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}