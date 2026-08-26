"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttributionFromLocation, trackClientEvent } from "@/lib/analytics/attribution";

function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttributionFromLocation();
    const pagePath = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;
    trackClientEvent({
      eventName: "page_view",
      cta: "bootstrap",
      pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}

/** Captures first-touch UTM/referrer once per session and logs page views on navigation. */
export function AttributionBootstrap() {
  return (
    <Suspense fallback={null}>
      <AttributionTracker />
    </Suspense>
  );
}
