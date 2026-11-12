import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TherapistPhotoGallery } from "@/components/therapists/therapist-photo-gallery";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { anyoneBookHref, therapistBookHref } from "@/lib/therapists/booking-links";
import type { PublicTherapist } from "@/lib/therapists/types";

type Props = {
  therapist: PublicTherapist;
  dark?: boolean;
};

export function TherapistProfile({ therapist, dark = false }: Props) {
  const gallery = therapist.media.filter((m) => m.type === "photo");
  const firstName = therapist.displayName.split(" ")[0] || therapist.displayName;
  const bookHref = therapistBookHref(therapist.id, { serviceFallback: therapist.serviceSlugs[0] });
  const bookAnyoneHref = anyoneBookHref({ service: therapist.serviceSlugs[0] });

  const textMain = dark ? "text-[#F5F1E8]" : "text-foreground";
  const textAccent = dark ? "text-[#C8A96B]" : "text-accent";
  const labelClass = `text-xs font-medium uppercase tracking-[0.16em] ${dark ? "text-[#C8A96B]" : "text-muted"}`;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-28 pt-12 xs:px-5 md:px-8 md:pb-24 md:pt-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Therapists", href: "/therapists" },
          { label: therapist.displayName },
        ]}
      />

      <div className="mt-8">
        <TherapistPhotoGallery photos={gallery} displayName={therapist.displayName} dark={dark} />
      </div>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={`font-display text-4xl tracking-tight md:text-5xl ${textMain}`}>
            {therapist.displayName}
          </h1>
          {therapist.verified ? (
            <span className={`text-sm font-medium ${textAccent}`}>Verified</span>
          ) : null}
        </div>
        <p className={`mt-4 max-w-md text-sm leading-relaxed ${dark ? "text-[#B8B0A3]" : "text-muted"}`}>
          Thoughtfully selected for private, in-room experiences arranged around your stay.
        </p>
      </header>

      <section className="mt-8">
        <h2 className={labelClass}>City</h2>
        <dl className={`mt-3 text-base ${textMain}`}>
          {therapist.city ? (
            <div>
              <dd className="mt-1">{therapist.city}</dd>
            </div>
          ) : null}
        </dl>
        {!therapist.city ? (
          <p className={`mt-3 text-base ${textMain}`}>Location coming soon</p>
        ) : null}
      </section>

      {/* Desktop CTAs */}
      <div className="mt-10 hidden flex-col gap-2.5 md:flex md:flex-row md:flex-wrap">
        {therapist.acceptingBookings ? (
          <Link
            href={bookHref}
            className={`inline-flex min-h-12 items-center justify-center rounded-sm px-5 py-3 text-sm font-medium ${
              dark ? "sensual-btn-primary" : "bg-accent text-accent-foreground"
            }`}
          >
            Request this therapist
          </Link>
        ) : (
          <p
            className={`inline-flex min-h-12 items-center rounded-sm border px-5 py-3 text-sm ${
              dark ? "border-[rgba(200,169,107,0.25)] text-[#B8B0A3]" : "border-border text-muted"
            }`}
          >
            Currently not accepting bookings
          </p>
        )}
        <Link
          href={bookAnyoneHref}
          className={`inline-flex min-h-12 items-center justify-center rounded-sm border px-5 py-3 text-sm ${
            dark ? "sensual-btn-outline" : "border-border hover:border-accent"
          }`}
        >
          Match me with anyone
        </Link>
        <WhatsAppLink
          cta="therapist-profile"
          className={`inline-flex min-h-12 items-center justify-center rounded-sm border px-5 py-3 text-sm ${
            dark ? "sensual-btn-outline" : "border-border hover:border-accent"
          }`}
        >
          WhatsApp
        </WhatsAppLink>
      </div>

      {/* Sticky mobile CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 md:hidden ${
          dark
            ? "border-[rgba(200,169,107,0.2)] bg-[#11100F]/95 backdrop-blur-md"
            : "border-border bg-background/95 backdrop-blur-md"
        }`}
      >
        {therapist.acceptingBookings ? (
          <Link
            href={bookHref}
            className={`flex min-h-12 w-full items-center justify-center rounded-sm text-sm font-medium ${
              dark ? "sensual-btn-primary" : "bg-accent text-accent-foreground"
            }`}
          >
            Request {firstName}
          </Link>
        ) : (
          <p className={`py-3 text-center text-sm ${dark ? "text-[#B8B0A3]" : "text-muted"}`}>
            Currently not accepting bookings
          </p>
        )}
      </div>
    </article>
  );
}
