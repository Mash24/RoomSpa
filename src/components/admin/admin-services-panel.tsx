"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import type { AdminServiceRow } from "@/lib/admin/cms-types";
import { formatThb } from "@/lib/currency";

function priceFor(service: AdminServiceRow, minutes: 60 | 90 | 120) {
  return service.prices.find((p) => p.durationMinutes === minutes)?.priceThb ?? 0;
}

export function AdminServicesPanel() {
  const [services, setServices] = useState<AdminServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load services.");
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(service: AdminServiceRow) {
    setSavingId(service.id);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  }

  async function softDelete(service: AdminServiceRow) {
    if (!confirm(`Hide “${service.name}” from the public site?`)) return;
    setSavingId(service.id);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not hide service.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not hide service.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
            Services
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage treatments and 60 / 90 / 2-hour pricing. Edits update the public site and booking.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground"
        >
          + Add service
        </Link>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading services…</p>
      ) : (
        <div className="overflow-x-auto border border-border bg-surface-elevated">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">{DURATION_TIER_LABELS[60]}</th>
                <th className="px-3 py-3 font-medium">{DURATION_TIER_LABELS[90]}</th>
                <th className="px-3 py-3 font-medium">{DURATION_TIER_LABELS[120]}</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted">
                      {service.slug}
                      {service.featured ? " · Featured" : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-foreground">{formatThb(priceFor(service, 60))}</td>
                  <td className="px-3 py-3 text-foreground">{formatThb(priceFor(service, 90))}</td>
                  <td className="px-3 py-3 text-foreground">{formatThb(priceFor(service, 120))}</td>
                  <td className="px-3 py-3">
                    <span className={service.isActive ? "text-accent" : "text-muted"}>
                      {service.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={savingId === service.id}
                        onClick={() => void toggleActive(service)}
                        className="text-muted underline-offset-2 hover:text-accent hover:underline disabled:opacity-50"
                      >
                        {service.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        disabled={savingId === service.id}
                        onClick={() => void softDelete(service)}
                        className="text-muted underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">
              No services in the database yet. Run the CMS seed SQL, or add one manually.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
