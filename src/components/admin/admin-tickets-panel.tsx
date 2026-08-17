"use client";

import { useEffect, useState } from "react";

type TicketStatus = "open" | "in_progress" | "resolved" | "spam";

type CareMessage = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
};

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
  endedAt: string | null;
  endedBy: string | null;
  rating: number | null;
  ratingComment: string;
  ratingShareOk: boolean;
  createdAt: string;
  messages: CareMessage[];
};

const FILTERS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "open", label: "Waiting" },
  { value: "in_progress", label: "In chat" },
  { value: "resolved", label: "Closed" },
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
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  async function load(nextFilter = filter) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets?status=${nextFilter}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load care chats.");
      setTickets(data.tickets || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load care chats.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function patch(id: string, body: Record<string, unknown>) {
    setUpdatingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update.");
      await load();
      if (body.action === "reply") {
        setReplyDrafts((current) => ({ ...current, [id]: "" }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-foreground xs:text-4xl">Care chats</h1>
        <p className="mt-2 text-sm text-muted">
          Guests who asked for a person. Reply here — they’ll see it in the site chat (and by email
          when they left one). Closing a chat invites an optional guest rating.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`min-h-11 rounded-sm px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
              filter === item.value
                ? "bg-accent text-accent-foreground"
                : "border border-border text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading && !tickets.length ? <p className="text-sm text-muted">Loading…</p> : null}
      {!loading && tickets.length === 0 ? (
        <p className="text-sm text-muted">No chats in this view.</p>
      ) : null}

      <ul className="space-y-5">
        {tickets.map((ticket) => {
          const closed = Boolean(ticket.endedAt) || ticket.status === "resolved";
          return (
            <li key={ticket.id} className="border border-border bg-surface-elevated p-4 md:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl tracking-tight text-foreground xs:text-2xl">
                  {ticket.referenceCode}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  {ticket.status.replace("_", " ")} · {formatWhen(ticket.createdAt)}
                </p>
              </div>
              <div className="mt-2 space-y-1 text-sm text-foreground">
                <p><strong>{ticket.guestName}</strong></p>
                {ticket.guestPhone ? (
                  <p>
                    <a href={`tel:${ticket.guestPhone}`} className="text-accent">{ticket.guestPhone}</a>
                  </p>
                ) : null}
                {ticket.guestEmail ? (
                  <p>
                    <a href={`mailto:${ticket.guestEmail}`} className="break-all text-accent">{ticket.guestEmail}</a>
                  </p>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">{ticket.subject}</p>

              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto border border-border bg-background p-3">
                {(ticket.messages?.length
                  ? ticket.messages
                  : [
                      {
                        id: "seed",
                        sender: "guest",
                        body: ticket.message,
                        createdAt: ticket.createdAt,
                      },
                    ]
                ).map((message) => (
                  <div key={message.id} className="text-sm">
                    <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                      {message.sender === "guest" ? "Guest" : "You"} ·{" "}
                      {message.createdAt ? formatWhen(message.createdAt) : ""}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-foreground">{message.body}</p>
                  </div>
                ))}
              </div>

              {ticket.rating ? (
                <p className="mt-3 text-sm text-accent">
                  Guest rating: {ticket.rating}★
                  {ticket.ratingComment ? ` — “${ticket.ratingComment}”` : ""}
                  {ticket.ratingShareOk ? " · happy to share" : ""}
                </p>
              ) : null}

              {!closed ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    rows={3}
                    value={replyDrafts[ticket.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({
                        ...current,
                        [ticket.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a warm reply…"
                    className="w-full border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      disabled={updatingId === ticket.id || !(replyDrafts[ticket.id] ?? "").trim()}
                      onClick={() =>
                        void patch(ticket.id, {
                          action: "reply",
                          message: replyDrafts[ticket.id],
                        })
                      }
                      className="min-h-11 rounded-sm bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-50 sm:py-2"
                    >
                      Send reply
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => void patch(ticket.id, { action: "end" })}
                      className="rounded-sm border border-border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      End chat
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => void patch(ticket.id, { status: "spam" })}
                      className="rounded-sm border border-border px-3 py-2 text-sm text-muted disabled:opacity-50"
                    >
                      Spam
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted">
                  Closed{ticket.endedBy ? ` by ${ticket.endedBy}` : ""}
                  {ticket.endedAt ? ` · ${formatWhen(ticket.endedAt)}` : ""}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
