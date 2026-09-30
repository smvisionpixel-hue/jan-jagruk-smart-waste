import { Link } from "@tanstack/react-router";
import { Leaf, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/report", label: "Report Waste" },
  { to: "/my-reports", label: "My Reports" },
  { to: "/hotspots", label: "Nearby Hotspots" },
  { to: "/segregate", label: "Segregate & Earn" },
  { to: "/profile", label: "Eco Profile" },
] as const;

export function CitizenShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">Jan Jagruk</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Awareness Meets Action
              </span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className={cn("rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/admin">Admin Console</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {open ? (
          <nav className="grid gap-1 border-t bg-card px-4 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary">
              Admin Console
            </Link>
          </nav>
        ) : null}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jan Jagruk · Civic waste intelligence</p>
          <p className="text-xs">AI-assisted prototype · simulated detection layer, not connected to live AI or GPS services</p>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-card px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="mx-auto w-full max-w-7xl sm:mx-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
