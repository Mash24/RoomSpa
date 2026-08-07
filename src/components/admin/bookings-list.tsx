"use client";

import { useEffect, useState } from "react";
import { formatBookingAmount } from "@/components/payment/payment-badges";
import { formatBookingDateTime } from "@/lib/admin/dates";
import type { AdminBooking, AdminDashboardStats, BookingFilter, BookingStatus } from "@/lib/admin/types";
import { DashboardStats } from "@/components/admin/dashboard-stats";

const FILTERS: { value: BookingFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All" },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

function statusClass(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
    case "cancelled":
    case "no_show":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
  }
}

function paymentClass(paymentStatus: string) {
  return paymentStatus === "paid"
    ? "text-emerald-700 dark:text-emerald-300"
    : "text-muted";
}

type BookingsListProps = {
  bookings: AdminBooking[];
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
  updatingId: string | null;
};

export function BookingsList({ bookings, onStatusChange, updatingId }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="border border-border bg-surface-elevated p-8 text-center text-sm text-muted">
        No bookings in this view.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => (
        <li key={booking.id} className="border border-border bg-surface-elevated p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{booking.referenceCode}</span>
                <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass(booking.status)}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
                <span className={`text-xs font-medium ${paymentClass(booking.paymentStatus)}`}>
                  {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"} · {booking.paymentMethod}
                </span>
              </div>

              <div>
                <p className="font-display text-xl text-foreground">{booking.serviceName}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatBookingDateTime(booking.scheduledDate, booking.scheduledTime)}
                </p>
                <p className="mt-1 text-sm font-medium text-accent">
                  {formatBookingAmount(booking.amountThb)}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted">Guest: </span>
                  <span className="text-foreground">{booking.customerName}</span>
                </p>
                <p>
                  <span className="text-muted">Phone: </span>
                  <a href={`tel:${booking.customerPhone}`} className="text-accent">
                    {booking.customerPhone}
                  </a>
                </p>
                <p className="sm:col-span-2">
                  <span className="text-muted">Email: </span>
                  <a href={`mailto:${booking.customerEmail}`} className="text-accent">
                    {booking.customerEmail}
                  </a>
                </p>
                <p className="sm:col-span-2">
                  <span className="text-muted">Location: </span>
                  <span className="text-foreground">
                    {booking.locationType} — {booking.locationLabel}
                    {booking.locationDetails ? ` (${booking.locationDetails})` : ""}
                  </span>
                </p>
                {booking.notes ? (
                  <p className="sm:col-span-2">
                    <span className="text-muted">Notes: </span>
                    <span className="text-foreground">{booking.notes}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 lg:w-48 lg:flex-col">
              {booking.status === "pending" ? (
                <>
                  <StatusButton
                    label="Confirm"
                    disabled={updatingId === booking.id}
                    onClick={() => onStatusChange(booking.id, "confirmed")}
                  />
                  <StatusButton
                    label="Cancel"
                    variant="muted"
                    disabled={updatingId === booking.id}
                    onClick={() => onStatusChange(booking.id, "cancelled")}
                  />
                </>
              ) : null}
              {booking.status === "confirmed" ? (
                <>
                  <StatusButton
                    label="Mark completed"
                    disabled={updatingId === booking.id}
                    onClick={() => onStatusChange(booking.id, "completed")}
                  />
                  <StatusButton
                    label="Cancel"
                    variant="muted"
                    disabled={updatingId === booking.id}
                    onClick={() => onStatusChange(booking.id, "cancelled")}
                  />
                  <StatusButton
                    label="No show"
                    variant="muted"
                    disabled={updatingId === booking.id}
                    onClick={() => onStatusChange(booking.id, "no_show")}
                  />
                </>
              ) : null}
              {(booking.status === "completed" ||
                booking.status === "cancelled" ||
                booking.status === "no_show") && (
                <p className="text-xs text-muted">No actions available</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusButton({
  label,
  onClick,
  disabled,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "muted";
}) {
  const className =
    variant === "primary"
      ? "rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
      : "rounded-sm border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {label}
    </button>
  );
}

export function AdminDashboardPanel() {
  const [filter, setFilter] = useState<BookingFilter>("upcoming");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/admin/bookings", { method: "POST" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Could not load stats.");
        setStats(data.stats);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load stats.");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/admin/bookings?filter=${filter}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Could not load bookings.");
        setBookings(data.bookings || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load bookings.");
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function refreshStats() {
    try {
      const response = await fetch("/api/admin/bookings", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load stats.");
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stats.");
    }
  }

  async function onStatusChange(id: string, status: BookingStatus) {
    setUpdatingId(id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update booking.");

      setBookings((current) =>
        current.map((booking) => (booking.id === id ? { ...booking, status } : booking)),
      );
      setNotice(
        data.emailSent
          ? `Status updated to ${STATUS_LABELS[status]}. Guest was emailed.`
          : `Status updated to ${STATUS_LABELS[status]}. Email was not sent.`,
      );
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking.");
    } finally {
      setUpdatingId(null);
    }
  }

  function onFilterChange(next: BookingFilter) {
    setLoading(true);
    setFilter(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Manage appointments and track performance.</p>
      </div>

      <DashboardStats stats={stats} loading={statsLoading} />

      {stats && stats.pendingCount > 0 ? (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {stats.pendingCount} booking{stats.pendingCount === 1 ? "" : "s"} waiting for confirmation.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={
              filter === item.value
                ? "rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                : "rounded-sm border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading bookings...</p>
      ) : (
        <BookingsList bookings={bookings} onStatusChange={onStatusChange} updatingId={updatingId} />
      )}
    </div>
  );
}
