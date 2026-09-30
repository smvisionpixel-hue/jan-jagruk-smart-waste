import { createFileRoute, Link } from "@tanstack/react-router";
import { PriorityBadge, SectionTitle, StatusBadge } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { getAdminIncidents } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/incidents/")({
  loader: () => getAdminIncidents(),
  head: () => ({
    meta: [
      { title: "Waste Incidents — Jan Jagruk" },
      { name: "description", content: "All detected waste incidents with confidence, priority and status." },
      { property: "og:title", content: "Waste Incidents — Jan Jagruk" },
      { property: "og:description", content: "Every clustered waste incident across the city zone." },
    ],
  }),
  component: IncidentsList,
});

function IncidentsList() {
  const { incidents } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle title="Waste Incidents" subtitle="Clusters raised by the smart detection engine" />
      <div className="card-elevated overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Reports</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{i.incident_code}</td>
                <td className="px-4 py-3">{i.category}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {Number(i.latitude).toFixed(4)}, {Number(i.longitude).toFixed(4)}
                </td>
                <td className="px-4 py-3">{i.report_count}</td>
                <td className="px-4 py-3 font-medium">{i.severity}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={i.severity === "critical" || i.severity === "high" ? "high" : "medium"} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={i.status.replace("_", " ")} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/incidents/$id" params={{ id: i.incident_code }}>
                      Open
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
