import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, Leaf, MapPin } from "lucide-react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { PriorityBadge, StatCard, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { CITIZEN_STATS, HOTSPOTS, MY_REPORTS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Citizen Dashboard — Jan Jagruk" },
      { name: "description", content: "Your eco score, reports and nearby waste hotspots on Jan Jagruk." },
      { property: "og:title", content: "Citizen Dashboard — Jan Jagruk" },
      { property: "og:description", content: "Track your eco score, submitted reports and nearby waste hotspots." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="Welcome back, Aarav"
        description="Your civic impact at a glance, plus waste hotspots detected around you."
        action={
          <Button asChild>
            <Link to="/report">Report waste</Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eco Score" value={CITIZEN_STATS.ecoScore} icon={Leaf} hint="Top 12% in Kanpur" />
          <StatCard label="Reports Submitted" value={CITIZEN_STATS.reportsSubmitted} icon={FileText} />
          <StatCard
            label="Nearby Waste Issues"
            value={CITIZEN_STATS.nearbyIssues}
            icon={MapPin}
            accent="warning"
            hint="Within 2 km"
          />
          <StatCard label="Resolved Reports" value={CITIZEN_STATS.resolvedReports} icon={CheckCircle2} />
        </div>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold tracking-tight">Nearby Waste Hotspots</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/hotspots">View map</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {HOTSPOTS.slice(0, 3).map((h) => (
              <div key={h.id} className="card-elevated rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{h.area}</p>
                  <PriorityBadge priority={h.priority} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {h.reports} reports · {h.category}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={h.status} />
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/incidents/$id" params={{ id: h.incidentId }}>
                      Incident #{h.incidentId}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight">Recent activity</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
            {MY_REPORTS.slice(0, 5).map((r) => (
              <div key={r.id + r.time} className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-b-0">
                <span className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${r.evidenceTone}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    Report {r.id} · {r.category}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.approxLocation} · {r.time}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </CitizenShell>
  );
}
