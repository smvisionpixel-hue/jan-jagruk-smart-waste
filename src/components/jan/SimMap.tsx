import { cn } from "@/lib/utils";
import type { Hotspot, Priority } from "@/lib/jan-jagruk-data";

const dotColor: Record<Priority, string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-primary",
};

const ringColor: Record<Priority, string> = {
  high: "bg-danger/25",
  medium: "bg-warning/25",
  low: "bg-primary/20",
};

export function MapCanvas({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("map-surface relative w-full overflow-hidden rounded-2xl border", className)}>
      <div className="map-grid absolute inset-0" />
      <div className="absolute inset-0">
        <div className="absolute left-0 right-0 top-[52%] h-3 -rotate-2 bg-foreground/10" />
        <div className="absolute bottom-0 left-[46%] top-0 w-3 rotate-3 bg-foreground/10" />
        <div className="absolute left-[8%] right-[40%] top-[24%] h-2 rotate-6 bg-foreground/[0.07]" />
      </div>
      {children}
      <span className="absolute bottom-2 right-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Simulated map · prototype
      </span>
    </div>
  );
}

export function MapPin({
  x,
  y,
  priority,
  label,
  active,
  onClick,
}: {
  x: number;
  y: number;
  priority: Priority;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      aria-label={label}
    >
      <span className="relative flex items-center justify-center">
        <span className={cn("absolute h-10 w-10 animate-ping rounded-full", ringColor[priority])} />
        <span className={cn("absolute h-7 w-7 rounded-full", ringColor[priority])} />
        <span
          className={cn(
            "relative h-3.5 w-3.5 rounded-full ring-2 ring-card transition-transform",
            dotColor[priority],
            active && "scale-150",
          )}
        />
      </span>
      <span
        className={cn(
          "mt-1 block whitespace-nowrap rounded-full border bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur",
          active && "border-primary text-primary",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function HotspotMap({
  hotspots,
  activeId,
  onSelect,
  className,
}: {
  hotspots: Hotspot[];
  activeId?: string;
  onSelect?: (h: Hotspot) => void;
}& { className?: string }) {
  return (
    <MapCanvas className={className}>
      {hotspots.map((h) => (
        <MapPin
          key={h.id}
          x={h.x}
          y={h.y}
          priority={h.priority}
          label={`${h.area} · ${h.reports}`}
          active={activeId === h.id}
          onClick={() => onSelect?.(h)}
        />
      ))}
    </MapCanvas>
  );
}
