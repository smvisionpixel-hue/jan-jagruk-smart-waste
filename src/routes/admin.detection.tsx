import { createFileRoute, Link } from "@tanstack/react-router";
import { FileStack, Flame, Layers, MapPinned } from "lucide-react";
import { DetectionFlow, PriorityBadge, PrototypeNote, StatCard, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { INCIDENTS, PLATFORM_STATS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/detection")({
  head: () => ({
    meta: [
      { title: "Smart Waste Incident Detection — Jan Jagruk" },
      {
        name: "description",
        content: "Ten related citizen reports at one location become a single high-confidence waste incident.",
      },
      { property: "og:title", content: "Smart Waste Incident Detection — Jan Jagruk" },
      { property: "og:description", content: "10 reports. One location. One actionable waste incident." },
    ],
  }),
  component: Detection,
});

function Detection() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="hero-gradient rounded-3xl border p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Smart Waste Incident Detection</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          10 reports. One location. One actionable waste incident.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Jan Jagruk converts repeated citizen complaints into actionable waste intelligence.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Reports" value={PLATFORM_STATS.totalReports} icon={FileStack} />
        <StatCard label="Detected Incidents" value={PLATFORM_STATS.detectedIncidents} icon={Flame} accent="danger" />
        <StatCard label="Active Hotspots" value={PLATFORM_STATS.activeHotspots} icon={MapPinned} accent="warning" />
        <StatCard label="Reports Clustered" value={PLATFORM_STATS.reportsClustered} icon={Layers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">Detection pipeline</p>
          <DetectionFlow
            className="mt-4"
            steps={[
              { label: "10 citizen reports", detail: "#101 – #110, Main Road" },
              { label: "GPS proximity analysis", detail: "Cluster radius ~120 m" },
              { label: "Waste category matching", detail: "Roadside Garbage" },
              { label: "Image / evidence similarity", detail: "92% visual overlap" },
              { label: "🔥 High-confidence waste incident", detail: "Incident #104", highlight: true },
            ]}
          />
          <PrototypeNote>Simulated intelligence layer — no live AI model or GPS service is connected.</PrototypeNote>
        </div>

        <div className="space-y-4">
          {INCIDENTS.map((i) => (
            <article key={i.id} className="card-elevated rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {i.priority === "high" ? <span className="text-sm font-bold text-danger">🔥 HIGH PRIORITY</span> : null}
                    <PriorityBadge priority={i.priority} />
                  </div>
                  <p className="mt-2 text-lg font-bold">Incident #{i.number}</p>
                  <p className="text-sm text-muted-foreground">{i.category}</p>
                  <p className="mt-1 text-sm text-muted-foreground">📍 {i.address}</p>
                </div>
                <div className="min-w-44">
                  <p className="text-sm font-semibold">{i.relatedReports} related reports</p>
                  <p className="mt-2 text-xs text-muted-foreground">Detection confidence</p>
                  <div className="flex items-center gap-2">
                    <Progress value={i.confidence} className="h-2" />
                    <span className="text-sm font-bold">{i.confidence}%</span>
                  </div>
                  <StatusBadge status={i.status} className="mt-2" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/admin/incidents/$id" params={{ id: i.id }}>
                    View Incident
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/pickups">Assign Pickup</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/admin/incidents/$id" params={{ id: i.id }} hash="reports">
                    View Reports
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
