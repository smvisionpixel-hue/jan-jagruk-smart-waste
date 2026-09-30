import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PriorityBadge, SectionTitle, StatusBadge } from "@/components/jan/bits";
import { LeafletMap, type LiveMapPoint } from "@/components/jan/LeafletMap";
import { Button } from "@/components/ui/button";
import { getAdminIncidents } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/hotspots")({
  loader: () => getAdminIncidents(),
  head: () => ({
    meta: [
      { title: "Waste Hotspots — Jan Jagruk Admin" },
      { name: "description", content: "Live waste hotspots derived from PostgreSQL incident density." },
    ],
  }),
  component: AdminHotspots,
});

function AdminHotspots() {
  const { incidents } = Route.useLoaderData();
  const [activeCode, setActiveCode] = useState(incidents[0]?.incident_code);
  const active = incidents.find((incident) => incident.incident_code === activeCode) ?? incidents[0];
  const points: LiveMapPoint[] = incidents.map((incident) => ({
    id: incident.incident_code,
    latitude: Number(incident.latitude),
    longitude: Number(incident.longitude),
    label: incident.incident_code,
    detail: `${incident.report_count} reports · ${incident.status}`,
    tone: incident.status === "resolved" ? "primary" : incident.severity === "high" ? "danger" : "warning",
  }));

  if (!active) {
    return (
      <div className="mx-auto max-w-7xl">
        <SectionTitle title="Waste Hotspots" subtitle="No incidents have been clustered yet." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="Waste Hotspots" subtitle="Live incident density from PostgreSQL · click a marker to inspect the cluster" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Resolved</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Active</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /> High severity</span>
          </div>
          <div className="mt-4" onClick={() => setActiveCode(points[0]?.id)}>
            <LeafletMap points={points} className="h-[28rem]" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Leaflet + OpenStreetMap · markers represent database-backed waste incidents.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {incidents.map((incident) => (
              <Button
                key={incident.incident_code}
                size="sm"
                variant={incident.incident_code === active.incident_code ? "default" : "outline"}
                onClick={() => setActiveCode(incident.incident_code)}
              >
                {incident.incident_code}
              </Button>
            ))}
          </div>
        </div>

        <aside className="card-elevated space-y-4 rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hotspot details</p>
          <p className="text-xl font-bold">{active.incident_code}</p>
          <p className="text-sm text-muted-foreground">{active.report_count} reports detected in this cluster</p>
          <dl className="grid gap-2 text-sm">
            {[
              ["Reports", String(active.report_count)],
              ["Category", active.category],
              ["Severity", active.severity],
              ["Coordinates", `${Number(active.latitude).toFixed(5)}, ${Number(active.longitude).toFixed(5)}`],
            ].map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">{key}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={active.severity === "critical" || active.severity === "high" ? "high" : "medium"} />
            <StatusBadge status={active.status.replace("_", " ")} />
          </div>
          <Button asChild className="w-full">
            <Link to="/admin/incidents/$id" params={{ id: active.incident_code }}>View Incident</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}