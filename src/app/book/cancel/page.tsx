import Link from "next/link";
import type { Metadata } from "next";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your RoomSpa checkout was cancelled. You can try again anytime.",
};

type CancelPageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function BookingCancelPage({ searchParams }: CancelPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-2xl px-5 py-24 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Checkout</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Payment cancelled
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        No charge was made
        {params.ref ? (
          <>
            {" "}
            for reference <span className="font-medium text-foreground">{params.ref}</span>
          </>
        ) : null}
        . You can complete payment whenever you’re ready.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Try booking again
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Ask on WhatsApp
        </a>
      </div>
    </section>
  );
}
