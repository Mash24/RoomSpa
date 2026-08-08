"use client";

import { useEffect, useId, useRef, useState } from "react";
import { extractXStatusId, xTweetEmbedSrc } from "@/lib/media/urls";

declare global {
  interface Window {
    twttr?: {
      ready: (callback: () => void) => void;
      widgets: {
        load: (element?: HTMLElement | null) => void;
      };
    };
  }
}

let widgetsScriptPromise: Promise<void> | null = null;

function ensureTwitterWidgets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.twttr?.widgets) return Promise.resolve();

  if (!widgetsScriptPromise) {
    widgetsScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://platform.twitter.com/widgets.js"]',
      );
      if (existing) {
        const check = () => {
          if (window.twttr?.widgets) resolve();
          else setTimeout(check, 40);
        };
        existing.addEventListener("load", check);
        check();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = () => {
        if (window.twttr?.ready) window.twttr.ready(() => resolve());
        else resolve();
      };
      script.onerror = () => reject(new Error("Could not load X embed."));
      document.body.appendChild(script);
    });
  }

  return widgetsScriptPromise;
}

type Props = {
  url: string;
  title: string;
  className?: string;
};

/**
 * Embed an X/Twitter post on-site (no Storage upload).
 * 1) Try official oEmbed HTML via our API (fixes many `/i/status/…` “Not found” cases)
 * 2) Fall back to Tweet.html iframe by status ID
 */
export function XPostEmbed({ url, title, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const statusId = extractXStatusId(url);
  const iframeSrc = xTweetEmbedSrc(url);
  const [html, setHtml] = useState<string | null>(null);
  const [mode, setMode] = useState<"loading" | "oembed" | "iframe" | "error">("loading");

  useEffect(() => {
    if (!statusId) {
      setMode("error");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/media/x-oembed?url=${encodeURIComponent(url)}`);
        const data = (await res.json()) as { html?: string; error?: string };
        if (cancelled) return;

        if (res.ok && data.html) {
          setHtml(data.html);
          setMode("oembed");
          return;
        }
      } catch {
        // fall through to iframe
      }

      if (!cancelled) {
        setMode(iframeSrc ? "iframe" : "error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, statusId, iframeSrc]);

  useEffect(() => {
    if (mode !== "oembed" || !html) return;
    let cancelled = false;

    void (async () => {
      try {
        await ensureTwitterWidgets();
        if (cancelled) return;
        const el = containerRef.current;
        if (!el) return;
        if (window.twttr?.ready) {
          window.twttr.ready(() => {
            if (!cancelled) window.twttr?.widgets.load(el);
          });
        } else {
          window.twttr?.widgets.load(el);
        }
      } catch {
        if (!cancelled && iframeSrc) setMode("iframe");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, html, reactId, iframeSrc]);

  if (!statusId) {
    return (
      <div className={`rounded-sm border border-border bg-surface px-4 py-8 text-sm text-muted ${className}`}>
        This X link could not be read.
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div
        className={`flex min-h-[280px] items-center justify-center rounded-sm border border-border bg-surface text-sm text-muted ${className}`}
      >
        Loading video…
      </div>
    );
  }

  if (mode === "oembed" && html) {
    return (
      <div
        ref={containerRef}
        className={`x-post-embed overflow-hidden rounded-sm bg-surface [&_.twitter-tweet]:!mx-auto ${className}`}
        aria-label={title}
        // oEmbed HTML is from X's publish API
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (mode === "iframe" && iframeSrc) {
    return (
      <div className={`overflow-hidden rounded-sm border border-border bg-surface ${className}`}>
        <iframe
          title={title}
          src={iframeSrc}
          className="h-[520px] w-full border-0"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`rounded-sm border border-border bg-surface px-4 py-8 text-sm text-muted ${className}`}>
      This post can’t be shown here (private, deleted, or restricted by X).
    </div>
  );
}
