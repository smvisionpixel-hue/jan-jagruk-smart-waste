import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Leaf, Recycle, Trophy } from "lucide-react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { StatCard, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CITIZEN_STATS } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Eco Profile — Jan Jagruk" },
      { name: "description", content: "Your eco score, badges and point history on Jan Jagruk." },
      { property: "og:title", content: "Eco Profile — Jan Jagruk" },
      { property: "og:description", content: "Eco score, badges and civic contribution history." },
    ],
  }),
  component: Profile,
});

const HISTORY = [
  { label: "Segregation verified", points: "+20", time: "Today 12:40", status: "Approved" },
  { label: "Report #110 verified", points: "+15", time: "Today 09:12", status: "Approved" },
  { label: "Hotspot confirmation", points: "+10", time: "Yesterday 17:05", status: "Approved" },
  { label: "Report #104 clustered", points: "+15", time: "Yesterday 08:45", status: "Clustered" },
];

function Profile() {
  return (
    <CitizenShell>
      <PageHeader eyebrow="Citizen" title="Eco Profile" description="Aarav Sharma · Main Road ward, Kanpur" />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eco Score" value={CITIZEN_STATS.ecoScore} icon={Leaf} />
          <StatCard label="Reports Submitted" value={CITIZEN_STATS.reportsSubmitted} icon={Recycle} />
          <StatCard label="Resolved Reports" value={CITIZEN_STATS.resolvedReports} icon={Trophy} />
          <StatCard label="Badges Earned" value={4} icon={Award} accent="warning" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card-elevated rounded-2xl border bg-card p-6">
            <p className="font-semibold">Points history</p>
            <div className="mt-4 divide-y">
              {HISTORY.map((h) => (
                <div key={h.label + h.time} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{h.label}</p>
                    <p className="text-xs text-muted-foreground">{h.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={h.status} />
                    <span className="text-sm font-bold text-primary">{h.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated space-y-5 rounded-2xl border bg-card p-6">
            <div>
              <p className="font-semibold">Next level: Green Champion</p>
              <p className="mt-1 text-xs text-muted-foreground">180 points to go</p>
              <Progress value={82} className="mt-3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Clean Streak", "First Report", "Hotspot Hero", "Segregation Pro"].map((b) => (
                <div key={b} className="rounded-xl border bg-muted/40 px-3 py-4 text-center">
                  <Award className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-xs font-semibold">{b}</p>
                </div>
              ))}
            </div>
            <Button asChild className="w-full">
              <Link to="/segregate">Earn more points</Link>
            </Button>
          </div>
        </div>
      </div>
    </CitizenShell>
  );
}
