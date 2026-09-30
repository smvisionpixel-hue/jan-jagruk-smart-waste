import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { PriorityBadge, PrototypeNote, StatusBadge } from "@/components/jan/bits";
import { HotspotMap } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { HOTSPOTS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/hotspots")({
  head: () => ({
    meta: [
      { title: "Nearby Waste Hotspots — Jan Jagruk" },
      { name: "description", content: "Explore clustered waste hotspots detected around your area." },
      { property: "og:title", content: "Nearby Waste Hotspots — Jan Jagruk" },
      { property: "og:description", content: "Low, medium and high priority waste hotspots on a simulated map." },
    ],
  }),
  component: HotspotsPage,
});

function HotspotsPage() {
  const [activeId, setActiveId] = useState(HOTSPOTS[0].id);
  const active = HOTSPOTS.find((h) => h.id === activeId) ?? HOTSPOTS[0];

  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="Waste Hotspots"
        description="Clusters of related reports, ranked by priority. Tap a marker for details."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_0.6fr]">
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
            className="mt-4 h-[26rem]"
            hotspots={HOTSPOTS}
            activeId={activeId}
            onSelect={(h) => setActiveId(h.id)}
          />
          <PrototypeNote>Positions are illustrative; the map is a simulated prototype component.</PrototypeNote>
        </div>

        <aside className="card-elevated space-y-4 rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hotspot details</p>
          <div>
            <p className="text-xl font-bold">Incident #{active.incidentId}</p>
            <p className="text-sm text-muted-foreground">{active.reports} reports detected nearby</p>
          </div>
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
          <Button asChild className="w-full">
            <Link to="/admin/incidents/$id" params={{ id: active.incidentId }}>
              View incident
            </Link>
          </Button>

          <div className="space-y-2 pt-2">
            {HOTSPOTS.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveId(h.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                  h.id === activeId ? "border-primary bg-primary/5" : ""
                }`}
              >
                <span className="font-medium">{h.area}</span>
                <span className="text-xs text-muted-foreground">{h.reports} reports</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </CitizenShell>
  );
}
