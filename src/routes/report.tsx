import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Crosshair, Flame, ImagePlus, Loader2, Radar } from "lucide-react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { DetectionFlow, StatusBadge } from "@/components/jan/bits";
import { MapCanvas, MapPin as Pin } from "@/components/jan/SimMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_FLOW, WASTE_CATEGORIES } from "@/lib/jan-jagruk-data";
import { createWasteReport } from "@/lib/report.server";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report Waste — Jan Jagruk" },
      {
        name: "description",
        content: "Report a waste issue with location, category and photo evidence.",
      },
      { property: "og:title", content: "Report Waste — Jan Jagruk" },
      {
        property: "og:description",
        content: "Submit a waste report and see related reports detected nearby.",
      },
    ],
  }),
  component: ReportPage,
});

type Scan = "idle" | "scanning" | "found" | "incident";

function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(new Error("Unable to read the selected image.")));
    reader.readAsDataURL(file);
  });
}

function ReportPage() {
  const submitReport = useServerFn(createWasteReport);
  const [located, setLocated] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Wet Waste");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [scan, setScan] = useState<Scan>("idle");
  const [result, setResult] = useState<Awaited<ReturnType<typeof createWasteReport>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = () => {
    if (!navigator.geolocation) {
      setError("This browser does not provide geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocated({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setError(null);
      },
      () => setError("Location permission was not granted. Enable it and try again."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const submit = async () => {
    if (!located) {
      setError("Use your current location before submitting the report.");
      return;
    }
    if (description.trim().length < 3) {
      setError("Add a short description so the operations team can verify the report.");
      return;
    }

    setError(null);
    setScan("scanning");
    try {
      const next = await submitReport({
        data: {
          category,
          severity,
          landmark,
          description,
          latitude: located.latitude,
          longitude: located.longitude,
          photoDataUrl: photo ?? undefined,
        },
      });
      setResult(next);
      setScan(next.incident ? "incident" : "found");
    } catch (submissionError) {
      setScan("idle");
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to submit the report.",
      );
    }
  };

  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="Report Waste"
        description="Add evidence and location. The detection engine checks nearby reports within 100 metres and 24 hours."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-elevated space-y-6 rounded-2xl border bg-card p-6">
          <div className="space-y-2">
            <Label>Upload Evidence</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-4 py-10 text-center transition-colors hover:bg-muted">
              {photo ? (
                <img
                  src={photo}
                  alt="Evidence preview"
                  className="max-h-48 rounded-xl object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Click to upload a photo of the waste</span>
                  <span className="text-xs text-muted-foreground">
                    JPG or PNG · stored with this report
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1_800_000) {
                    setError("Please choose an image smaller than 1.8 MB.");
                    return;
                  }
                  try {
                    setPhoto(await readPhoto(file));
                    setError(null);
                  } catch {
                    setError("Unable to read the selected image.");
                  }
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Waste Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as typeof severity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="Nearby landmark or street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                readOnly
                value={located?.latitude.toFixed(6) ?? ""}
                placeholder="Not detected yet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                readOnly
                value={located?.longitude.toFixed(6) ?? ""}
                placeholder="Not detected yet"
              />
            </div>
          </div>

          <Button type="button" variant="outline" onClick={locate}>
            <Crosshair className="mr-2 h-4 w-4" /> Use My Current Location
          </Button>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what you are seeing at this location…"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={submit} disabled={scan === "scanning"}>
              {scan === "scanning" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Radar className="mr-2 h-4 w-4" />
              )}
              Submit & Detect Nearby Reports
            </Button>
          </div>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {result ? (
            <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm font-semibold">
                Report submitted · <span className="text-primary">{result.reportCode}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {result.relatedCount} related report{result.relatedCount === 1 ? "" : "s"} found
                within {result.rule.radiusMeters} metres.
              </p>
              {result.incident ? (
                <div className="rounded-xl border border-danger/40 bg-danger/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-danger">
                    <Flame className="h-4 w-4" /> Waste incident created
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.incident.incidentCode} · {result.incident.reportCount} supporting
                    reports.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/admin/incidents">View incidents</Link>
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((status, index) => (
                  <StatusBadge
                    key={status.key}
                    status={status.label}
                    className={index > (result.incident ? 2 : 0) ? "opacity-40" : ""}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">📍 Location preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {located
                ? `${located.latitude.toFixed(5)}, ${located.longitude.toFixed(5)}`
                : "Tap “Use My Current Location” to place your marker"}
            </p>
            <MapCanvas className="mt-4 h-64">
              {located ? <Pin x={48} y={50} priority="low" label="You" /> : null}
              <Pin x={62} y={40} priority="high" label="Reported waste" />
              <Pin x={34} y={62} priority="medium" label="Nearby report" />
              <Pin x={72} y={70} priority="medium" label="Nearby report" />
            </MapCanvas>
            <p className="mt-3 rounded-xl border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Browser GPS Demo Tracking · coordinates are captured from this browser and saved with
              the report.
            </p>
          </div>

          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Detection pipeline</p>
            <DetectionFlow
              className="mt-4"
              steps={[
                { label: "Your report" },
                { label: "100 m GPS proximity analysis" },
                { label: "Category + 24 hour matching" },
                { label: "Transparent related-report score" },
                { label: "🔥 Automatic incident at 10 reports", highlight: true },
              ]}
            />
          </div>
        </div>
      </div>
    </CitizenShell>
  );
}
