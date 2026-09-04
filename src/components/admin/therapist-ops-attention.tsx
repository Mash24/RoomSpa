"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ATTENTION_LABELS,
  therapistAttentionReasons,
} from "@/lib/therapists/admin-ops";
import type { AdminTherapistRow } from "@/lib/therapists/types";

export function TherapistOpsAttention() {
  const [items, setItems] = useState<
    Array<{ id: string; name: string; reasons: string[] }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/therapists");
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const rows = (data.therapists || []) as AdminTherapistRow[];
        const attention = rows
          .map((t) => {
            const reasons = therapistAttentionReasons(t);
            return {
              id: t.id,
              name: t.displayName,
              reasons: reasons.map((r) => ATTENTION_LABELS[r]),
            };
          })
          .filter((t) => t.reasons.length > 0)
          .slice(0, 8);
        setItems(attention);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Checking therapist ops…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="admin-card p-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Therapists requiring attention
        </h2>
        <p className="mt-2 text-sm text-foreground">All clear — no ops backlog.</p>
        <Link href="/admin/therapists" className="mt-3 inline-block text-sm text-accent hover:underline">
          Open therapists →
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Therapists requiring attention
        </h2>
        <Link href="/admin/therapists" className="text-xs text-accent hover:underline">
          View all →
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="mt-0.5 text-xs text-amber-800">{item.reasons.join(" · ")}</p>
            </div>
            <Link
              href={`/admin/therapists/${item.id}`}
              className="shrink-0 text-sm text-accent hover:underline"
            >
              Review
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
