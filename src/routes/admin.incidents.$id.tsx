import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Flame } from "lucide-react";
import { DetectionFlow, PriorityBadge, PrototypeNote, StatusBadge } from "@/components/jan/bits";
import { MapCanvas, MapPin as Pin } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { INCIDENTS, STATUS_FLOW } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/incidents/$id")({
  loader: ({ params }) => {
    const incident = INCIDENTS.find((i) => i.id === params.id);
    if (!incident) throw notFound();
    return { incident };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Incident unavailable — Jan Jagruk" }, { name: "robots", content: "noindex" }] };
    }
    const { incident } = loaderData;
    const title = `Waste Incident #${incident.number} — Jan Jagruk`;
    const description = `${incident.relatedReports} related citizen reports clustered at ${incident.address} with ${incident.confidence}% detection confidence.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: IncidentDetail,
});

function IncidentDetail() {
  const { incident } = Route.useLoaderData();
  const stageIndex = STATUS_FLOW.findIndex((s) => s.key === incident.stage);
  const [assigned, setAssigned] = useState(false);
  const currentIndex = assigned ? Math.max(stageIndex, 3) : stageIndex;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link to="/admin/incidents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All incidents
      </Link>

      <header className="card-elevated rounded-3xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-danger">
              <Flame className="h-4 w-4" /> Waste Incident #{incident.number}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{incident.category}</h1>
            <p className="mt-1 text-sm text-muted-foreground">📍 {incident.address}</p>
            <p className="text-xs text-muted-foreground">
              {incident.lat}, {incident.lng} · detected {incident.detectedAt}
            </p>
          </div>
          <div className="min-w-56 space-y-2">
            <PriorityBadge priority={incident.priority} />
            <p className="text-xs text-muted-foreground">Detection confidence</p>
            <div className="flex items-center gap-2">
              <Progress value={incident.confidence} className="h-2" />
              <span className="font-bold">{incident.confidence}%</span>
            </div>
            <StatusBadge status={assigned ? "Pickup Assigned" : incident.status} />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => setAssigned(true)} disabled={assigned}>
                {assigned ? "Pickup assigned" : "Assign Pickup"}
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/pickups">Pickup queue</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <StatusBadge status={s.label} className={i > currentIndex ? "opacity-40" : ""} />
              {i < STATUS_FLOW.length - 1 ? <span className="text-muted-foreground">→</span> : null}
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="font-semibold">Detection flow</p>
            <DetectionFlow
              className="mt-4"
              steps={[
                { label: `${incident.relatedReports} citizen reports` },
                { label: "GPS proximity analysis", detail: "Cluster radius ~120 m" },
                { label: "Waste category matching", detail: incident.category },
                { label: "Image / evidence similarity", detail: `${incident.confidence}% overlap` },
                { label: "🔥 Waste incident detected", highlight: true },
              ]}
            />
          </div>
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="font-semibold">Cluster map</p>
            <MapCanvas className="mt-4 h-60">
              <Pin x={50} y={48} priority={incident.priority} label={incident.area} />
              <Pin x={36} y={62} priority="medium" label="Reports" />
              <Pin x={64} y={36} priority="medium" label="Reports" />
            </MapCanvas>
            <PrototypeNote>Simulated map view of the clustered reports.</PrototypeNote>
          </div>
        </div>

        <div id="reports" className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">{incident.relatedReports} Related Reports</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {incident.reports.map((r) => (
              <div key={r.id} className="flex gap-3 rounded-xl border p-3">
                <span className={`h-14 w-14 shrink-0 rounded-lg bg-gradient-to-br ${r.evidenceTone}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Report {r.id}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.approxLocation}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} · {r.time}
                  </p>
                  <StatusBadge status={r.status} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
