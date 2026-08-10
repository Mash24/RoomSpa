"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { whatsappHref } from "@/content/site";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatLink = { label: string; href: string };

const STARTERS = [
  "Is tantric massage only for men?",
  "What’s the difference between Nuru and Body-to-Body?",
  "Can you come to my hotel tonight?",
  "How do payments work?",
  "What’s your cancellation policy?",
] as const;

const WELCOME =
  "Hi — I’m the RoomSpa concierge. Ask anything about our services, prices, booking, coverage, or policies. I pull answers from the RoomSpa website.\n\nPrefer a person? Tap Talk to Live Agent anytime.";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "ticket">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [links, setLinks] = useState<ChatLink[]>([]);
  const [suggestTicket, setSuggestTicket] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [ticketDone, setTicketDone] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, mode, suggestTicket]);

  function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLinks([]);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, pagePath: pathname }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Chat unavailable.");

        setMessages((current) => [
          ...current,
          { role: "assistant", content: String(data.reply || "") },
        ]);
        setSuggestTicket(Boolean(data.suggestTicket));
        setLinks(Array.isArray(data.links) ? data.links : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat unavailable.");
      }
    });
  }

  function openTicketForm() {
    setMode("ticket");
    setError(null);
    if (!ticketMessage) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      setTicketMessage(lastUser?.content || "I’d like to talk to a live agent / customer care.");
    }
  }

  function submitTicket(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName,
            guestPhone,
            guestEmail,
            subject: "Talk to Live Agent",
            message: ticketMessage,
            pagePath: pathname,
            transcript: messages,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not reach customer care.");

        setTicketDone(String(data.referenceCode));
        setMode("chat");
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: `You’re connected to customer care. Ticket ${data.referenceCode} is open — our team was emailed and will follow up soon. WhatsApp is also available if you need something faster.`,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach customer care.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="roomspa-chat-panel"
        className="fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg shadow-black/20 transition hover:opacity-90"
      >
        <span aria-hidden className="text-base leading-none">
          ✦
        </span>
        {open ? "Close" : "Ask RoomSpa"}
      </button>

      {open ? (
        <div
          id="roomspa-chat-panel"
          className="fixed bottom-[max(9.5rem,calc(env(safe-area-inset-bottom)+8.75rem))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-[min(34rem,72svh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-sm border border-border bg-background shadow-2xl shadow-black/25"
        >
          <div className="border-b border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Concierge
            </p>
            <p className="mt-1 font-display text-xl tracking-tight text-foreground">
              Private help · Chiang Mai
            </p>
            <button
              type="button"
              onClick={openTicketForm}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
            >
              Talk to Live Agent
            </button>
            <p className="mt-1.5 text-center text-[0.7rem] text-muted">
              Or Talk to customer care — we email the team instantly
            </p>
          </div>

          {mode === "chat" ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={
                      message.role === "user"
                        ? "ml-8 rounded-sm bg-accent/15 px-3 py-2 text-sm text-foreground"
                        : "mr-4 rounded-sm bg-surface px-3 py-2 text-sm leading-relaxed text-foreground"
                    }
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}

                {messages.length <= 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {STARTERS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => send(starter)}
                        className="rounded-sm border border-border px-2.5 py-1.5 text-left text-xs text-muted transition hover:border-accent hover:text-accent"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                ) : null}

                {links.length ? (
                  <div className="flex flex-wrap gap-2">
                    {links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="rounded-sm border border-accent/40 px-2.5 py-1.5 text-xs font-medium text-accent"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}

                {suggestTicket && !ticketDone ? (
                  <button
                    type="button"
                    onClick={openTicketForm}
                    className="w-full rounded-sm border border-border px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-accent"
                  >
                    Talk to Live Agent
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      Talk to customer care — we’ll email the team
                    </span>
                  </button>
                ) : null}

                {ticketDone ? (
                  <p className="text-xs text-muted">
                    Ticket {ticketDone} sent to customer care email.
                  </p>
                ) : null}

                <div ref={bottomRef} />
              </div>

              {error ? <p className="px-4 text-xs text-red-600">{error}</p> : null}

              <form
                className="border-t border-border p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  send(input);
                }}
              >
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask anything about RoomSpa…"
                    className="min-h-11 flex-1 border border-border bg-surface-elevated px-3 text-sm text-foreground outline-none focus:border-accent"
                    disabled={pending}
                  />
                  <button
                    type="submit"
                    disabled={pending || !input.trim()}
                    className="min-h-11 rounded-sm bg-accent px-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <button
                    type="button"
                    onClick={openTicketForm}
                    className="font-medium text-accent transition hover:opacity-80"
                  >
                    Talk to Live Agent
                  </button>
                  <span className="text-border" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={openTicketForm}
                    className="text-muted transition hover:text-accent"
                  >
                    Talk to customer care
                  </button>
                  <span className="text-border" aria-hidden>
                    ·
                  </span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition hover:text-accent"
                  >
                    WhatsApp
                  </a>
                </div>
              </form>
            </>
          ) : (
            <form onSubmit={submitTicket} className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="font-display text-2xl tracking-tight text-foreground">
                Talk to Live Agent
              </p>
              <p className="mt-1 text-sm text-muted">
                Talk to customer care — leave your details and we’ll email the team right away.
              </p>
              <label className="mt-4 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Name</span>
                <input
                  required
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-surface-elevated px-3 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  WhatsApp / phone
                </span>
                <input
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-surface-elevated px-3 text-sm"
                  placeholder="+66…"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Email (optional)</span>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-surface-elevated px-3 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Message</span>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(event) => setTicketMessage(event.target.value)}
                  className="mt-1.5 block w-full border border-border bg-surface-elevated px-3 py-2 text-sm"
                />
              </label>
              {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("chat")}
                  className="min-h-11 flex-1 border border-border px-3 text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-11 flex-1 bg-accent px-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
                >
                  Send to customer care
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </>
  );
}
