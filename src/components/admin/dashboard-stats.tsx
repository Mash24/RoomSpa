import { formatThb } from "@/lib/currency";
import type { AdminDashboardStats } from "@/lib/admin/types";

type Props = {
  stats: AdminDashboardStats | null;
  loading?: boolean;
};

export function DashboardStats({ stats, loading }: Props) {
  const cards = [
    { label: "Today", value: stats ? String(stats.todayCount) : "—", hint: "Appointments today" },
    {
      label: "Upcoming",
      value: stats ? String(stats.upcomingCount) : "—",
      hint: "Pending + confirmed",
    },
    {
      label: "This week",
      value: stats ? String(stats.bookingsThisWeek) : "—",
      hint: "Scheduled bookings",
    },
    {
      label: "Revenue (week)",
      value: stats ? formatThb(stats.revenueThisWeekThb) : "—",
      hint: "Paid bookings only",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="border border-border bg-surface-elevated p-5">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{card.label}</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
            {loading ? "..." : card.value}
          </p>
          <p className="mt-1 text-xs text-muted">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
