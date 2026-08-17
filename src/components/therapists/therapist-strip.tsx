import Link from "next/link";
import type { PublicTherapist } from "@/lib/therapists/types";
import { TherapistCard } from "@/components/therapists/therapist-card";

type Props = {
  title: string;
  therapists: PublicTherapist[];
  dark?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
};

export function TherapistStrip({
  title,
  therapists,
  dark = false,
  viewAllHref,
  emptyMessage = "Therapists for this service will appear here soon.",
}: Props) {
  if (therapists.length === 0) return null;

  return (
    <section className={`mt-14 border-t pt-8 ${dark ? "border-[#c9a86c]/15" : "border-border"}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className={`font-display text-2xl tracking-tight md:text-3xl ${dark ? "text-[#f5f0e8]" : "text-foreground"}`}>
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className={`text-sm underline-offset-4 hover:underline ${dark ? "text-[#c9a86c]" : "text-accent"}`}
          >
            View all →
          </Link>
        ) : null}
      </div>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => (
          <li key={therapist.id}>
            <TherapistCard therapist={therapist} dark={dark} />
          </li>
        ))}
      </ul>
      {therapists.length === 0 ? (
        <p className={`mt-4 text-sm ${dark ? "text-[#f5f0e8]/60" : "text-muted"}`}>{emptyMessage}</p>
      ) : null}
    </section>
  );
}
