"use client";

import { useEffect, useState } from "react";

type TicketStatus = "open" | "in_progress" | "resolved" | "spam";

type AdminTicket = {
  id: string;
  referenceCode: string;
  status: TicketStatus | string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  subject: string;
  message: string;
  pagePath: string | null;
  transcript: { role: string; content: string }[];
  adminNotes: string;
  createdAt: string;
};

const FILTERS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "spam", label: "Spam" },
  { value: "all", label: "All" },
];

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminTicketsPanel() {
  const [filter, setFilter] = useState<TicketStatus | "all">("open");
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const response = await fetch(`/api/admin/tickets?status=${filter}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Could not load tickets.");
        setTickets(data.tickets || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load tickets.");
          setTickets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function setStatus(id: string, status: TicketStatus) {
    setUpdatingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update ticket.");

      setTickets((current) =>
        filter === "all"
          ? current.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket))
          : current.filter((ticket) => ticket.id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update ticket.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-foreground">Tickets</h1>
        <p className="mt-2 text-sm text-muted">
          Guest handoffs from the site concierge. Opening a ticket emails{" "}
          <code className="text-xs">EMAIL_OPS_NOTIFY</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading…</p> : null}

      {!loading && tickets.length === 0 ? (
        <p className="text-sm text-muted">No tickets in this view.</p>
      ) : null}

      <ul className="space-y-4">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="border border-border bg-surface-elevated p-4 md:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-2xl tracking-tight text-foreground">
                {ticket.referenceCode}
              </p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                {ticket.status.replace("_", " ")} · {formatWhen(ticket.createdAt)}
              </p>
            </div>
            <p className="mt-2 text-sm text-foreground">
              <strong>{ticket.guestName}</strong>
              {ticket.guestPhone ? ` · ${ticket.guestPhone}` : ""}
              {ticket.guestEmail ? ` · ${ticket.guestEmail}` : ""}
            </p>
            <p className="mt-1 text-sm text-muted">{ticket.subject}</p>
            {ticket.pagePath ? (
              <p className="mt-1 text-xs text-muted">From {ticket.pagePath}</p>
            ) : null}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {ticket.message}
            </p>
            {ticket.transcript?.length ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-muted">
                  Chat transcript
                </summary>
                <div className="mt-2 space-y-2 border border-border bg-background p-3">
                  {ticket.transcript.map((line, index) => (
                    <p key={index} className="text-xs leading-relaxed text-muted">
                      <strong className="text-foreground">
                        {line.role === "user" ? "Guest" : "Bot"}:
                      </strong>{" "}
                      {line.content}
                    </p>
                  ))}
                </div>
              </details>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.status !== "in_progress" ? (
                <button
                  type="button"
                  disabled={updatingId === ticket.id}
                  onClick={() => void setStatus(ticket.id, "in_progress")}
                  className="rounded-sm border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  In progress
                </button>
              ) : null}
              {ticket.status !== "resolved" ? (
                <button
                  type="button"
                  disabled={updatingId === ticket.id}
                  onClick={() => void setStatus(ticket.id, "resolved")}
                  className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
                >
                  Resolve
                </button>
              ) : null}
              {ticket.status !== "spam" ? (
                <button
                  type="button"
                  disabled={updatingId === ticket.id}
                  onClick={() => void setStatus(ticket.id, "spam")}
                  className="rounded-sm border border-border px-3 py-2 text-sm text-muted disabled:opacity-50"
                >
                  Spam
                </button>
              ) : null}
              {ticket.status !== "open" ? (
                <button
                  type="button"
                  disabled={updatingId === ticket.id}
                  onClick={() => void setStatus(ticket.id, "open")}
                  className="rounded-sm border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Reopen
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
