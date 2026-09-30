import { createFileRoute, Link } from "@tanstack/react-router";
import { FileStack, Flame, Layers, MapPinned } from "lucide-react";
import { PriorityBadge, SectionTitle, StatCard, StatusBadge } from "@/components/jan/bits";
import { LeafletMap, type LiveMapPoint } from "@/components/jan/LeafletMap";
import { Button } from "@/components/ui/button";
import { getAdminIncidents, getAdminStats } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [stats, incidentData] = await Promise.all([getAdminStats(), getAdminIncidents()]);
    return { stats, incidents: incidentData.incidents };
  },
  head: () => ({
    meta: [
      { title: "Admin Overview — Jan Jagruk" },
      { name: "description", content: "City-wide waste reporting overview, incidents and hotspots." },
      { property: "og:title", content: "Admin Overview — Jan Jagruk" },
      { property: "og:description", content: "Monitor reports, detected incidents and active hotspots." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { stats, incidents } = Route.useLoaderData();
  const mapPoints: LiveMapPoint[] = incidents.map((incident) => ({
    id: incident.incident_code,
    latitude: Number(incident.latitude),
    longitude: Number(incident.longitude),
    label: incident.incident_code,
    detail: `${incident.report_count} reports · ${incident.status}`,
    tone: incident.status === "resolved" ? "primary" : "danger",
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <SectionTitle title="Overview" subtitle="City-wide waste intelligence for Kanpur zone" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Reports" value={stats.total_reports} icon={FileStack} />
        <StatCard label="Active Incidents" value={stats.active_incidents} icon={Flame} accent="danger" />
        <StatCard label="Hotspots" value={stats.hotspots} icon={MapPinned} accent="warning" />
        <StatCard label="Vehicles Online" value={stats.vehicles_online} icon={Layers} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Hotspot map</p>
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/hotspots">Open map</Link>
            </Button>
          </div>
          <LeafletMap points={mapPoints} className="mt-4 h-80" />
        </div>
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">Priority queue</p>
          <div className="mt-4 space-y-3">
            {incidents.slice(0, 4).map((i) => (
              <Link
                key={i.id}
                to="/admin/incidents/$id"
                params={{ id: i.incident_code }}
                className="block rounded-xl border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{i.incident_code}</p>
                  <PriorityBadge priority={i.severity === "critical" || i.severity === "high" ? "high" : "medium"} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                   {Number(i.latitude).toFixed(4)}, {Number(i.longitude).toFixed(4)} · {i.report_count} reports
                </p>
                <StatusBadge status={i.status} className="mt-2" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
