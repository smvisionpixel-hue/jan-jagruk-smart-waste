import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crosshair, Flame, ImagePlus, Loader2, Radar } from "lucide-react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { DetectionFlow, PrototypeNote, StatusBadge } from "@/components/jan/bits";
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
import { HERO_INCIDENT, STATUS_FLOW, WASTE_CATEGORIES } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report Waste — Jan Jagruk" },
      { name: "description", content: "Report a waste issue with location, category and photo evidence." },
      { property: "og:title", content: "Report Waste — Jan Jagruk" },
      { property: "og:description", content: "Submit a waste report and see related reports detected nearby." },
    ],
  }),
  component: ReportPage,
});

type Scan = "idle" | "scanning" | "found" | "incident";

function ReportPage() {
  const [located, setLocated] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Roadside Garbage");
  const [scan, setScan] = useState<Scan>("idle");
  const [submitted, setSubmitted] = useState(false);

  const detect = () => {
    setScan("scanning");
    window.setTimeout(() => setScan("found"), 1200);
    window.setTimeout(() => setScan("incident"), 2600);
  };

  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="Report Waste"
        description="Add evidence and location. The detection engine will check for related reports nearby."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-elevated space-y-6 rounded-2xl border bg-card p-6">
          <div className="space-y-2">
            <Label>Upload Evidence</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-4 py-10 text-center transition-colors hover:bg-muted">
              {photo ? (
                <img src={photo} alt="Evidence preview" className="max-h-48 rounded-xl object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Click to upload a photo of the waste</span>
                  <span className="text-xs text-muted-foreground">JPG or PNG · used for evidence similarity</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
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
                  {WASTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" readOnly value={located ? "Main Road, Kanpur" : ""} placeholder="Not detected yet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" readOnly value={located ? "26.4499" : ""} placeholder="—" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" readOnly value={located ? "80.3319" : ""} placeholder="—" />
            </div>
          </div>

          <Button type="button" variant="outline" onClick={() => setLocated(true)}>
            <Crosshair className="mr-2 h-4 w-4" /> Use Current Location
          </Button>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={4} placeholder="Describe what you are seeing at this location…" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={detect} disabled={scan === "scanning"}>
              {scan === "scanning" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Radar className="mr-2 h-4 w-4" />
              )}
              Detect Nearby Reports
            </Button>
            <Button type="button" variant="secondary" onClick={() => setSubmitted(true)}>
              Submit report
            </Button>
          </div>

          {scan !== "idle" ? (
            <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
              {scan === "scanning" ? (
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" /> 🔍 Searching nearby reports…
                </p>
              ) : null}
              {scan !== "scanning" ? (
                <p className="text-sm font-semibold text-foreground">7 related reports found within this area.</p>
              ) : null}
              {scan === "incident" ? (
                <div className="rounded-xl border border-danger/40 bg-danger/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-danger">
                    <Flame className="h-4 w-4" /> 10 related reports detected
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Waste incident created automatically — Incident #{HERO_INCIDENT.number}, {HERO_INCIDENT.confidence}%
                    detection confidence.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/admin/incidents/$id" params={{ id: HERO_INCIDENT.id }}>
                      View incident
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {submitted ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-primary">Report submitted. Tracking ID #111</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_FLOW.map((s, i) => (
                  <StatusBadge key={s.key} status={s.label} className={i > 2 ? "opacity-40" : ""} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">📍 Location preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {located ? "Main Road, Kanpur · 26.4499, 80.3319" : "Tap “Use Current Location” to place your marker"}
            </p>
            <MapCanvas className="mt-4 h-64">
              {located ? <Pin x={48} y={50} priority="low" label="You" /> : null}
              <Pin x={62} y={40} priority="high" label="Reported waste" />
              <Pin x={34} y={62} priority="medium" label="Nearby report" />
              <Pin x={72} y={70} priority="medium" label="Nearby report" />
            </MapCanvas>
            <PrototypeNote>Simulated map and coordinates for the prototype demo.</PrototypeNote>
          </div>

          <div className="card-elevated rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Detection pipeline</p>
            <DetectionFlow
              className="mt-4"
              steps={[
                { label: "Your report" },
                { label: "GPS proximity analysis" },
                { label: "Waste category matching" },
                { label: "Image / evidence similarity" },
                { label: "🔥 Waste incident detected", highlight: true },
              ]}
            />
          </div>
        </div>
      </div>
    </CitizenShell>
  );
}
