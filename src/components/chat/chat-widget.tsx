"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { whatsappHref } from "@/content/site";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatLink = { label: string; href: string };
type CareMessage = { id?: string; sender: string; body: string; createdAt?: string };
type Mode = "chat" | "careForm" | "live" | "rate" | "done";

const STORAGE_KEY = "roomspa_care_session";

const STARTERS = [
  "Is tantric only for men?",
  "Nuru or body-to-body — what’s the difference?",
  "Can you come to my hotel tonight?",
  "How do I pay?",
] as const;

const WELCOME =
  "Welcome to RoomSpa. Ask about private sessions, booking, coverage, or anything that helps you unwind tonight.\n\nPrefer a real person? Talk to our care team anytime — we’re here for you.";

type CareSession = {
  referenceCode: string;
  guestToken: string;
};

function loadSession(): CareSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CareSession;
    if (parsed?.referenceCode && parsed?.guestToken) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(session: CareSession | null) {
  try {
    if (!session) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [links, setLinks] = useState<ChatLink[]>([]);
  const [suggestCare, setSuggestCare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [session, setSession] = useState<CareSession | null>(null);
  const [careMessages, setCareMessages] = useState<CareMessage[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [shareOk, setShareOk] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = loadSession();
    if (existing) {
      setSession(existing);
      setMode("live");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, mode, careMessages, suggestCare]);

  useEffect(() => {
    if (mode !== "live" || !session) return;

    let cancelled = false;

    async function refresh() {
      if (!session) return;
      try {
        const response = await fetch(
          `/api/chat/ticket/${encodeURIComponent(session.referenceCode)}?token=${encodeURIComponent(session.guestToken)}`,
        );
        const data = await response.json();
        if (cancelled || !response.ok) return;
        const ticket = data.ticket;
        setCareMessages(Array.isArray(ticket?.messages) ? ticket.messages : []);
        if (ticket?.endedAt || ticket?.status === "resolved") {
          if (ticket?.rating) {
            saveSession(null);
            setSession(null);
            setMode("done");
          } else {
            // Keep session until optional rating is sent.
            setMode("rate");
          }
        }
      } catch {
        /* quiet poll */
      }
    }

    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [mode, session]);

  function openCareForm() {
    setMode("careForm");
    setError(null);
    if (!ticketMessage) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      setTicketMessage(lastUser?.content || "I’d love a little help from your care team.");
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    if (mode === "live" && session) {
      setInput("");
      setError(null);
      startTransition(async () => {
        try {
          const response = await fetch(
            `/api/chat/ticket/${encodeURIComponent(session.referenceCode)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "message",
                token: session.guestToken,
                message: content,
              }),
            },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Could not send.");
          setCareMessages((current) => [
            ...current,
            { sender: "guest", body: content, createdAt: new Date().toISOString() },
          ]);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not send.");
        }
      });
      return;
    }

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
        if (!response.ok) throw new Error(data.error || "Something went quiet for a moment.");

        setMessages((current) => [
          ...current,
          { role: "assistant", content: String(data.reply || "") },
        ]);
        setSuggestCare(Boolean(data.suggestTicket));
        setLinks(Array.isArray(data.links) ? data.links : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went quiet for a moment.");
      }
    });
  }

  function submitCareForm(event: React.FormEvent) {
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
            subject: "Care team request",
            message: ticketMessage,
            pagePath: pathname,
            transcript: messages,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not reach the care team.");

        if (data.guestToken && data.referenceCode) {
          const next = {
            referenceCode: String(data.referenceCode),
            guestToken: String(data.guestToken),
          };
          saveSession(next);
          setSession(next);
          setCareMessages([{ sender: "guest", body: ticketMessage }]);
          setMode("live");
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: `You’re with our care team now (${data.referenceCode}). We’ll reply here — usually quite quickly in the evenings.`,
            },
          ]);
        } else {
          setMode("chat");
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: `We’ve alerted the care team (${data.referenceCode}). Keep an eye on WhatsApp or email — someone will be with you soon.`,
            },
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach the care team.");
      }
    });
  }

  function beginEndChat() {
    setMode("rate");
    setError(null);
  }

  function submitRating(event: React.FormEvent) {
    event.preventDefault();
    if (!session && mode === "rate") {
      // Admin may have ended already — just thank them locally.
      setMode("done");
      return;
    }
    if (!session) return;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/chat/ticket/${encodeURIComponent(session.referenceCode)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "end",
              token: session.guestToken,
              rating,
              comment: ratingComment,
              shareOk,
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not close the chat.");
        saveSession(null);
        setSession(null);
        setMode("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not close the chat.");
      }
    });
  }

  function skipRating() {
    if (!session) {
      setMode("done");
      return;
    }
    startTransition(async () => {
      try {
        await fetch(`/api/chat/ticket/${encodeURIComponent(session.referenceCode)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "end",
            token: session.guestToken,
            rating: null,
            comment: "",
            shareOk: false,
          }),
        });
      } catch {
        /* still close locally */
      }
      saveSession(null);
      setSession(null);
      setMode("done");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="roomspa-chat-panel"
        className="fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-[max(1rem,env(safe-area-inset-right))] z-50 inline-flex min-h-12 max-w-[calc(100vw-5.5rem)] items-center gap-2 rounded-full border border-border bg-foreground px-3.5 py-3 text-sm font-medium text-background shadow-lg shadow-black/20 transition hover:opacity-90 xs:right-[max(1.25rem,env(safe-area-inset-right))] xs:px-4"
      >
        <span aria-hidden className="text-base leading-none">
          ✦
        </span>
        <span className="truncate">{open ? "Close" : "Ask RoomSpa"}</span>
      </button>

      {open ? (
        <div
          id="roomspa-chat-panel"
          className="fixed inset-x-3 bottom-[max(9.25rem,calc(env(safe-area-inset-bottom)+8.5rem))] z-50 flex h-[min(34rem,calc(100svh-11.25rem))] max-h-[calc(100dvh-11.25rem)] flex-col overflow-hidden rounded-sm border border-border bg-background shadow-2xl shadow-black/25 sm:inset-x-auto sm:right-[max(1.25rem,env(safe-area-inset-right))] sm:h-[min(34rem,72svh)] sm:w-[min(24rem,calc(100vw-1.5rem))] sm:max-h-none"
        >
          <div className="border-b border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              RoomSpa
            </p>
            <p className="mt-1 font-display text-xl tracking-tight text-foreground">
              Private help · Chiang Mai
            </p>
            {mode === "chat" || mode === "careForm" ? (
              <>
                <button
                  type="button"
                  onClick={openCareForm}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  Talk to our care team
                </button>
                <p className="mt-1.5 text-center text-[0.7rem] text-muted">
                  A real person — warm, discreet, and nearby
                </p>
              </>
            ) : null}
            {mode === "live" ? (
              <button
                type="button"
                onClick={beginEndChat}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-border px-3 text-sm text-foreground transition hover:border-accent"
              >
                End this chat
              </button>
            ) : null}
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

                {suggestCare ? (
                  <button
                    type="button"
                    onClick={openCareForm}
                    className="w-full rounded-sm border border-border px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-accent"
                  >
                    Talk to our care team
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      We’ll look after you personally
                    </span>
                  </button>
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
                    placeholder="Ask us anything…"
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
                    onClick={openCareForm}
                    className="font-medium text-accent transition hover:opacity-80"
                  >
                    Talk to our care team
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
          ) : null}

          {mode === "careForm" ? (
            <form onSubmit={submitCareForm} className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="font-display text-2xl tracking-tight text-foreground">
                Talk to our care team
              </p>
              <p className="mt-1 text-sm text-muted">
                Leave a note — someone from RoomSpa will join this chat and look after you.
              </p>
              <label className="mt-4 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Your name</span>
                <input
                  required
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-surface-elevated px-3 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">WhatsApp</span>
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
                <span className="text-xs uppercase tracking-[0.14em] text-muted">How can we help?</span>
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
                  Connect me
                </button>
              </div>
            </form>
          ) : null}

          {mode === "live" ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                <p className="text-xs text-muted">
                  Care chat {session?.referenceCode} · replies appear here
                </p>
                {careMessages.map((message, index) => (
                  <div
                    key={message.id || `${message.sender}-${index}`}
                    className={
                      message.sender === "guest"
                        ? "ml-8 rounded-sm bg-accent/15 px-3 py-2 text-sm text-foreground"
                        : "mr-4 rounded-sm bg-surface px-3 py-2 text-sm leading-relaxed text-foreground"
                    }
                  >
                    <p className="mb-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                      {message.sender === "guest" ? "You" : "Care team"}
                    </p>
                    <p className="whitespace-pre-wrap">{message.body}</p>
                  </div>
                ))}
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
                    placeholder="Message the care team…"
                    className="min-h-11 flex-1 border border-border bg-surface-elevated px-3 text-sm outline-none focus:border-accent"
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
              </form>
            </>
          ) : null}

          {mode === "rate" ? (
            <form onSubmit={submitRating} className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="font-display text-2xl tracking-tight text-foreground">
                How was this chat?
              </p>
              <p className="mt-2 text-sm text-muted">
                Totally optional — a star or two helps us look after the next guest.
              </p>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={
                      rating === value
                        ? "min-h-11 min-w-11 rounded-sm bg-accent text-sm font-medium text-accent-foreground"
                        : "min-h-11 min-w-11 rounded-sm border border-border text-sm"
                    }
                    aria-label={`${value} stars`}
                  >
                    {value}★
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  A few words (optional)
                </span>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                  className="mt-1.5 block w-full border border-border bg-surface-elevated px-3 py-2 text-sm"
                  placeholder="Warm, clear, discreet…"
                />
              </label>
              <label className="mt-3 flex items-start gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={shareOk}
                  onChange={(event) => setShareOk(event.target.checked)}
                  className="mt-1"
                />
                <span>Happy for us to share this on our guest stories (after a quick review).</span>
              </label>
              {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={skipRating}
                  className="min-h-11 flex-1 border border-border px-3 text-sm"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-11 flex-1 bg-accent px-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
                >
                  Send & close
                </button>
              </div>
            </form>
          ) : null}

          {mode === "done" ? (
            <div className="flex flex-1 flex-col justify-center p-6 text-center">
              <p className="font-display text-3xl tracking-tight text-foreground">Thank you</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                We’re glad we could help. Whenever you’re ready, RoomSpa is here for your next quiet
                evening in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("chat");
                  setMessages([{ role: "assistant", content: WELCOME }]);
                  setSuggestCare(false);
                  setLinks([]);
                }}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground"
              >
                Ask something else
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
