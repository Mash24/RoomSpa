import Link from "next/link";

export type RelatedLink = { href: string; label: string; hint?: string };

export function RelatedLinks({
  title = "Related",
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  if (links.length === 0) return null;

  return (
    <section className="border-t border-border pt-10">
      <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block border border-border bg-surface-elevated px-4 py-3 transition hover:border-accent"
            >
              <span className="text-sm font-medium text-accent">{link.label}</span>
              {link.hint ? <span className="mt-1 block text-xs text-muted">{link.hint}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
