"use client";

import { useEffect, useId, useRef } from "react";
import { normalizeXStatusUrl } from "@/lib/media/urls";

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
        if (window.twttr?.ready) {
          window.twttr.ready(() => resolve());
        } else {
          resolve();
        }
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

/** Official X/Twitter post embed — plays on-site without storing the video. */
export function XPostEmbed({ url, title, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const embedUrl = normalizeXStatusUrl(url);

  useEffect(() => {
    if (!embedUrl) return;
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
        // Keep the blockquote link as a last-resort fallback.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [embedUrl, reactId]);

  if (!embedUrl) return null;

  return (
    <div
      ref={containerRef}
      className={`x-post-embed overflow-hidden rounded-sm bg-surface [&_.twitter-tweet]:!mx-auto ${className}`}
      aria-label={title}
    >
      <blockquote
        className="twitter-tweet"
        data-conversation="none"
        data-dnt="true"
        data-media-max-width="560"
        data-theme="light"
      >
        <a href={embedUrl}>Watch</a>
      </blockquote>
    </div>
  );
}
