import { formatThb } from "@/lib/currency";
import type { AdminDashboardStats } from "@/lib/admin/types";

type Props = {
  stats: AdminDashboardStats | null;
  loading?: boolean;
};

const tones = [
  {
    shell: "from-[#2f5d50]/14 via-surface-elevated to-surface-elevated",
    chip: "bg-[#2f5d50]/12 text-[#2f5d50] dark:bg-[#7eb8a4]/15 dark:text-[#7eb8a4]",
  },
  {
    shell: "from-sky-500/12 via-surface-elevated to-surface-elevated",
    chip: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  },
  {
    shell: "from-amber-500/12 via-surface-elevated to-surface-elevated",
    chip: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  {
    shell: "from-[#25D366]/14 via-surface-elevated to-surface-elevated",
    chip: "bg-[#25D366]/15 text-[#0b6b3a] dark:text-[#7dffa8]",
  },
] as const;

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
      label: "Revenue",
      value: stats ? formatThb(stats.revenueThisWeekThb) : "—",
      hint: "Paid this week",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const tone = tones[index % tones.length];
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tone.shell} p-5 shadow-[0_1px_0_rgba(15,23,20,0.04)]`}
          >
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${tone.chip}`}
            >
              {card.label}
            </span>
            <p className="mt-3 font-display text-3xl tracking-tight text-foreground tabular-nums sm:text-4xl">
              {loading ? "…" : card.value}
            </p>
            <p className="mt-1.5 text-sm text-muted">{card.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
