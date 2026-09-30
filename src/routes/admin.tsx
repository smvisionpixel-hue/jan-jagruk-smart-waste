import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  Coins,
  Flame,
  LayoutDashboard,
  Leaf,
  MapPinned,
  Radar,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/detection", label: "Smart Detection", icon: Radar, exact: false },
  { to: "/admin/incidents", label: "Waste Incidents", icon: Flame, exact: false },
  { to: "/admin/hotspots", label: "Waste Hotspots", icon: MapPinned, exact: false },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/admin/pickups", label: "Pickup Management", icon: Truck, exact: false },
  { to: "/admin/points", label: "User Points Audit", icon: Coins, exact: false },
] as const;

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar px-3 py-5 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold">Jan Jagruk</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Admin Console
            </span>
          </span>
        </Link>
        <nav className="mt-6 grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border bg-card p-3 text-xs text-muted-foreground">
          Detection is server-side. GPS is clearly labeled Browser GPS Demo Tracking until a vehicle
          telematics service is connected.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur">
          <div className="flex h-14 items-center gap-2 overflow-x-auto px-4">
            <Link to="/" className="mr-2 shrink-0 text-sm font-bold lg:hidden">
              Jan Jagruk
            </Link>
            <nav className="flex items-center gap-1 lg:hidden">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact }}
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link to="/dashboard" className="ml-auto shrink-0 text-sm font-medium text-primary">
              Citizen view
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
