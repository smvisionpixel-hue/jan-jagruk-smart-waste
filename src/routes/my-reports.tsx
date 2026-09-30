import { createFileRoute } from "@tanstack/react-router";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { StatusBadge } from "@/components/jan/bits";
import { STATUS_FLOW } from "@/lib/jan-jagruk-data";
import { getCitizenReports } from "@/lib/report.server";

export const Route = createFileRoute("/my-reports")({
  loader: () => getCitizenReports(),
  head: () => ({
    meta: [
      { title: "My Reports — Jan Jagruk" },
      {
        name: "description",
        content: "Track the status of every waste report you have submitted.",
      },
      { property: "og:title", content: "My Reports — Jan Jagruk" },
      {
        property: "og:description",
        content: "Follow each report from submission through pickup to resolution.",
      },
    ],
  }),
  component: MyReports,
});

function MyReports() {
  const { reports } = Route.useLoaderData();

  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="My Reports"
        description="Every report you filed and where it stands."
      />
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
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
              No reports yet. Use Report Waste to create your first civic report.
            </div>
          ) : null}
          {reports.map((report) => (
            <article
              key={report.report_code}
              className="card-elevated rounded-2xl border bg-card p-5"
            >
              <div className="flex h-28 w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-400 text-sm font-semibold text-emerald-950">
                {report.has_photo ? "Photo evidence saved" : "No photo attached"}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">{report.report_code}</p>
                <StatusBadge status={report.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {report.category} · {report.severity}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {report.landmark || "Location captured from browser GPS"}
              </p>
              <p className="text-xs text-muted-foreground">
                {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)} ·{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </div>
    </CitizenShell>
  );
}
