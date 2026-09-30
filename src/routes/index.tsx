import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, MapPin, ScanSearch, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CitizenShell } from "@/components/jan/CitizenShell";
import { DetectionFlow, PrototypeNote } from "@/components/jan/bits";
import { HotspotMap } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { HERO_INCIDENT, HOTSPOTS, PLATFORM_STATS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jan Jagruk — Awareness Meets Action" },
      {
        name: "description",
        content:
          "Jan Jagruk turns repeated citizen waste complaints into actionable incidents using simulated GPS, category and evidence analysis.",
      },
      { property: "og:title", content: "Jan Jagruk — Awareness Meets Action" },
      {
        property: "og:description",
        content: "Civic-tech platform that converts 10 related citizen reports into one actionable waste incident.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <CitizenShell>
      <section className="hero-gradient border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-assisted prototype
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              10 reports. One location. <br />
              One actionable waste incident.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Jan Jagruk converts repeated citizen complaints into actionable waste intelligence — clustering reports by
              location proximity, waste category, evidence similarity and reporting time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/report">
                  Report waste <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/admin/detection">See smart detection</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Reports", PLATFORM_STATS.totalReports],
                ["Incidents", PLATFORM_STATS.detectedIncidents],
                ["Hotspots", PLATFORM_STATS.activeHotspots],
                ["Clustered", PLATFORM_STATS.reportsClustered],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border bg-card px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="text-2xl font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-elevated rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Live hotspot view</p>
              <span className="text-xs text-muted-foreground">Kanpur zone</span>
            </div>
            <HotspotMap hotspots={HOTSPOTS} className="mt-4 h-72" />
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-danger">
                <Flame className="h-4 w-4" /> High-confidence waste incident #{HERO_INCIDENT.number}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {HERO_INCIDENT.relatedReports} related reports · {HERO_INCIDENT.address} ·{" "}
                {HERO_INCIDENT.confidence}% detection confidence
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/admin/incidents/$id" params={{ id: HERO_INCIDENT.id }}>
                  Open incident
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">How the detection engine thinks</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every citizen report is compared against nearby reports across four signals. When ten related reports
              converge, the platform raises a high-confidence incident for administrative action.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { icon: MapPin, title: "GPS proximity", text: "Reports within a tight radius are grouped." },
                { icon: ScanSearch, title: "Category matching", text: "Same waste type strengthens the cluster." },
                { icon: ShieldCheck, title: "Evidence similarity", text: "Uploaded photos compared for overlap." },
                { icon: Truck, title: "Time window", text: "Recent reports weigh higher than stale ones." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border bg-card p-4">
                  <f.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
            <PrototypeNote>
              Detection is simulated with prototype data. No live AI service or GPS provider is connected.
            </PrototypeNote>
          </div>
          <DetectionFlow
            steps={[
              { label: "10 citizen reports", detail: "Reports #101 – #110 submitted from Main Road" },
              { label: "GPS proximity analysis", detail: "All within ~120 m radius" },
              { label: "Waste category matching", detail: "Roadside Garbage across all reports" },
              { label: "Image / evidence similarity", detail: "92% visual overlap across submissions" },
              { label: "🔥 Waste incident detected", detail: "Incident #104 raised for pickup", highlight: true },
            ]}
          />
        </div>
      </section>
    </CitizenShell>
  );
}
