import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Activity, CheckCircle2, MapPinned, Users } from "lucide-react";
import { SectionTitle, StatCard } from "@/components/jan/bits";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CATEGORY_BREAKDOWN, PLATFORM_STATS, WEEKLY_TREND } from "@/lib/jan-jagruk-data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Jan Jagruk Admin" },
      { name: "description", content: "Reports by category, incident trends and citizen participation." },
      { property: "og:title", content: "Analytics — Jan Jagruk Admin" },
      { property: "og:description", content: "Waste analytics across categories, incidents and hotspots." },
    ],
  }),
  component: Analytics,
});

const chartConfig = {
  reports: { label: "Reports", color: "var(--chart-1)" },
  incidents: { label: "Incidents", color: "var(--chart-4)" },
};

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function Analytics() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <SectionTitle title="Analytics" subtitle="Reporting performance for the Kanpur zone" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Incidents" value={16} icon={Activity} accent="danger" />
        <StatCard label="Resolved Incidents" value={8} icon={CheckCircle2} />
        <StatCard label="Waste Hotspots" value={PLATFORM_STATS.activeHotspots} icon={MapPinned} accent="warning" />
        <StatCard label="Citizen Participation" value="1,248" icon={Users} hint="Active reporters this month" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">Reports by category</p>
          <ChartContainer config={chartConfig} className="mt-4 h-72 w-full">
            <BarChart data={CATEGORY_BREAKDOWN} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} tickFormatter={(v: string) => v.split(" ")[0]} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="reports" fill="var(--color-reports)" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="card-elevated rounded-2xl border bg-card p-5">
          <p className="font-semibold">Category share</p>
          <ChartContainer config={chartConfig} className="mt-4 h-72 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={CATEGORY_BREAKDOWN} dataKey="reports" nameKey="category" innerRadius={60} outerRadius={100}>
                {CATEGORY_BREAKDOWN.map((entry, i) => (
                  <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {CATEGORY_BREAKDOWN.map((c, i) => (
              <span key={c.category} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.category} · {c.reports}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-elevated rounded-2xl border bg-card p-5">
        <p className="font-semibold">Weekly reports vs detected incidents</p>
        <ChartContainer config={chartConfig} className="mt-4 h-72 w-full">
          <LineChart data={WEEKLY_TREND} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="reports" stroke="var(--color-reports)" strokeWidth={2.5} dot={false} />
            <Line dataKey="incidents" stroke="var(--color-incidents)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
