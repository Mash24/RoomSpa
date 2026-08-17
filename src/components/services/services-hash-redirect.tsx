"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy hash links → dedicated experience pages. */
export function ServicesHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.toLowerCase();
    if (hash === "#sensual" || hash === "#signature") {
      router.replace("/services/signature");
    } else if (hash === "#classic" || hash === "#wellness") {
      router.replace("/services/wellness");
    }
  }, [router]);

  return null;
}
