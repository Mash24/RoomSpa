import Link from "next/link";
import { site } from "@/content/site";

export function HomeServices() {
  return (
    <section className="bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Treatments that travel with you
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Choose a session that fits how you feel — after a flight, a long workday, or a quiet evening in.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {site.services.map((service, index) => (
            <li
              key={service.slug}
              className="animate-fade-up border-t border-border pt-6"
              style={{ animationDelay: `${0.08 * index}s` }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                  {service.title}
                </h3>
                <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                  {service.duration}
                </span>
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
                {service.summary}
              </p>
              <Link
                href={`/services#${service.slug}`}
                className="mt-5 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
              >
                Learn more
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
