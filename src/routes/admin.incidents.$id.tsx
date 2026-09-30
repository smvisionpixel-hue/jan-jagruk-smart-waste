import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Flame, Loader2 } from "lucide-react";
import { DetectionFlow, PriorityBadge, StatusBadge } from "@/components/jan/bits";
import { LeafletMap, type LiveMapPoint } from "@/components/jan/LeafletMap";
import { Button } from "@/components/ui/button";
import { getAdminIncident, getAssignmentOptions, assignIncident, updateIncidentStatus } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/incidents/$id")({
  loader: async ({ params }) => {
    try {
      const [incidentData, options] = await Promise.all([
        getAdminIncident({ data: { incidentCode: params.id } }),
        getAssignmentOptions(),
      ]);
      return { ...incidentData, options };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Incident unavailable — Jan Jagruk" }] };
    return {
      meta: [
        { title: `${loaderData.incident.incident_code} — Jan Jagruk` },
        {
          name: "description",
          content: `${loaderData.incident.report_count} related reports and operational assignment status.`,
        },
      ],
    };
  },
  component: IncidentDetail,
});

const statuses = [
  { value: "reported", label: "Reported" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
] as const;

function IncidentDetail() {
  const { incident, reports, options } = Route.useLoaderData();
  const saveStatus = useServerFn(updateIncidentStatus);
  const saveAssignment = useServerFn(assignIncident);
  const [status, setStatus] = useState(incident.status);
  const [vehicleCode, setVehicleCode] = useState(incident.vehicle_code ?? options.vehicles[0]?.vehicle_code ?? "");
  const [driverId, setDriverId] = useState(options.drivers[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mapPoints: LiveMapPoint[] = [
    {
      id: incident.incident_code,
      latitude: Number(incident.latitude),
      longitude: Number(incident.longitude),
      label: incident.incident_code,
      detail: `${incident.report_count} reports · ${incident.status}`,
      tone: "danger",
    },
    ...reports.map((report) => ({
      id: report.report_code,
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
      label: report.report_code,
      detail: report.landmark ?? report.category,
      tone: "warning" as const,
    })),
  ];

  const changeStatus = async (nextStatus: (typeof statuses)[number]["value"]) => {
    setSaving(true);
    try {
      await saveStatus({ data: { incidentCode: incident.incident_code, status: nextStatus } });
      setStatus(nextStatus);
      setMessage(`Incident status updated to ${nextStatus.replace("_", " ")}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update status.");
    } finally {
      setSaving(false);
    }
  };

  const assign = async () => {
    if (!vehicleCode || !driverId) {
      setMessage("Select both a vehicle and driver.");
      return;
    }
    setSaving(true);
    try {
      await saveAssignment({ data: { incidentCode: incident.incident_code, vehicleCode, driverId } });
      setStatus("assigned");
      setMessage("Vehicle and driver assigned. The incident is now in the Assigned queue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to assign the incident.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link to="/admin/incidents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All incidents
      </Link>

      <header className="card-elevated rounded-3xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-danger">
              <Flame className="h-4 w-4" /> Waste Incident
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{incident.incident_code}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{incident.category} · {incident.severity}</p>
            <p className="text-xs text-muted-foreground">
              {Number(incident.latitude).toFixed(6)}, {Number(incident.longitude).toFixed(6)} · {incident.report_count} related reports
            </p>
          </div>
          <div className="min-w-64 space-y-3">
            <PriorityBadge priority={incident.severity === "critical" || incident.severity === "high" ? "high" : "medium"} />
            <StatusBadge status={status.replace("_", " ")} />
            <div className="grid gap-2 sm:grid-cols-2">
              {statuses.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  variant={status === item.value ? "default" : "outline"}
                  disabled={saving}
                  onClick={() => changeStatus(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {statuses.map((item, index) => (
            <div key={item.value} className="flex items-center gap-2">
              <StatusBadge status={item.label} className={statuses.findIndex((s) => s.value === status) < index ? "opacity-40" : ""} />
              {index < statuses.length - 1 ? <span className="text-muted-foreground">→</span> : null}
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="font-semibold">Smart detection rule</p>
            <DetectionFlow
              className="mt-4"
              steps={[
                { label: `${incident.report_count} related citizen reports` },
                { label: "Haversine GPS proximity", detail: "Within 100 metres" },
                { label: "Compatible category + time window", detail: "Within previous 24 hours" },
                { label: "🔥 One incident created", detail: "Duplicate incident creation is prevented" },
              ]}
            />
          </div>
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">Vehicle assignment</p>
              {saving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Vehicle</span>
                <select className="h-10 rounded-md border bg-background px-3" value={vehicleCode} onChange={(event) => setVehicleCode(event.target.value)}>
                  <option value="">Select vehicle</option>
                  {options.vehicles.map((vehicle) => (
                    <option key={vehicle.vehicle_code} value={vehicle.vehicle_code}>
                      {vehicle.vehicle_code} · {vehicle.waste_type} · {vehicle.capacity_kg} kg
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Driver</span>
                <select className="h-10 rounded-md border bg-background px-3" value={driverId} onChange={(event) => setDriverId(event.target.value)}>
                  <option value="">Select driver</option>
                  {options.drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.display_name} · {driver.status}</option>
                  ))}
                </select>
              </label>
              <Button onClick={assign} disabled={saving}>Assign vehicle and driver</Button>
              {incident.vehicle_code ? <p className="text-xs text-muted-foreground">Current assignment: {incident.vehicle_code} · {incident.driver_name}</p> : null}
              {message ? <p className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{message}</p> : null}
            </div>
          </div>
          <LeafletMap points={mapPoints} className="h-72" />
          <p className="text-xs text-muted-foreground">Leaflet + OpenStreetMap · report and incident coordinates are loaded from PostgreSQL.</p>
        </div>

        <div id="reports" className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">{reports.length} Related Reports</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <div key={report.report_code} className="flex gap-3 rounded-xl border p-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-200 to-emerald-400 text-center text-[10px] font-semibold text-emerald-950">
                  {report.has_photo ? "Photo" : "Report"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{report.report_code}</p>
                  <p className="truncate text-xs text-muted-foreground">{report.landmark ?? "Browser GPS location"}</p>
                  <p className="text-xs text-muted-foreground">{report.category} · {report.severity}</p>
                  <StatusBadge status={report.status.replace("_", " ")} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}