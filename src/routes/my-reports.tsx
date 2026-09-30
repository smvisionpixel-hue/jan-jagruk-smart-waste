import { createFileRoute } from "@tanstack/react-router";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { StatusBadge } from "@/components/jan/bits";
import { MY_REPORTS, STATUS_FLOW } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/my-reports")({
  head: () => ({
    meta: [
      { title: "My Reports — Jan Jagruk" },
      { name: "description", content: "Track the status of every waste report you have submitted." },
      { property: "og:title", content: "My Reports — Jan Jagruk" },
      { property: "og:description", content: "Follow each report from submission through pickup to resolution." },
    ],
  }),
  component: MyReports,
});

function MyReports() {
  return (
    <CitizenShell>
      <PageHeader eyebrow="Citizen" title="My Reports" description="Every report you filed and where it stands." />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
          {STATUS_FLOW.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <StatusBadge status={s.label} />
              {i < STATUS_FLOW.length - 1 ? <span className="text-muted-foreground">→</span> : null}
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MY_REPORTS.map((r) => (
            <article key={r.id + r.time} className="card-elevated rounded-2xl border bg-card p-5">
              <div className={`h-28 w-full rounded-xl bg-gradient-to-br ${r.evidenceTone}`} />
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">Report {r.id}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.category}</p>
              <p className="mt-2 text-xs text-muted-foreground">{r.approxLocation}</p>
              <p className="text-xs text-muted-foreground">
                {r.lat}, {r.lng} · {r.time}
              </p>
            </article>
          ))}
        </div>
      </div>
    </CitizenShell>
  );
}
