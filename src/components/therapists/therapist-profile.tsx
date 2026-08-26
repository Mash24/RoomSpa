import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { CatalogService } from "@/content/services";
import { productPriceLabel, getServicePriceTiers } from "@/content/services";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import {
  formatAvailableLocations,
  formatTherapistHeadline,
  therapistPrimaryPhoto,
} from "@/lib/therapists/public";
import { getServicePath } from "@/lib/catalog/service-paths";
import { anyoneBookHref, therapistBookHref } from "@/lib/therapists/booking-links";
import type { PublicTherapist } from "@/lib/therapists/types";

type Props = {
  therapist: PublicTherapist;
  catalog: CatalogService[];
  dark?: boolean;
};

export function TherapistProfile({ therapist, catalog, dark = false }: Props) {
  const primary = therapistPrimaryPhoto(therapist);
  const gallery = therapist.media.filter((m) => m.type === "photo");
  const headline = formatTherapistHeadline(therapist);
  const bookHref = therapistBookHref(therapist.id, { serviceFallback: therapist.serviceSlugs[0] });
  const bookAnyoneHref = anyoneBookHref({ service: therapist.serviceSlugs[0] });

  const textMain = dark ? "text-[#f5f0e8]" : "text-foreground";
  const textMuted = dark ? "text-[#f5f0e8]/75" : "text-muted";
  const textAccent = dark ? "text-[#c9a86c]" : "text-accent";
  const labelClass = `text-xs font-medium uppercase tracking-[0.16em] ${dark ? "text-[#c9a86c]" : "text-muted"}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Therapists", href: "/therapists" },
          { label: therapist.displayName },
        ]}
      />

      {/* Gallery */}
      <div className="mt-8">
        {primary ? (
          <div
            className={`relative aspect-[4/5] overflow-hidden rounded-sm sm:aspect-[16/10] ${
              dark ? "bg-[#161311] ring-1 ring-[#c9a86c]/20" : "bg-surface ring-1 ring-border"
            }`}
          >
            <Image
              src={primary}
              alt={therapist.displayName}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
        {gallery.length > 1 ? (
          <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {gallery.slice(0, 5).map((photo) => (
              <li
                key={photo.id}
                className={`relative aspect-square overflow-hidden rounded-sm ${
                  dark ? "ring-1 ring-[#c9a86c]/15" : "ring-1 ring-border"
                }`}
              >
                <Image src={photo.url} alt="" fill sizes="100px" className="object-cover" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={`font-display text-4xl tracking-tight md:text-5xl ${textMain}`}>
            {therapist.displayName}
          </h1>
          {therapist.verified ? (
            <span className={`text-sm font-medium ${textAccent}`}>✓ Verified</span>
          ) : null}
        </div>
        {headline ? <p className={`mt-2 text-base ${textMuted}`}>{headline}</p> : null}
        {therapist.height ? <p className={`mt-1 text-sm ${textMuted}`}>{therapist.height}</p> : null}
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
              <li
                key={area}
                className={`rounded-sm px-3 py-1.5 text-sm ring-1 ${
                  dark ? "ring-[#c9a86c]/25" : "ring-border"
                }`}
              >
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

      <section className="mt-10">
        <h2 className={labelClass}>Services</h2>
        <ul className={`mt-4 divide-y ${dark ? "divide-[#c9a86c]/15" : "divide-border"}`}>
          {therapist.serviceSlugs.map((slug, i) => {
            const svc = catalog.find((c) => c.slug === slug);
            const from = svc ? productPriceLabel(getServicePriceTiers(svc)[60]) : null;
            return (
              <li key={slug} className="flex items-center justify-between gap-4 py-3">
                <Link
                  href={svc ? getServicePath(svc) : `/services/${slug}`}
                  className={`text-sm font-medium hover:underline ${textMain}`}
                >
                  {therapist.serviceNames[i] ?? slug}
                </Link>
                {from ? <span className={`text-sm ${textAccent}`}>From {from}</span> : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`mt-10 rounded-sm border p-5 ${dark ? "border-[#c9a86c]/20 bg-[#161311]/50" : "border-border bg-surface-elevated/50"}`}>
        <h2 className={labelClass}>Availability</h2>
        <p className={`mt-2 text-sm ${textMuted}`}>
          Per-slot availability is coming soon. Book now and we&apos;ll confirm your therapist and time — or
          message us on WhatsApp for same-day requests.
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap">
        <Link
          href={bookHref}
          className={`inline-flex min-h-12 items-center justify-center rounded-sm px-5 py-3 text-sm font-medium ${
            dark ? "sensual-btn-primary" : "bg-accent text-accent-foreground"
          }`}
        >
          Book with {therapist.displayName.split(" ")[0]}
        </Link>
        <Link
          href={bookAnyoneHref}
          className={`inline-flex min-h-12 items-center justify-center rounded-sm border px-5 py-3 text-sm ${
            dark ? "sensual-btn-outline" : "border-border hover:border-accent"
          }`}
        >
          Book anyone available
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

      <p className={`mt-4 text-xs ${textMuted}`}>
        Coverage: {formatAvailableLocations(therapist)}. Your exact address is never shared with other clients.
      </p>
    </article>
  );
}
