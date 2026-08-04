import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-32">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Coming in Phase 1</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{description}</p>
      <Link
        href="/book"
        className="mt-8 inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        Book an appointment
      </Link>
    </section>
  );
}
