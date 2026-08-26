"use client";

import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { readAttribution, trackClientEvent } from "@/lib/analytics/attribution";
import { buildWhatsAppHref, defaultWhatsAppHref } from "@/lib/analytics/whatsapp";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  cta: string;
  cityHint?: string;
  serviceSlug?: string;
  /** Custom wa.me URL (e.g. booking confirm). Still logs the click. */
  hrefOverride?: string;
};

function currentPath() {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

/** WhatsApp CTA that stamps source/landing into the prefilled message and logs the click. */
export function WhatsAppLink({
  cta,
  cityHint,
  serviceSlug,
  hrefOverride,
  onClick,
  onPointerDown,
  children,
  ...rest
}: Props) {
  const [href, setHref] = useState(() => hrefOverride ?? defaultWhatsAppHref(cta));

  useEffect(() => {
    if (hrefOverride) {
      setHref(hrefOverride);
      return;
    }
    setHref(
      buildWhatsAppHref({
        cta,
        cityHint,
        serviceSlug,
        attribution: readAttribution(),
        pagePath: currentPath(),
      }),
    );
  }, [cta, cityHint, serviceSlug, hrefOverride]);

  function logClick() {
    trackClientEvent({
      eventName: "whatsapp_click",
      cta,
      cityHint,
      serviceSlug,
      pagePath: currentPath(),
    });
  }

  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noreferrer"
      onPointerDown={(event) => {
        // Fire early — mobile browsers often navigate away before click handlers finish.
        logClick();
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        logClick();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
