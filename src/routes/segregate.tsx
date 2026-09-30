import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Sparkles } from "lucide-react";
import { CitizenShell, PageHeader } from "@/components/jan/CitizenShell";
import { PrototypeNote } from "@/components/jan/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/segregate")({
  head: () => ({
    meta: [
      { title: "Segregate & Earn — Jan Jagruk" },
      { name: "description", content: "Upload proof of segregated waste and earn eco points." },
      { property: "og:title", content: "Segregate & Earn — Jan Jagruk" },
      { property: "og:description", content: "AI-assisted prototype verification of waste segregation for eco points." },
    ],
  }),
  component: Segregate,
});

function Segregate() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "checking" | "verified">("idle");

  const verify = () => {
    setState("checking");
    window.setTimeout(() => setState("verified"), 1600);
  };

  return (
    <CitizenShell>
      <PageHeader
        eyebrow="Citizen"
        title="Segregate & Earn"
        description="Upload proof of properly segregated waste and earn eco points."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div className="card-elevated space-y-5 rounded-2xl border bg-card p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-4 py-12 text-center hover:bg-muted">
            {photo ? (
              <img src={photo} alt="Segregation proof" className="max-h-56 rounded-xl object-cover" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Upload proof of segregated waste</span>
                <span className="text-xs text-muted-foreground">Wet and dry waste in separate bins</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(URL.createObjectURL(f));
              }}
            />
          </label>
          <Button onClick={verify} disabled={state === "checking"} className="w-full">
            {state === "checking" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Run AI-assisted verification
          </Button>
          <PrototypeNote>AI-assisted prototype verification — results are simulated for the demo.</PrototypeNote>
        </div>

        <div className="card-elevated space-y-5 rounded-2xl border bg-card p-6">
          <p className="text-sm font-semibold">Verification result</p>
          {state === "idle" ? (
            <p className="text-sm text-muted-foreground">Upload a photo and run verification to see the result.</p>
          ) : null}
          {state === "checking" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Analysing bin separation, contamination and clarity…</p>
              <Progress value={64} />
            </div>
          ) : null}
          {state === "verified" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <p className="flex items-center gap-2 text-lg font-bold text-primary">
                  <CheckCircle2 className="h-5 w-5" /> Segregation Verified
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">+20 Eco Points</p>
                <p className="mt-1 text-xs text-muted-foreground">AI-assisted prototype verification</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["Wet waste separated", 96],
                  ["Dry waste separated", 91],
                  ["Contamination level", 8],
                ].map(([label, v]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{label}</span>
                      <span>{v}%</span>
                    </div>
                    <Progress value={Number(v)} className="mt-1" />
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/profile">View Eco Profile</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </CitizenShell>
  );
}
