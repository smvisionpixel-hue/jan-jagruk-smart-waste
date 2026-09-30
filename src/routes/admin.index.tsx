import { createFileRoute, Link } from "@tanstack/react-router";
import { FileStack, Flame, Layers, MapPinned } from "lucide-react";
import { PriorityBadge, SectionTitle, StatCard, StatusBadge } from "@/components/jan/bits";
import { HotspotMap } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { HOTSPOTS, INCIDENTS, PLATFORM_STATS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/")({
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
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <SectionTitle title="Overview" subtitle="City-wide waste intelligence for Kanpur zone" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Reports" value={PLATFORM_STATS.totalReports} icon={FileStack} />
        <StatCard label="Detected Incidents" value={PLATFORM_STATS.detectedIncidents} icon={Flame} accent="danger" />
        <StatCard label="Active Hotspots" value={PLATFORM_STATS.activeHotspots} icon={MapPinned} accent="warning" />
        <StatCard label="Reports Clustered" value={PLATFORM_STATS.reportsClustered} icon={Layers} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Hotspot map</p>
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/hotspots">Open map</Link>
            </Button>
          </div>
          <HotspotMap hotspots={HOTSPOTS} className="mt-4 h-80" />
        </div>
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">Priority queue</p>
          <div className="mt-4 space-y-3">
            {INCIDENTS.slice(0, 4).map((i) => (
              <Link
                key={i.id}
                to="/admin/incidents/$id"
                params={{ id: i.id }}
                className="block rounded-xl border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Incident #{i.number}</p>
                  <PriorityBadge priority={i.priority} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {i.address} · {i.relatedReports} reports · {i.confidence}%
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
