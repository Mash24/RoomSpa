import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import { getPublishedBlogPosts } from "@/lib/blog/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog | Massage articles Chiang Mai",
  description:
    "Articles on in-room massage, treatments, wellness travel, Chiang Mai areas, and consent-led sensual bodywork.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const byCategory = BLOG_CATEGORIES.map((category) => ({
    ...category,
    posts: posts.filter((post) => post.category === category.slug),
  })).filter((category) => category.posts.length > 0);

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
        Articles
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Stories and guides about in-room massage in Chiang Mai. Browse a category, then open a title
        to read the full article. Quick questions live on the FAQ.
      </p>

      {byCategory.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Articles coming soon.</p>
      ) : (
        <div className="mt-12 space-y-14">
          {byCategory.map((category) => (
            <section key={category.slug}>
              <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                {category.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {category.posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center justify-between gap-4 py-4 transition hover:text-accent"
                    >
                      <span className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                        {post.title}
                      </span>
                      <span aria-hidden className="shrink-0 text-muted">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
