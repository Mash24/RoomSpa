"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PaymentBadges, formatBookingAmount } from "@/components/payment/payment-badges";
import type { UnpaidBookingSummary } from "@/lib/booking/types";
import { redirectToUrl } from "@/lib/navigation";

export function PayForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<UnpaidBookingSummary[]>([]);
  const [searched, setSearched] = useState(false);

  async function onLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setBookings([]);
    setSearched(false);

    try {
      const response = await fetch("/api/payments/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not find bookings.");
      }

      setBookings(data.bookings || []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function onPay(bookingId: string) {
    setPayingId(bookingId);
    setError(null);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, bookingId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not start checkout.");
      }

      if (data.checkoutUrl) {
        redirectToUrl(data.checkoutUrl);
        return;
      }

      throw new Error("Checkout URL missing.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onLookup} className="space-y-4">
        <label className="block text-sm">
          <span className="text-muted">Email used when booking</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Find my booking"}
        </button>
      </form>

      <PaymentBadges />

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {searched && bookings.length === 0 ? (
        <div className="border border-border bg-surface-elevated p-5 text-sm text-muted">
          No unpaid bookings found for this email. You may have already paid, or used a different email.
          <div className="mt-4">
            <Link href="/book" className="text-accent underline">
              Make a new booking
            </Link>
          </div>
        </div>
      ) : null}

      {bookings.length > 0 ? (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking.id} className="border border-border bg-surface-elevated p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{booking.serviceName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {booking.scheduledDate} at {booking.scheduledTime}
                  </p>
                  <p className="mt-1 text-sm text-muted">Ref: {booking.referenceMasked}</p>
                  <p className="mt-2 text-sm font-medium text-accent">
                    {formatBookingAmount(booking.amountThb)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onPay(booking.id)}
                  disabled={payingId === booking.id}
                  className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {payingId === booking.id ? "Redirecting..." : "Pay by card"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
