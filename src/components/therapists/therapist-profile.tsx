import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TherapistPhotoGallery } from "@/components/therapists/therapist-photo-gallery";
import type { CatalogService } from "@/content/services";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { formatTherapistHeadline } from "@/lib/therapists/public";
import { getServicePath } from "@/lib/catalog/service-paths";
import { anyoneBookHref, therapistBookHref } from "@/lib/therapists/booking-links";
import type { PublicTherapist } from "@/lib/therapists/types";

type Props = {
  therapist: PublicTherapist;
  catalog: CatalogService[];
  dark?: boolean;
};

export function TherapistProfile({ therapist, catalog, dark = false }: Props) {
  const gallery = therapist.media.filter((m) => m.type === "photo");
  const headline = formatTherapistHeadline(therapist);
  const firstName = therapist.displayName.split(" ")[0] || therapist.displayName;
  const bookHref = therapistBookHref(therapist.id, { serviceFallback: therapist.serviceSlugs[0] });
  const bookAnyoneHref = anyoneBookHref({ service: therapist.serviceSlugs[0] });
  const languages = therapist.languages?.length ? therapist.languages.join(" · ") : null;
  const experience =
    therapist.yearsExperience != null
      ? `${therapist.yearsExperience} year${therapist.yearsExperience === 1 ? "" : "s"} experience`
      : null;

  const textMain = dark ? "text-[#F5F1E8]" : "text-foreground";
  const textMuted = dark ? "text-[#B8B0A3]" : "text-muted";
  const textAccent = dark ? "text-[#C8A96B]" : "text-accent";
  const labelClass = `text-xs font-medium uppercase tracking-[0.16em] ${dark ? "text-[#C8A96B]" : "text-muted"}`;
  const ring = dark ? "ring-[rgba(200,169,107,0.25)]" : "ring-border";

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
        {headline ? <p className={`mt-2 text-base ${textMuted}`}>{headline}</p> : null}
        <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm ${textMuted}`}>
          {languages ? <span>{languages}</span> : null}
          {experience ? <span>{experience}</span> : null}
          {therapist.height ? <span>{therapist.height}</span> : null}
        </div>
      </header>

      <section className="mt-8">
        <h2 className={labelClass}>Available in</h2>
        <dl className={`mt-3 grid gap-3 text-base ${textMain} sm:grid-cols-2`}>
          {therapist.city ? (
            <div>
              <dt className={`text-xs uppercase tracking-[0.12em] ${textMuted}`}>City</dt>
              <dd className="mt-1">{therapist.city}</dd>
            </div>
          ) : null}
          {therapist.region ? (
            <div>
              <dt className={`text-xs uppercase tracking-[0.12em] ${textMuted}`}>Province / state</dt>
              <dd className="mt-1">{therapist.region}</dd>
            </div>
          ) : null}
          {therapist.country ? (
            <div>
              <dt className={`text-xs uppercase tracking-[0.12em] ${textMuted}`}>Country</dt>
              <dd className="mt-1">{therapist.country}</dd>
            </div>
          ) : null}
        </dl>
        {!therapist.city && !therapist.region && !therapist.country ? (
          <p className={`mt-3 text-base ${textMain}`}>Location coming soon</p>
        ) : null}
        {therapist.areaSummary ? (
          <p className={`mt-3 text-sm ${textMuted}`}>
            <span className={`block text-xs uppercase tracking-[0.12em] ${textMuted}`}>Neighbourhood</span>
            <span className={`mt-1 block ${textMain}`}>{therapist.areaSummary}</span>
          </p>
        ) : null}
        {therapist.serviceAreaNames.length > 0 ? (
          <ul className={`mt-3 flex flex-wrap gap-2 ${textMain}`}>
            {therapist.serviceAreaNames.map((area) => (
              <li key={area} className={`rounded-sm px-3 py-1.5 text-sm ring-1 ${ring}`}>
                {area}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {therapist.bio ? (
        <section className="mt-10">
          <h2 className={labelClass}>About</h2>
          <p className={`mt-3 text-sm leading-relaxed md:text-base ${textMuted}`}>{therapist.bio}</p>
        </section>
      ) : null}

      {therapist.training ? (
        <section className="mt-8">
          <h2 className={labelClass}>Training</h2>
          <p className={`mt-3 text-sm leading-relaxed ${textMuted}`}>{therapist.training}</p>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className={labelClass}>Services</h2>
        <ul className={`mt-4 divide-y ${dark ? "divide-[rgba(200,169,107,0.15)]" : "divide-border"}`}>
          {therapist.serviceSlugs.map((slug, i) => {
            const svc = catalog.find((c) => c.slug === slug);
            return (
              <li key={slug} className="flex items-center justify-between gap-4 py-3">
                <Link
                  href={svc ? getServicePath(svc) : `/services/${slug}`}
                  className={`text-sm font-medium hover:underline ${textMain}`}
                >
                  {therapist.serviceNames[i] ?? slug}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className={`mt-3 text-sm ${textMuted}`}>
          Availability is confirmed when you request a booking — we don’t show live calendars here.
        </p>
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
