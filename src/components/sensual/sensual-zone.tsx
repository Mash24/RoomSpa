import type { ReactNode } from "react";

/** Full-page dark shell for signature-only routes — no wellness green palette. */
export function SignatureZone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`signature-zone sensual-zone min-h-full ${className}`}>{children}</div>;
}

/** @deprecated Use SignatureZone */
export const SensualZone = SignatureZone;
