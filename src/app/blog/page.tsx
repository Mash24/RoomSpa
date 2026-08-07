import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/content/blog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog | Hotel massage & wellness guides",
  description:
    "Guides on hotel massage in Chiang Mai, Thai vs oil massage, couples sessions, Nuru expectations, and recovery tips.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-accent">Blog</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Guides & notes
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Practical reading for travelers and locals — how in-room massage works, which service to
        pick, and what to expect in Chiang Mai.
      </p>

      <ul className="mt-12 space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-t border-border pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{post.datePublished}</p>
            <h2 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
              <Link href={`/blog/${post.slug}`} className="transition hover:text-accent">
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 inline-flex text-sm font-medium text-accent"
            >
              Read guide
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
