import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PriorityBadge, PrototypeNote, SectionTitle, StatusBadge } from "@/components/jan/bits";
import { HotspotMap } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { HOTSPOTS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/hotspots")({
  head: () => ({
    meta: [
      { title: "Waste Hotspots — Jan Jagruk Admin" },
      { name: "description", content: "Map of active waste hotspots ranked low, medium and high priority." },
      { property: "og:title", content: "Waste Hotspots — Jan Jagruk Admin" },
      { property: "og:description", content: "Interactive hotspot map with per-cluster details." },
    ],
  }),
  component: AdminHotspots,
});

function AdminHotspots() {
  const [activeId, setActiveId] = useState(HOTSPOTS[0].id);
  const active = HOTSPOTS.find((h) => h.id === activeId) ?? HOTSPOTS[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="Waste Hotspots" subtitle="Click a marker to inspect the cluster" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" /> High
            </span>
          </div>
          <HotspotMap
            className="mt-4 h-[28rem]"
            hotspots={HOTSPOTS}
            activeId={activeId}
            onSelect={(h) => setActiveId(h.id)}
          />
          <PrototypeNote>Simulated map component for the prototype demo.</PrototypeNote>
        </div>

        <aside className="card-elevated space-y-4 rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hotspot details</p>
          <p className="text-xl font-bold">Incident #{active.incidentId}</p>
          <p className="text-sm text-muted-foreground">{active.reports} reports detected nearby</p>
          <dl className="grid gap-2 text-sm">
            {[
              ["Reports", String(active.reports)],
              ["Category", active.category],
              ["Area", active.area],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={active.priority} />
            <StatusBadge status={active.status} />
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/admin/incidents/$id" params={{ id: active.incidentId }}>
                View Incident
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/pickups">Assign Pickup</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
