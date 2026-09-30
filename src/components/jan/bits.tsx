import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/jan-jagruk-data";
import type { LucideIcon } from "lucide-react";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const map: Record<Priority, string> = {
    high: "bg-danger/10 text-danger border-danger/30",
    medium: "bg-warning/15 text-warning-foreground border-warning/40",
    low: "bg-primary/10 text-primary border-primary/30",
  };
  const dot: Record<Priority, string> = {
    high: "bg-danger",
    medium: "bg-warning",
    low: "bg-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        map[priority],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[priority])} />
      {priority} priority
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = status.toLowerCase();
  const tone = s.includes("resolved")
    ? "bg-primary/10 text-primary border-primary/30"
    : s.includes("progress") || s.includes("assigned")
      ? "bg-warning/15 text-warning-foreground border-warning/40"
      : s.includes("needs") || s.includes("awaiting")
        ? "bg-danger/10 text-danger border-danger/30"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tone, className)}>
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "warning" | "danger";
}) {
  const tone =
    accent === "danger"
      ? "bg-danger/10 text-danger"
      : accent === "warning"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-primary/10 text-primary";
  return (
    <div className="card-elevated rounded-2xl border bg-card p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tone)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function DetectionFlow({
  steps,
  className,
}: {
  steps: { label: string; detail?: string; highlight?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      {steps.map((s, i) => (
        <div key={s.label} className="grid gap-3">
          <div
            className={cn(
              "rounded-2xl border px-4 py-3",
              s.highlight ? "border-danger/40 bg-danger/5" : "bg-card",
            )}
          >
            <p className={cn("text-sm font-semibold", s.highlight ? "text-danger" : "text-foreground")}>{s.label}</p>
            {s.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p> : null}
          </div>
          {i < steps.length - 1 ? (
            <div className="flex justify-center text-muted-foreground" aria-hidden>
              ↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PrototypeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{children}</p>
  );
}
